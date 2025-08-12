package br.com.marcosferreira.receitasecreta.api.validations;

import br.com.marcosferreira.receitasecreta.api.dtos.request.ProdutoRecordDto;
import org.apache.logging.log4j.LogManager;

import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;
import org.springframework.validation.Errors;
import org.springframework.validation.Validator;

@Component
public class ProdutoValidator implements Validator {

    Logger logger= LogManager.getLogger(ProdutoValidator.class);

    private final Validator validator;


    public ProdutoValidator(@Qualifier("defaultValidator") Validator validator){
        this.validator = validator;
    }

    @Override
    public boolean supports(Class<?> clazz) {
        return false;
    }

    @Override
    public void validate(Object o, Errors errors) {
        ProdutoRecordDto produtoRecordDto = (ProdutoRecordDto) o;
        validator.validate(produtoRecordDto, errors);

    }
}
