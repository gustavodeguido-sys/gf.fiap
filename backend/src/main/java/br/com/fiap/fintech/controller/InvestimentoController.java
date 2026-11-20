package br.com.fiap.fintech.controller;

import br.com.fiap.fintech.dto.InvestimentoRequestDTO;
import br.com.fiap.fintech.dto.InvestimentoResponseDTO;
import br.com.fiap.fintech.service.InvestimentoService;
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
@RequestMapping("/api/investimentos")
public class InvestimentoController {

    private final InvestimentoService investimentoService;

    public InvestimentoController(InvestimentoService investimentoService) {
        this.investimentoService = investimentoService;
    }

    @GetMapping
    public ResponseEntity<List<InvestimentoResponseDTO>> listar(
            @RequestParam(required = false) Long idConta) {
        List<InvestimentoResponseDTO> investimentos = idConta == null
                ? investimentoService.listar()
                : investimentoService.listarPorConta(idConta);
        return ResponseEntity.ok(investimentos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<InvestimentoResponseDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(investimentoService.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<InvestimentoResponseDTO> criar(@RequestBody @Valid InvestimentoRequestDTO dto) {
        InvestimentoResponseDTO criado = investimentoService.criar(dto);
        URI localizacao = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(criado.id())
                .toUri();
        return ResponseEntity.created(localizacao).body(criado);
    }

    @PutMapping("/{id}")
    public ResponseEntity<InvestimentoResponseDTO> atualizar(@PathVariable Long id,
                                                             @RequestBody @Valid InvestimentoRequestDTO dto) {
        return ResponseEntity.ok(investimentoService.atualizar(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        investimentoService.excluir(id);
        return ResponseEntity.noContent().build();
    }
}
