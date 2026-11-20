package br.com.fiap.fintech.dto;

import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

public record MovimentacaoRequestDTO(

        @NotNull(message = "O valor é obrigatório")
        @Positive(message = "O valor deve ser maior que zero")
        @Digits(integer = 13, fraction = 2, message = "Valor fora do formato NUMBER(15,2)")
        BigDecimal valor
) {
}
