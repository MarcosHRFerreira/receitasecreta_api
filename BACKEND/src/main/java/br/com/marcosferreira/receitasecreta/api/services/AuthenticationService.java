package br.com.marcosferreira.receitasecreta.api.services;

import br.com.marcosferreira.receitasecreta.api.dtos.request.UserAuthRequest;
import br.com.marcosferreira.receitasecreta.api.dtos.request.UserRequest;
import br.com.marcosferreira.receitasecreta.api.dtos.response.UserResponse;

public interface AuthenticationService {

    UserResponse login(UserAuthRequest data);
    void register(UserRequest data);

}
