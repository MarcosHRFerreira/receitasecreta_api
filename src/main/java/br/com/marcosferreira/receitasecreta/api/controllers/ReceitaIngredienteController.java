package br.com.marcosferreira.receitasecreta.api.controllers;

import br.com.marcosferreira.receitasecreta.api.dtos.ReceitaIngredienteDto;
import br.com.marcosferreira.receitasecreta.api.dtos.ReceitaIngredienteResponse;
import br.com.marcosferreira.receitasecreta.api.dtos.ReceitaRecordDto;
import br.com.marcosferreira.receitasecreta.api.services.ReceitaIngredienteService;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/receitasingredientes")
public class ReceitaIngredienteController {

    Logger logger = LogManager.getLogger(ReceitaIngredienteController.class);

    final ReceitaIngredienteService receitaIngredienteService;

    public ReceitaIngredienteController(ReceitaIngredienteService receitaIngredienteService) {
        this.receitaIngredienteService = receitaIngredienteService;
    }

    @PostMapping
    public ResponseEntity<Object>save( @RequestBody ReceitaIngredienteDto receitaIngredienteDto){

        logger.debug("POST saveReceitaIngrediente receitaIngredienteDto receitaingrediente {}", receitaIngredienteDto);

        ReceitaIngredienteResponse response=receitaIngredienteService.save(receitaIngredienteDto);

        return ResponseEntity.ok(response);
    }

    @PutMapping("/{receitaId}")
    public ResponseEntity<Object>update(@PathVariable(value = "receitaId") UUID receitaId, @RequestBody ReceitaIngredienteDto receitaIngredienteDto){

        logger.debug("PUT updade receitaIngredienteDto received {} ", receitaId);

        return ResponseEntity.status(HttpStatus.OK).body(receitaIngredienteService.update(receitaIngredienteDto,receitaId));

    }


}
