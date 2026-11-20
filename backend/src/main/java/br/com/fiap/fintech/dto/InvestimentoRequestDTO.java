package br.com.fiap.fintech.dto;

import br.com.fiap.fintech.model.TipoInvestimento;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

public record InvestimentoRequestDTO(

        @NotNull(message = "O id da conta é obrigatório")
        Long idConta,

        @NotBlank(message = "O nome do investimento é obrigatório")
        @Size(max = 100, message = "O nome do investimento deve ter no máximo 100 caracteres")
        String nome,

        @NotNull(message = "O tipo do investimento é obrigatório")
        TipoInvestimento tipo,

        @NotNull(message = "O valor aplicado é obrigatório")
        @Positive(message = "O valor aplicado deve ser maior que zero")
        @Digits(integer = 13, fraction = 2, message = "Valor aplicado fora do formato NUMBER(15,2)")
        BigDecimal valorAplicado,

        @NotNull(message = "A taxa de rentabilidade é obrigatória")
        @PositiveOrZero(message = "A taxa de rentabilidade não pode ser negativa")
        @Digits(integer = 3, fraction = 4, message = "Taxa fora do formato NUMBER(7,4)")
        BigDecimal taxaRentabilidade,

        @PastOrPresent(message = "A data de aplicação não pode estar no futuro")
        LocalDate dataAplicacao,

        LocalDate dataVencimento
) {
}
