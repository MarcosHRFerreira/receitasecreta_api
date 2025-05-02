package br.com.marcosferreira.receitasecreta.api.controllers;

import br.com.marcosferreira.receitasecreta.api.dtos.request.ReceitaIngredienteDeleteDto;
import br.com.marcosferreira.receitasecreta.api.dtos.request.ReceitaIngredienteDto;
import br.com.marcosferreira.receitasecreta.api.dtos.response.ReceitaIngredienteResponse;
import br.com.marcosferreira.receitasecreta.api.models.ReceitaIngredienteModel;
import br.com.marcosferreira.receitasecreta.api.services.ReceitaIngredienteService;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


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

    @PutMapping
    public ResponseEntity<Object>update(@RequestBody ReceitaIngredienteDto receitaIngredienteDto){

        logger.debug("PUT updade receitaIngredienteDto received {} ", receitaIngredienteDto.receitaId());

        return ResponseEntity.status(HttpStatus.OK).body(receitaIngredienteService.update(receitaIngredienteDto));

    }

    @DeleteMapping
    public ResponseEntity<Object>delete(@RequestBody  ReceitaIngredienteDeleteDto receitaIngredienteDeleteDto){

        logger.debug("DELETE delete receitaIngredienteDeleteDto received {} ", receitaIngredienteDeleteDto.receitaId());

        return ResponseEntity.status(HttpStatus.OK).body(receitaIngredienteService.delete(receitaIngredienteDeleteDto));
    }

    @GetMapping
    public ResponseEntity<Page<ReceitaIngredienteModel>> getAll(Pageable pageable)                                                     {

        return ResponseEntity.status(HttpStatus.OK).body(receitaIngredienteService.findAll(pageable));
    }

}
