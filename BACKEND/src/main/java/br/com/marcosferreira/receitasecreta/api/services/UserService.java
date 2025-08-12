package br.com.marcosferreira.receitasecreta.api.services;

import br.com.marcosferreira.receitasecreta.api.models.User;

import java.util.List;

public interface UserService {
    List<User> getAllUsers();
}
