package br.com.fiap.fintech.dto;

import br.com.fiap.fintech.model.Investimento;
import br.com.fiap.fintech.model.TipoInvestimento;

import java.math.BigDecimal;
import java.time.LocalDate;

public record InvestimentoResponseDTO(
        Long id,
        Long idConta,
        String nome,
        TipoInvestimento tipo,
        BigDecimal valorAplicado,
        BigDecimal taxaRentabilidade,
        LocalDate dataAplicacao,
        LocalDate dataVencimento
) {

    public static InvestimentoResponseDTO deEntidade(Investimento investimento) {
        return new InvestimentoResponseDTO(
                investimento.getId(),
                investimento.getContaBancaria().getId(),
                investimento.getNome(),
                investimento.getTipo(),
                investimento.getValorAplicado(),
                investimento.getTaxaRentabilidade(),
                investimento.getDataAplicacao(),
                investimento.getDataVencimento()
        );
    }
}
