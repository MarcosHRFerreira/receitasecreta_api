package br.com.marcosferreira.receitasecreta.api.controllers;

import br.com.marcosferreira.receitasecreta.api.dtos.ProdutoRecordDto;
import br.com.marcosferreira.receitasecreta.api.services.ProdutoService;
import br.com.marcosferreira.receitasecreta.api.validations.ProdutoValidator;
import io.swagger.v3.oas.annotations.Parameter;
import jakarta.validation.Valid;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.Errors;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@Validated
@RestController
@RequestMapping("/produtos")
public class ProdutoController {

    Logger logger = LogManager.getLogger(ProdutoController.class);

     final ProdutoService produtoService;
     final ProdutoValidator produtoValidator;


    public ProdutoController(ProdutoService produtoService, ProdutoValidator produtoValidator) {
        this.produtoService = produtoService;
        this.produtoValidator = produtoValidator;
    }

    @PostMapping
    public ResponseEntity<Object>save(@Parameter(description = "Dados do produto") @RequestBody @Valid ProdutoRecordDto produtoRecordDto, Errors errors){

        logger.debug("POST saveProduto produtoRecordDto recebido {} ", produtoRecordDto);

        return ResponseEntity.status(HttpStatus.CREATED).body(produtoService.save(produtoRecordDto));

    }

    @GetMapping("/{produtoId}")
    public ResponseEntity<Object>getOne(@PathVariable(value = "produtoId")UUID produtoId){

        logger.debug("Get produtos getOne received {} ",produtoId);

        return ResponseEntity.status(HttpStatus.OK).body(produtoService.findByProdutoId(produtoId));

    }

    @PutMapping("/{produtoId}")
    public ResponseEntity<Object>update(@PathVariable(value = "produtoId") UUID produtoId,@RequestBody ProdutoRecordDto produtoRecordDto){

        logger.debug("PUT updade produtoRecordDto received {} ", produtoId);

        return ResponseEntity.status(HttpStatus.OK).body(produtoService.update(produtoRecordDto,produtoId));

    }



}
