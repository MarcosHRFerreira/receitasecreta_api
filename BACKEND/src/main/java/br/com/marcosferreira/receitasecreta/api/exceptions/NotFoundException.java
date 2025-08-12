package br.com.marcosferreira.receitasecreta.api.exceptions;

public class NotFoundException extends RuntimeException{

    public NotFoundException(String message) {
        super(message);
    }

}

