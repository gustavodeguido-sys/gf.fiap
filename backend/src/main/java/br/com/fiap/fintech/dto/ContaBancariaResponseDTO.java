package br.com.fiap.fintech.dto;

import br.com.fiap.fintech.model.ContaBancaria;
import br.com.fiap.fintech.model.TipoConta;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ContaBancariaResponseDTO(
        Long id,
        Long idUsuario,
        String nomeBanco,
        String agencia,
        String numeroConta,
        TipoConta tipo,
        BigDecimal saldo,
        LocalDate dataAbertura
) {

    public static ContaBancariaResponseDTO deEntidade(ContaBancaria conta) {
        return new ContaBancariaResponseDTO(
                conta.getId(),
                conta.getUsuario().getId(),
                conta.getNomeBanco(),
                conta.getAgencia(),
                conta.getNumeroConta(),
                conta.getTipo(),
                conta.getSaldo(),
                conta.getDataAbertura()
        );
    }
}
