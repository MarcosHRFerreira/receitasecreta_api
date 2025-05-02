package br.com.marcosferreira.receitasecreta.api.dtos.request;


import br.com.marcosferreira.receitasecreta.api.enums.UserRole;

public record UserRequest(String login, String password, UserRole role) {
}
