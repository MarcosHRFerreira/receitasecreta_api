package br.com.marcosferreira.receitasecreta.api.exceptions;

public class NoValidException extends RuntimeException{

    public NoValidException(String message) {
        super(message);
    }

}
