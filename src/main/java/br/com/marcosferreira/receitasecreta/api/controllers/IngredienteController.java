package br.com.marcosferreira.receitasecreta.api.controllers;



import br.com.marcosferreira.receitasecreta.api.dtos.IngredienteRecordDto;
import br.com.marcosferreira.receitasecreta.api.services.IngredienteService;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;


@RestController
@RequestMapping("/ingredientes")
public class IngredienteController {

    Logger logger = LogManager.getLogger(IngredienteController.class);

    final IngredienteService ingredienteService;

    public IngredienteController(IngredienteService ingredienteService) {
        this.ingredienteService = ingredienteService;
    }

    @PostMapping("/produto/{produtoId}")
    public ResponseEntity<Object>save(@PathVariable(value = "produtoId") UUID produtoId,@RequestBody IngredienteRecordDto ingredienteRecordDto){

        logger.debug("POST saveIngrediente ingredienteRecordDto ingrediente {}", ingredienteRecordDto);

        return ResponseEntity.status(HttpStatus.CREATED).body(ingredienteService.save(ingredienteRecordDto,produtoId));
    }

    @GetMapping("/id/ingredienteId")
    public ResponseEntity<Object>getOne(@PathVariable(value = "ingredienteId")UUID ingredienteId){

        return ResponseEntity.status(HttpStatus.OK).body(ingredienteService.findByIngredienteId(ingredienteId));

    }


}
