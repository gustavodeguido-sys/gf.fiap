package br.com.fiap.fintech.dto;

import br.com.fiap.fintech.model.TipoConta;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ContaBancariaRequestDTO(

        @NotNull(message = "O id do usuário é obrigatório")
        Long idUsuario,

        @NotBlank(message = "O nome do banco é obrigatório")
        @Size(max = 100, message = "O nome do banco deve ter no máximo 100 caracteres")
        String nomeBanco,

        @NotBlank(message = "A agência é obrigatória")
        @Size(max = 10, message = "A agência deve ter no máximo 10 caracteres")
        String agencia,

        @NotBlank(message = "O número da conta é obrigatório")
        @Size(max = 20, message = "O número da conta deve ter no máximo 20 caracteres")
        String numeroConta,

        @NotNull(message = "O tipo da conta é obrigatório")
        TipoConta tipo,

        @PositiveOrZero(message = "O saldo inicial não pode ser negativo")
        @Digits(integer = 13, fraction = 2, message = "Saldo inicial fora do formato NUMBER(15,2)")
        BigDecimal saldoInicial,

        @PastOrPresent(message = "A data de abertura não pode estar no futuro")
        LocalDate dataAbertura
) {
}
