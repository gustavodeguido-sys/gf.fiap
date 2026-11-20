package br.com.fiap.fintech.exception;

import br.com.fiap.fintech.dto.ErroResponseDTO;
import br.com.fiap.fintech.dto.ErroResponseDTO.CampoInvalido;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.ErrorResponse;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.time.LocalDateTime;
import java.util.List;

@RestControllerAdvice
public class TratadorGlobalExcecoes {

    private static final Logger log = LoggerFactory.getLogger(TratadorGlobalExcecoes.class);

    @ExceptionHandler(RecursoNaoEncontradoException.class)
    public ResponseEntity<ErroResponseDTO> tratarNaoEncontrado(RecursoNaoEncontradoException ex,
                                                               HttpServletRequest requisicao) {
        return montar(HttpStatus.NOT_FOUND, ex.getMessage(), requisicao, List.of());
    }

    @ExceptionHandler(RecursoDuplicadoException.class)
    public ResponseEntity<ErroResponseDTO> tratarDuplicado(RecursoDuplicadoException ex,
                                                           HttpServletRequest requisicao) {
        return montar(HttpStatus.CONFLICT, ex.getMessage(), requisicao, List.of());
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ErroResponseDTO> tratarIntegridade(DataIntegrityViolationException ex,
                                                             HttpServletRequest requisicao) {
        log.warn("Violacao de integridade no banco: {}", ex.getMostSpecificCause().getMessage());
        return montar(HttpStatus.CONFLICT,
                "A operação viola uma restrição do banco de dados (registro duplicado ou em uso)",
                requisicao, List.of());
    }

    @ExceptionHandler(RegraNegocioException.class)
    public ResponseEntity<ErroResponseDTO> tratarRegraNegocio(RegraNegocioException ex,
                                                              HttpServletRequest requisicao) {
        return montar(HttpStatus.BAD_REQUEST, ex.getMessage(), requisicao, List.of());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErroResponseDTO> tratarValidacao(MethodArgumentNotValidException ex,
                                                           HttpServletRequest requisicao) {
        List<CampoInvalido> campos = ex.getBindingResult().getFieldErrors().stream()
                .map(erro -> new CampoInvalido(erro.getField(), erro.getDefaultMessage()))
                .toList();
        return montar(HttpStatus.BAD_REQUEST, "Um ou mais campos estão inválidos", requisicao, campos);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErroResponseDTO> tratarCorpoIlegivel(HttpMessageNotReadableException ex,
                                                               HttpServletRequest requisicao) {
        return montar(HttpStatus.BAD_REQUEST,
                "Corpo da requisição inválido. Confira o JSON, os formatos de data (aaaa-mm-dd) e os valores de tipo.",
                requisicao, List.of());
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ErroResponseDTO> tratarTipoParametro(MethodArgumentTypeMismatchException ex,
                                                               HttpServletRequest requisicao) {
        return montar(HttpStatus.BAD_REQUEST,
                "Valor inválido para o parâmetro '" + ex.getName() + "': " + ex.getValue(),
                requisicao, List.of());
    }

    @ExceptionHandler(CredenciaisInvalidasException.class)
    public ResponseEntity<ErroResponseDTO> tratarCredenciais(CredenciaisInvalidasException ex,
                                                             HttpServletRequest requisicao) {
        return montar(HttpStatus.UNAUTHORIZED, ex.getMessage(), requisicao, List.of());
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErroResponseDTO> tratarGenerico(Exception ex, HttpServletRequest requisicao) {
        if (ex instanceof ErrorResponse erroSpring) {
            HttpStatusCode status = erroSpring.getStatusCode();
            String mensagem = erroSpring.getBody().getDetail();
            return montar(status, mensagem != null ? mensagem : ex.getMessage(), requisicao, List.of());
        }
        log.error("Erro inesperado em {} {}", requisicao.getMethod(), requisicao.getRequestURI(), ex);
        return montar(HttpStatus.INTERNAL_SERVER_ERROR, "Erro interno no servidor", requisicao, List.of());
    }

    private ResponseEntity<ErroResponseDTO> montar(HttpStatusCode status, String mensagem,
                                                   HttpServletRequest requisicao, List<CampoInvalido> campos) {
        HttpStatus statusResolvido = HttpStatus.resolve(status.value());
        String erro = statusResolvido != null ? statusResolvido.getReasonPhrase() : String.valueOf(status.value());

        ErroResponseDTO corpo = new ErroResponseDTO(
                LocalDateTime.now(),
                status.value(),
                erro,
                mensagem,
                requisicao.getRequestURI(),
                campos
        );
        return ResponseEntity.status(status).body(corpo);
    }
}
