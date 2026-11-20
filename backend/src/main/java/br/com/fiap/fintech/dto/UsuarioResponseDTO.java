package br.com.fiap.fintech.dto;

import br.com.fiap.fintech.model.Usuario;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record UsuarioResponseDTO(
        Long id,
        String nome,
        String email,
        String cpf,
        LocalDate dataNascimento,
        LocalDateTime dataCadastro
) {

    public static UsuarioResponseDTO deEntidade(Usuario usuario) {
        return new UsuarioResponseDTO(
                usuario.getId(),
                usuario.getNome(),
                usuario.getEmail(),
                usuario.getCpf(),
                usuario.getDataNascimento(),
                usuario.getDataCadastro()
        );
    }
}
