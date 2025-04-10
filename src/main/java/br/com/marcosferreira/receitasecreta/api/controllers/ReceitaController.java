package br.com.marcosferreira.receitasecreta.api.controllers;

import br.com.marcosferreira.receitasecreta.api.dtos.ReceitaRecordDto;
import br.com.marcosferreira.receitasecreta.api.services.ReceitaService;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/receitas")
public class ReceitaController {

    Logger logger = LogManager.getLogger(ReceitaController.class);

    final ReceitaService receitaService;

    public ReceitaController(ReceitaService receitaService) {
        this.receitaService = receitaService;
    }

    @PostMapping
    public ResponseEntity<Object>save(@RequestBody ReceitaRecordDto receitaRecordDto){

        logger.debug("POST saveReceita receitaRecordDto receita {}",receitaRecordDto);

        return  ResponseEntity.status(HttpStatus.CREATED).body(receitaService.save(receitaRecordDto));

    }
    @GetMapping("/id/receitaId")
    public ResponseEntity<Object>getOne(@PathVariable(value = "receitaId")UUID receitaId){

        return ResponseEntity.status(HttpStatus.OK).body(receitaService.findByReceitaId(receitaId));

    }



}
