package br.com.marcosferreira.receitasecreta.api.controllers;

import br.com.marcosferreira.receitasecreta.api.dtos.ProdutoRecordDto;
import br.com.marcosferreira.receitasecreta.api.services.ProdutoService;
import io.swagger.v3.oas.annotations.Parameter;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.Errors;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/produtos")
public class ProdutoController {

    Logger logger = LogManager.getLogger(ProdutoController.class);

    private final ProdutoService produtoService;


    public ProdutoController(ProdutoService produtoService) {
        this.produtoService = produtoService;
    }

    @PostMapping
    public ResponseEntity<Object>save(@Parameter(description = "Dados do produto") @RequestBody ProdutoRecordDto produtoRecordDto, Errors errors){

        logger.debug("POST saveProduto produtoRecordDto recebido {} ", produtoRecordDto);

        return ResponseEntity.status(HttpStatus.CREATED).body(produtoService.save(produtoRecordDto));

    }

    @GetMapping("/{produtoId}")
    public ResponseEntity<Object>getOne(@PathVariable(value = "produtoId")UUID produtoId){

        logger.debug("Get produtos getOne received {} ",produtoId);

        return ResponseEntity.status(HttpStatus.OK).body(produtoService.findById(produtoId));

    }



}
