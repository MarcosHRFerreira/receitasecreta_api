package br.com.marcosferreira.receitasecreta.api.services;

import br.com.marcosferreira.receitasecreta.api.models.User;

import java.util.List;
import java.util.UUID;

public interface UserService {
    List<User> getAllUsers();
    void delete(String userId);
}
