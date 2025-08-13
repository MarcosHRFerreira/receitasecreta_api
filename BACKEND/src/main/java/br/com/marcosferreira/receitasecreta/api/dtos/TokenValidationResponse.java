package br.com.marcosferreira.receitasecreta.api.dtos;

public record TokenValidationResponse(
    boolean valid,
    String message
) {
    public static TokenValidationResponse validToken() {
        return new TokenValidationResponse(true, "Token válido");
    }
    
    public static TokenValidationResponse invalid(String message) {
        return new TokenValidationResponse(false, message);
    }
}