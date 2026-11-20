package br.com.fiap.fintech.controller;

import br.com.fiap.fintech.dto.ContaBancariaRequestDTO;
import br.com.fiap.fintech.dto.ContaBancariaResponseDTO;
import br.com.fiap.fintech.dto.MovimentacaoRequestDTO;
import br.com.fiap.fintech.service.ContaBancariaService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/contas-bancarias")
public class ContaBancariaController {

    private final ContaBancariaService contaBancariaService;

    public ContaBancariaController(ContaBancariaService contaBancariaService) {
        this.contaBancariaService = contaBancariaService;
    }

    @GetMapping
    public ResponseEntity<List<ContaBancariaResponseDTO>> listar(
            @RequestParam(required = false) Long idUsuario) {
        List<ContaBancariaResponseDTO> contas = idUsuario == null
                ? contaBancariaService.listar()
                : contaBancariaService.listarPorUsuario(idUsuario);
        return ResponseEntity.ok(contas);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ContaBancariaResponseDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(contaBancariaService.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<ContaBancariaResponseDTO> criar(@RequestBody @Valid ContaBancariaRequestDTO dto) {
        ContaBancariaResponseDTO criada = contaBancariaService.criar(dto);
        URI localizacao = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(criada.id())
                .toUri();
        return ResponseEntity.created(localizacao).body(criada);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ContaBancariaResponseDTO> atualizar(@PathVariable Long id,
                                                              @RequestBody @Valid ContaBancariaRequestDTO dto) {
        return ResponseEntity.ok(contaBancariaService.atualizar(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        contaBancariaService.excluir(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/depositos")
    public ResponseEntity<ContaBancariaResponseDTO> depositar(@PathVariable Long id,
                                                              @RequestBody @Valid MovimentacaoRequestDTO dto) {
        return ResponseEntity.ok(contaBancariaService.depositar(id, dto.valor()));
    }

    @PostMapping("/{id}/saques")
    public ResponseEntity<ContaBancariaResponseDTO> sacar(@PathVariable Long id,
                                                          @RequestBody @Valid MovimentacaoRequestDTO dto) {
        return ResponseEntity.ok(contaBancariaService.sacar(id, dto.valor()));
    }
}
