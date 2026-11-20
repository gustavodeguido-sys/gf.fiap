package br.com.fiap.fintech.service;

import br.com.fiap.fintech.dto.InvestimentoRequestDTO;
import br.com.fiap.fintech.dto.InvestimentoResponseDTO;
import br.com.fiap.fintech.exception.RecursoNaoEncontradoException;
import br.com.fiap.fintech.exception.RegraNegocioException;
import br.com.fiap.fintech.model.ContaBancaria;
import br.com.fiap.fintech.model.Investimento;
import br.com.fiap.fintech.model.TipoInvestimento;
import br.com.fiap.fintech.repository.ContaBancariaRepository;
import br.com.fiap.fintech.repository.InvestimentoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.EnumSet;
import java.util.List;
import java.util.Set;

@Service
@Transactional(readOnly = true)
public class InvestimentoService {

    private static final Set<TipoInvestimento> TIPOS_SEM_VENCIMENTO =
            EnumSet.of(TipoInvestimento.ACOES, TipoInvestimento.FUNDO);

    private final InvestimentoRepository investimentoRepository;
    private final ContaBancariaRepository contaBancariaRepository;

    public InvestimentoService(InvestimentoRepository investimentoRepository,
                               ContaBancariaRepository contaBancariaRepository) {
        this.investimentoRepository = investimentoRepository;
        this.contaBancariaRepository = contaBancariaRepository;
    }

    public List<InvestimentoResponseDTO> listar() {
        return investimentoRepository.findAll().stream()
                .map(InvestimentoResponseDTO::deEntidade)
                .toList();
    }

    public InvestimentoResponseDTO buscarPorId(Long id) {
        return InvestimentoResponseDTO.deEntidade(buscarEntidade(id));
    }

    public List<InvestimentoResponseDTO> listarPorConta(Long idConta) {
        if (!contaBancariaRepository.existsById(idConta)) {
            throw contaNaoEncontrada(idConta);
        }
        return investimentoRepository.findByContaBancariaId(idConta).stream()
                .map(InvestimentoResponseDTO::deEntidade)
                .toList();
    }

    @Transactional
    public InvestimentoResponseDTO criar(InvestimentoRequestDTO dto) {
        ContaBancaria conta = contaBancariaRepository.buscarPorIdComBloqueio(dto.idConta())
                .orElseThrow(() -> contaNaoEncontrada(dto.idConta()));

        BigDecimal valor = dto.valorAplicado();
        validarValorPositivo(valor);
        validarTaxa(dto.taxaRentabilidade());

        LocalDate dataAplicacao = dto.dataAplicacao() == null ? LocalDate.now() : dto.dataAplicacao();
        validarDatas(dto.tipo(), dataAplicacao, dto.dataVencimento(), conta);

        if (valor.compareTo(conta.getSaldo()) > 0) {
            throw saldoInsuficiente(conta.getSaldo(), valor);
        }
        conta.setSaldo(conta.getSaldo().subtract(valor));

        Investimento investimento = new Investimento();
        investimento.setContaBancaria(conta);
        investimento.setNome(dto.nome().trim());
        investimento.setTipo(dto.tipo());
        investimento.setValorAplicado(valor);
        investimento.setTaxaRentabilidade(dto.taxaRentabilidade());
        investimento.setDataAplicacao(dataAplicacao);
        investimento.setDataVencimento(dto.dataVencimento());

        return InvestimentoResponseDTO.deEntidade(investimentoRepository.save(investimento));
    }

    @Transactional
    public InvestimentoResponseDTO atualizar(Long id, InvestimentoRequestDTO dto) {
        Investimento investimento = buscarEntidade(id);
        Long idContaAtual = investimento.getContaBancaria().getId();

        if (!idContaAtual.equals(dto.idConta())) {
            throw new RegraNegocioException("Não é permitido mover o investimento para outra conta");
        }

        ContaBancaria conta = contaBancariaRepository.buscarPorIdComBloqueio(idContaAtual)
                .orElseThrow(() -> contaNaoEncontrada(idContaAtual));

        BigDecimal novoValor = dto.valorAplicado();
        validarValorPositivo(novoValor);
        validarTaxa(dto.taxaRentabilidade());

        LocalDate dataAplicacao = dto.dataAplicacao() == null
                ? investimento.getDataAplicacao()
                : dto.dataAplicacao();
        validarDatas(dto.tipo(), dataAplicacao, dto.dataVencimento(), conta);

        BigDecimal diferenca = novoValor.subtract(investimento.getValorAplicado());
        if (diferenca.compareTo(conta.getSaldo()) > 0) {
            throw saldoInsuficiente(conta.getSaldo(), diferenca);
        }
        conta.setSaldo(conta.getSaldo().subtract(diferenca));

        investimento.setNome(dto.nome().trim());
        investimento.setTipo(dto.tipo());
        investimento.setValorAplicado(novoValor);
        investimento.setTaxaRentabilidade(dto.taxaRentabilidade());
        investimento.setDataAplicacao(dataAplicacao);
        investimento.setDataVencimento(dto.dataVencimento());

        return InvestimentoResponseDTO.deEntidade(investimento);
    }

    @Transactional
    public void excluir(Long id) {
        Investimento investimento = buscarEntidade(id);
        Long idConta = investimento.getContaBancaria().getId();

        ContaBancaria conta = contaBancariaRepository.buscarPorIdComBloqueio(idConta)
                .orElseThrow(() -> contaNaoEncontrada(idConta));

        conta.setSaldo(conta.getSaldo().add(investimento.getValorAplicado()));
        investimentoRepository.delete(investimento);
    }

    private Investimento buscarEntidade(Long id) {
        return investimentoRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException(
                        "Investimento com id " + id + " não encontrado"));
    }

    private void validarValorPositivo(BigDecimal valor) {
        if (valor == null || valor.signum() <= 0) {
            throw new RegraNegocioException("O valor aplicado deve ser maior que zero");
        }
        if (valor.scale() > 2) {
            throw new RegraNegocioException("O valor aplicado deve ter no máximo 2 casas decimais");
        }
    }

    private void validarTaxa(BigDecimal taxa) {
        if (taxa == null || taxa.signum() < 0) {
            throw new RegraNegocioException("A taxa de rentabilidade não pode ser negativa");
        }
    }

    private void validarDatas(TipoInvestimento tipo, LocalDate dataAplicacao,
                              LocalDate dataVencimento, ContaBancaria conta) {
        if (dataAplicacao.isAfter(LocalDate.now())) {
            throw new RegraNegocioException("A data de aplicação não pode estar no futuro");
        }
        if (dataAplicacao.isBefore(conta.getDataAbertura())) {
            throw new RegraNegocioException("A data de aplicação não pode ser anterior à abertura da conta");
        }

        boolean semVencimento = TIPOS_SEM_VENCIMENTO.contains(tipo);
        if (semVencimento && dataVencimento != null) {
            throw new RegraNegocioException("Investimentos do tipo " + tipo + " não têm data de vencimento");
        }
        if (!semVencimento && dataVencimento == null) {
            throw new RegraNegocioException("Investimentos do tipo " + tipo + " precisam de data de vencimento");
        }
        if (dataVencimento != null && !dataVencimento.isAfter(dataAplicacao)) {
            throw new RegraNegocioException("A data de vencimento deve ser posterior à data de aplicação");
        }
    }

    private RecursoNaoEncontradoException contaNaoEncontrada(Long idConta) {
        return new RecursoNaoEncontradoException("Conta bancária com id " + idConta + " não encontrada");
    }

    private RegraNegocioException saldoInsuficiente(BigDecimal saldo, BigDecimal valorNecessario) {
        return new RegraNegocioException("Saldo insuficiente na conta. Saldo atual: R$ "
                + saldo.toPlainString() + ", valor necessário: R$ " + valorNecessario.toPlainString());
    }
}
