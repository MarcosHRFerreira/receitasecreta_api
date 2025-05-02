package br.com.marcosferreira.receitasecreta.api.security;

import br.com.marcosferreira.receitasecreta.api.models.User;
import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTCreationException;
import com.auth0.jwt.exceptions.JWTVerificationException;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.Optional;


@Service
public class TokenService {

    private final String secret;
    private static final Duration EXPIRATION_TIME = Duration.ofHours(2); // Configuração flexível de expiração

    public TokenService(@Value("${api.security.token.secret}") String secret) {
        this.secret = secret;
    }

    public String generateToken(User user) {
        try {
            Algorithm algorithm = Algorithm.HMAC256(secret);
            return JWT.create()
                    .withIssuer("auth-api")
                    .withSubject(user.getLogin())
                    .withExpiresAt(genExpirationDate())
                    .sign(algorithm);
        } catch (JWTCreationException exception) {
            throw new RuntimeException("Error while generating token", exception);
        }
    }

    public Optional<String> validateToken(String token) {
        try {
            Algorithm algorithm = Algorithm.HMAC256(secret);
            return Optional.ofNullable(
                    JWT.require(algorithm)
                            .withIssuer("auth-api")
                            .build()
                            .verify(token)
                            .getSubject());
        } catch (JWTVerificationException exception) {
            return Optional.empty();
        }
    }

    private Instant genExpirationDate() {
        return Instant.now().plus(EXPIRATION_TIME).atOffset(ZoneOffset.of("-03:00")).toInstant();
    }
}
