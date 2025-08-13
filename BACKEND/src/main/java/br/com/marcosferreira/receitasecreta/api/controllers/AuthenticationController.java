package br.com.marcosferreira.receitasecreta.api.controllers;

import br.com.marcosferreira.receitasecreta.api.dtos.ForgotPasswordRequest;
import br.com.marcosferreira.receitasecreta.api.dtos.ResetPasswordRequest;
import br.com.marcosferreira.receitasecreta.api.dtos.TokenValidationResponse;
import br.com.marcosferreira.receitasecreta.api.dtos.request.UserAuthRequest;
import br.com.marcosferreira.receitasecreta.api.dtos.request.UserRequest;
import br.com.marcosferreira.receitasecreta.api.services.AuthenticationService;
import br.com.marcosferreira.receitasecreta.api.services.PasswordResetService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("auth")
public class AuthenticationController {

    final AuthenticationService authenticationService;
    final PasswordResetService passwordResetService;

    public AuthenticationController(AuthenticationService authenticationService, PasswordResetService passwordResetService) {
        this.authenticationService = authenticationService;
        this.passwordResetService = passwordResetService;
    }

    @PostMapping("/login")
    public ResponseEntity<Object> login(@RequestBody @Valid UserAuthRequest data) {
        try {
            return ResponseEntity.ok(authenticationService.login(data));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Credenciais inválidas. Verifique seu login e senha."));
        }
    }


    @PostMapping("/register")
    public ResponseEntity<Object> register(@RequestBody @Valid UserRequest data) {
        try {
            authenticationService.register(data);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Object> forgotPassword(@RequestBody @Valid ForgotPasswordRequest request) {
        try {
            passwordResetService.requestPasswordReset(request.email());
            return ResponseEntity.ok(Map.of("message", "Se o email existir, você receberá instruções para redefinir sua senha."));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Object> resetPassword(@RequestBody @Valid ResetPasswordRequest request) {
        try {
            passwordResetService.resetPassword(request.token(), request.newPassword());
            return ResponseEntity.ok(Map.of("message", "Senha redefinida com sucesso!"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/validate-reset-token/{token}")
    public ResponseEntity<TokenValidationResponse> validateResetToken(@PathVariable String token) {
        try {
            boolean isValid = passwordResetService.validateResetToken(token);
            if (isValid) {
                return ResponseEntity.ok(TokenValidationResponse.validToken());
            } else {
                return ResponseEntity.ok(TokenValidationResponse.invalid("Token inválido ou expirado"));
            }
        } catch (Exception e) {
            return ResponseEntity.ok(TokenValidationResponse.invalid("Erro ao validar token"));
        }
    }
}