package br.com.fiap.fintech.service;

import br.com.fiap.fintech.dto.LoginRequestDTO;
import br.com.fiap.fintech.dto.UsuarioResponseDTO;
import br.com.fiap.fintech.exception.CredenciaisInvalidasException;
import br.com.fiap.fintech.model.Usuario;
import br.com.fiap.fintech.repository.UsuarioRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;
import java.util.Optional;

@Service
@Transactional(readOnly = true)
public class AutenticacaoService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder codificadorSenha;

    private final String hashFicticio;

    public AutenticacaoService(UsuarioRepository usuarioRepository, PasswordEncoder codificadorSenha) {
        this.usuarioRepository = usuarioRepository;
        this.codificadorSenha = codificadorSenha;
        this.hashFicticio = codificadorSenha.encode("senha-ficticia-para-comparacao");
    }

    public UsuarioResponseDTO autenticar(LoginRequestDTO dto) {
        String email = dto.email().trim().toLowerCase(Locale.ROOT);
        Optional<Usuario> usuario = usuarioRepository.findByEmail(email);

        String hashGuardado = usuario.map(Usuario::getSenha).orElse(hashFicticio);
        boolean senhaConfere = codificadorSenha.matches(dto.senha(), hashGuardado);

        if (usuario.isEmpty() || !senhaConfere) {
            throw new CredenciaisInvalidasException();
        }
        return UsuarioResponseDTO.deEntidade(usuario.get());
    }
}
