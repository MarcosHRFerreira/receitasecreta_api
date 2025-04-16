package br.com.marcosferreira.receitasecreta.api.validations;
import br.com.marcosferreira.receitasecreta.api.dtos.ReceitaRecordDto;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;
import org.springframework.validation.Errors;
import org.springframework.validation.Validator;

@Component
public class ReceitaValidator implements Validator {


    Logger logger= LogManager.getLogger(ReceitaValidator.class);

    private final Validator validator;


    public ReceitaValidator(@Qualifier("defaultValidator")Validator validator) {
        this.validator = validator;
    }

    @Override
    public boolean supports(Class<?> clazz) {
        return false;
    }

    @Override
    public void validate(Object o, Errors errors) {
        ReceitaRecordDto receitaRecordDto = (ReceitaRecordDto) o;
        validator.validate(receitaRecordDto, errors);

    }

}
