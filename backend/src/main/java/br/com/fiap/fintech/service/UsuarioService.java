package br.com.fiap.fintech.service;

import br.com.fiap.fintech.dto.UsuarioRequestDTO;
import br.com.fiap.fintech.dto.UsuarioResponseDTO;
import br.com.fiap.fintech.exception.RecursoDuplicadoException;
import br.com.fiap.fintech.exception.RecursoNaoEncontradoException;
import br.com.fiap.fintech.exception.RegraNegocioException;
import br.com.fiap.fintech.model.Usuario;
import br.com.fiap.fintech.repository.ContaBancariaRepository;
import br.com.fiap.fintech.repository.UsuarioRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Locale;

@Service
@Transactional(readOnly = true)
public class UsuarioService {

    private static final int IDADE_MINIMA = 18;

    private final UsuarioRepository usuarioRepository;
    private final ContaBancariaRepository contaBancariaRepository;
    private final PasswordEncoder codificadorSenha;

    public UsuarioService(UsuarioRepository usuarioRepository,
                          ContaBancariaRepository contaBancariaRepository,
                          PasswordEncoder codificadorSenha) {
        this.usuarioRepository = usuarioRepository;
        this.contaBancariaRepository = contaBancariaRepository;
        this.codificadorSenha = codificadorSenha;
    }

    public List<UsuarioResponseDTO> listar() {
        return usuarioRepository.findAll().stream()
                .map(UsuarioResponseDTO::deEntidade)
                .toList();
    }

    public UsuarioResponseDTO buscarPorId(Long id) {
        return UsuarioResponseDTO.deEntidade(buscarEntidade(id));
    }

    public UsuarioResponseDTO buscarPorEmail(String email) {
        return usuarioRepository.findByEmail(normalizarEmail(email))
                .map(UsuarioResponseDTO::deEntidade)
                .orElseThrow(() -> new RecursoNaoEncontradoException(
                        "Usuário com e-mail " + email + " não encontrado"));
    }

    @Transactional
    public UsuarioResponseDTO criar(UsuarioRequestDTO dto) {
        String email = normalizarEmail(dto.email());
        String cpf = normalizarCpf(dto.cpf());

        if (usuarioRepository.existsByEmail(email)) {
            throw new RecursoDuplicadoException("Já existe um usuário cadastrado com o e-mail " + email);
        }
        if (usuarioRepository.existsByCpf(cpf)) {
            throw new RecursoDuplicadoException("Já existe um usuário cadastrado com este CPF");
        }
        validarIdadeMinima(dto.dataNascimento());

        Usuario usuario = new Usuario();
        preencher(usuario, dto, email, cpf);

        return UsuarioResponseDTO.deEntidade(usuarioRepository.save(usuario));
    }

    @Transactional
    public UsuarioResponseDTO atualizar(Long id, UsuarioRequestDTO dto) {
        Usuario usuario = buscarEntidade(id);
        String email = normalizarEmail(dto.email());
        String cpf = normalizarCpf(dto.cpf());

        if (usuarioRepository.existsByEmailAndIdNot(email, id)) {
            throw new RecursoDuplicadoException("Já existe outro usuário cadastrado com o e-mail " + email);
        }
        if (usuarioRepository.existsByCpfAndIdNot(cpf, id)) {
            throw new RecursoDuplicadoException("Já existe outro usuário cadastrado com este CPF");
        }
        validarIdadeMinima(dto.dataNascimento());

        preencher(usuario, dto, email, cpf);

        return UsuarioResponseDTO.deEntidade(usuario);
    }

    @Transactional
    public void excluir(Long id) {
        Usuario usuario = buscarEntidade(id);

        if (contaBancariaRepository.existsByUsuarioId(id)) {
            throw new RegraNegocioException(
                    "Não é possível excluir o usuário: ele ainda possui contas bancárias. Encerre as contas antes.");
        }

        usuarioRepository.delete(usuario);
    }

    private Usuario buscarEntidade(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Usuário com id " + id + " não encontrado"));
    }

    private void preencher(Usuario usuario, UsuarioRequestDTO dto, String email, String cpf) {
        usuario.setNome(dto.nome().trim());
        usuario.setEmail(email);
        usuario.setCpf(cpf);
        usuario.setDataNascimento(dto.dataNascimento());
        usuario.setSenha(codificadorSenha.encode(dto.senha()));
    }

    private void validarIdadeMinima(LocalDate dataNascimento) {
        if (dataNascimento == null) {
            throw new RegraNegocioException("A data de nascimento é obrigatória");
        }
        if (dataNascimento.plusYears(IDADE_MINIMA).isAfter(LocalDate.now())) {
            throw new RegraNegocioException("O usuário precisa ter pelo menos " + IDADE_MINIMA + " anos");
        }
    }

    private String normalizarEmail(String email) {
        return email == null ? null : email.trim().toLowerCase(Locale.ROOT);
    }

    private String normalizarCpf(String cpf) {
        String somenteDigitos = cpf == null ? "" : cpf.replaceAll("\\D", "");
        if (somenteDigitos.length() != 11) {
            throw new RegraNegocioException("O CPF deve ter 11 dígitos");
        }
        return somenteDigitos;
    }
}
