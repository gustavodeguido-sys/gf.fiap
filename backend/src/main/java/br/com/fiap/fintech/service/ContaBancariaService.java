package br.com.fiap.fintech.service;

import br.com.fiap.fintech.dto.ContaBancariaRequestDTO;
import br.com.fiap.fintech.dto.ContaBancariaResponseDTO;
import br.com.fiap.fintech.exception.RecursoDuplicadoException;
import br.com.fiap.fintech.exception.RecursoNaoEncontradoException;
import br.com.fiap.fintech.exception.RegraNegocioException;
import br.com.fiap.fintech.model.ContaBancaria;
import br.com.fiap.fintech.model.Usuario;
import br.com.fiap.fintech.repository.ContaBancariaRepository;
import br.com.fiap.fintech.repository.InvestimentoRepository;
import br.com.fiap.fintech.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class ContaBancariaService {

    private final ContaBancariaRepository contaBancariaRepository;
    private final UsuarioRepository usuarioRepository;
    private final InvestimentoRepository investimentoRepository;

    public ContaBancariaService(ContaBancariaRepository contaBancariaRepository,
                                UsuarioRepository usuarioRepository,
                                InvestimentoRepository investimentoRepository) {
        this.contaBancariaRepository = contaBancariaRepository;
        this.usuarioRepository = usuarioRepository;
        this.investimentoRepository = investimentoRepository;
    }

    public List<ContaBancariaResponseDTO> listar() {
        return contaBancariaRepository.findAll().stream()
                .map(ContaBancariaResponseDTO::deEntidade)
                .toList();
    }

    public ContaBancariaResponseDTO buscarPorId(Long id) {
        return ContaBancariaResponseDTO.deEntidade(buscarEntidade(id));
    }

    public List<ContaBancariaResponseDTO> listarPorUsuario(Long idUsuario) {
        if (!usuarioRepository.existsById(idUsuario)) {
            throw new RecursoNaoEncontradoException("Usuário com id " + idUsuario + " não encontrado");
        }
        return contaBancariaRepository.findByUsuarioId(idUsuario).stream()
                .map(ContaBancariaResponseDTO::deEntidade)
                .toList();
    }

    @Transactional
    public ContaBancariaResponseDTO criar(ContaBancariaRequestDTO dto) {
        Usuario usuario = usuarioRepository.findById(dto.idUsuario())
                .orElseThrow(() -> new RecursoNaoEncontradoException(
                        "Usuário com id " + dto.idUsuario() + " não encontrado"));

        String nomeBanco = dto.nomeBanco().trim();
        String agencia = dto.agencia().trim();
        String numeroConta = dto.numeroConta().trim();

        if (contaBancariaRepository.existsByNomeBancoAndAgenciaAndNumeroConta(nomeBanco, agencia, numeroConta)) {
            throw new RecursoDuplicadoException("Já existe uma conta cadastrada com este banco, agência e número");
        }

        BigDecimal saldoInicial = dto.saldoInicial() == null ? BigDecimal.ZERO : dto.saldoInicial();
        if (saldoInicial.signum() < 0) {
            throw new RegraNegocioException("O saldo inicial não pode ser negativo");
        }

        LocalDate dataAbertura = dto.dataAbertura() == null ? LocalDate.now() : dto.dataAbertura();
        if (dataAbertura.isAfter(LocalDate.now())) {
            throw new RegraNegocioException("A data de abertura não pode estar no futuro");
        }
        if (dataAbertura.isBefore(usuario.getDataNascimento())) {
            throw new RegraNegocioException("A data de abertura não pode ser anterior ao nascimento do usuário");
        }

        ContaBancaria conta = new ContaBancaria();
        conta.setUsuario(usuario);
        conta.setNomeBanco(nomeBanco);
        conta.setAgencia(agencia);
        conta.setNumeroConta(numeroConta);
        conta.setTipo(dto.tipo());
        conta.setSaldo(saldoInicial);
        conta.setDataAbertura(dataAbertura);

        return ContaBancariaResponseDTO.deEntidade(contaBancariaRepository.save(conta));
    }

    @Transactional
    public ContaBancariaResponseDTO atualizar(Long id, ContaBancariaRequestDTO dto) {
        ContaBancaria conta = buscarEntidade(id);

        if (!conta.getUsuario().getId().equals(dto.idUsuario())) {
            throw new RegraNegocioException("Não é permitido transferir a conta para outro usuário");
        }

        String nomeBanco = dto.nomeBanco().trim();
        String agencia = dto.agencia().trim();
        String numeroConta = dto.numeroConta().trim();

        if (contaBancariaRepository.existsByNomeBancoAndAgenciaAndNumeroContaAndIdNot(
                nomeBanco, agencia, numeroConta, id)) {
            throw new RecursoDuplicadoException("Já existe outra conta cadastrada com este banco, agência e número");
        }

        conta.setNomeBanco(nomeBanco);
        conta.setAgencia(agencia);
        conta.setNumeroConta(numeroConta);
        conta.setTipo(dto.tipo());

        return ContaBancariaResponseDTO.deEntidade(conta);
    }

    @Transactional
    public ContaBancariaResponseDTO depositar(Long id, BigDecimal valor) {
        validarValorPositivo(valor);
        ContaBancaria conta = buscarEntidadeComBloqueio(id);

        conta.setSaldo(conta.getSaldo().add(valor));

        return ContaBancariaResponseDTO.deEntidade(conta);
    }

    @Transactional
    public ContaBancariaResponseDTO sacar(Long id, BigDecimal valor) {
        validarValorPositivo(valor);
        ContaBancaria conta = buscarEntidadeComBloqueio(id);

        if (conta.getSaldo().compareTo(valor) < 0) {
            throw new RegraNegocioException("Saldo insuficiente. Saldo atual: R$ "
                    + conta.getSaldo().toPlainString() + ", valor do saque: R$ " + valor.toPlainString());
        }

        conta.setSaldo(conta.getSaldo().subtract(valor));

        return ContaBancariaResponseDTO.deEntidade(conta);
    }

    @Transactional
    public void excluir(Long id) {
        ContaBancaria conta = buscarEntidadeComBloqueio(id);

        if (investimentoRepository.existsByContaBancariaId(id)) {
            throw new RegraNegocioException(
                    "Não é possível excluir a conta: ela ainda possui investimentos. Resgate-os antes.");
        }
        if (conta.getSaldo().signum() != 0) {
            throw new RegraNegocioException("Não é possível excluir uma conta com saldo. Saque os R$ "
                    + conta.getSaldo().toPlainString() + " antes de encerrá-la.");
        }

        contaBancariaRepository.delete(conta);
    }

    private ContaBancaria buscarEntidade(Long id) {
        return contaBancariaRepository.findById(id)
                .orElseThrow(() -> naoEncontrada(id));
    }

    private ContaBancaria buscarEntidadeComBloqueio(Long id) {
        return contaBancariaRepository.buscarPorIdComBloqueio(id)
                .orElseThrow(() -> naoEncontrada(id));
    }

    private RecursoNaoEncontradoException naoEncontrada(Long id) {
        return new RecursoNaoEncontradoException("Conta bancária com id " + id + " não encontrada");
    }

    private void validarValorPositivo(BigDecimal valor) {
        if (valor == null || valor.signum() <= 0) {
            throw new RegraNegocioException("O valor deve ser maior que zero");
        }
        if (valor.scale() > 2) {
            throw new RegraNegocioException("O valor deve ter no máximo 2 casas decimais");
        }
    }
}
