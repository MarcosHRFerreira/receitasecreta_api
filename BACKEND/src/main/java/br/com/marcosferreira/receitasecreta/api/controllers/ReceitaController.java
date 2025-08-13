package br.com.marcosferreira.receitasecreta.api.controllers;

import br.com.marcosferreira.receitasecreta.api.dtos.request.ReceitaRecordDto;
import br.com.marcosferreira.receitasecreta.api.exceptions.NotFoundException;
import br.com.marcosferreira.receitasecreta.api.models.ReceitaModel;
import br.com.marcosferreira.receitasecreta.api.services.ReceitaService;
import jakarta.validation.Valid;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@Validated
@RestController
@RequestMapping("/receitas")
public class ReceitaController {

    Logger logger = LogManager.getLogger(ReceitaController.class);

    final ReceitaService receitaService;

    public ReceitaController(ReceitaService receitaService) {
        this.receitaService = receitaService;
    }

    @PostMapping
    public ResponseEntity<Object>save(@RequestBody @Valid ReceitaRecordDto receitaRecordDto){

        logger.debug("POST saveReceita receitaRecordDto receita {}",receitaRecordDto);

        return  ResponseEntity.status(HttpStatus.CREATED).body(receitaService.save(receitaRecordDto));

    }
    @GetMapping("/{receitaId}")
    public ResponseEntity<Object>getOne(@PathVariable(value = "receitaId")UUID receitaId){

        ReceitaModel receita = receitaService.findByReceitaId(receitaId);
        return ResponseEntity.status(HttpStatus.OK).body(receita);

    }
    @PutMapping("/{receitaId}")
    public ResponseEntity<Object>update(@PathVariable(value = "receitaId") UUID receitaId,@RequestBody ReceitaRecordDto receitaRecordDto){

        logger.debug("PUT updade receitaRecordDto received {} ", receitaId);

        return ResponseEntity.status(HttpStatus.OK).body(receitaService.update(receitaRecordDto,receitaId));

    }
    @GetMapping
    public ResponseEntity<Page<ReceitaModel>> getAll(Pageable pageable) {
        return ResponseEntity.status(HttpStatus.OK).body(receitaService.findAll(pageable));
    }

    @DeleteMapping("/{receitaId}")
    public ResponseEntity<Object> delete(@PathVariable(value = "receitaId") UUID receitaId) {
        logger.debug("DELETE deleteReceita receitaId {}", receitaId);
        
        receitaService.delete(receitaId);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }
}
