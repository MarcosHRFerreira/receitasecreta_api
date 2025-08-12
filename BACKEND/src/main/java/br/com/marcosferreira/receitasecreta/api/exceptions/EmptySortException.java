package br.com.marcosferreira.receitasecreta.api.exceptions;

public class EmptySortException extends RuntimeException {
    public EmptySortException(String message) {
        super(message);
    }
}
