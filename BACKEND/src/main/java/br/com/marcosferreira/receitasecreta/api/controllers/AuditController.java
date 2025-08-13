package br.com.marcosferreira.receitasecreta.api.controllers;

import br.com.marcosferreira.receitasecreta.api.dtos.response.UserAuditResponse;
import br.com.marcosferreira.receitasecreta.api.dtos.response.PasswordChangeAuditResponse;
import br.com.marcosferreira.receitasecreta.api.dtos.response.UserActivityResponse;
import br.com.marcosferreira.receitasecreta.api.models.User;
import br.com.marcosferreira.receitasecreta.api.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/audit")
@PreAuthorize("hasRole('ADMIN')")
public class AuditController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/users/recent")
    public ResponseEntity<List<UserAuditResponse>> getRecentUsers(
            @RequestParam(defaultValue = "10") int limit) {
        
        Pageable pageable = PageRequest.of(0, limit, Sort.by("createdAt").descending());
        Page<User> users = userRepository.findAll(pageable);
        
        List<UserAuditResponse> response = users.getContent().stream()
                .map(user -> new UserAuditResponse(
                        user.getId(),
                        user.getLogin(),
                        user.getEmail(),
                        user.getCreatedAt(),
                        user.getPasswordChangedAt(),
                        user.getPasswordChangedBy()
                ))
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/password-changes")
    public ResponseEntity<List<PasswordChangeAuditResponse>> getPasswordChanges(
            @RequestParam(defaultValue = "10") int limit) {
        
        Pageable pageable = PageRequest.of(0, limit, Sort.by("passwordChangedAt").descending());
        List<User> users = userRepository.findByPasswordChangedAtIsNotNull(pageable);
        
        List<PasswordChangeAuditResponse> response = users.stream()
                .map(user -> new PasswordChangeAuditResponse(
                        user.getId(),
                        user.getLogin(),
                        user.getPasswordChangedAt(),
                        user.getPasswordChangedBy()
                ))
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/user-activity/{userId}")
    public ResponseEntity<UserActivityResponse> getUserActivity(@PathVariable String userId) {
        User user = userRepository.findById(userId).orElse(null);
        
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        
        // Aqui você pode adicionar lógica para buscar mais detalhes de atividade
        // como número de receitas criadas, produtos criados, etc.
        
        UserActivityResponse response = new UserActivityResponse(
                user.getId(),
                user.getLogin(),
                user.getCreatedAt(),
                user.getPasswordChangedAt(),
                0L, // receitasCount - implementar consulta
                0L  // produtosCount - implementar consulta
        );
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/metrics")
    public ResponseEntity<Object> getAuditMetrics() {
        LocalDateTime oneWeekAgo = LocalDateTime.now().minusWeeks(1);
        LocalDateTime oneMonthAgo = LocalDateTime.now().minusMonths(1);
        
        final long totalUsersCount = userRepository.count();
        final long usersLastWeekCount = userRepository.countByCreatedAtAfter(oneWeekAgo);
        final long usersLastMonthCount = userRepository.countByCreatedAtAfter(oneMonthAgo);
        final long passwordChangesLastWeekCount = userRepository.countByPasswordChangedAtAfter(oneWeekAgo);
         
        return ResponseEntity.ok(new Object() {
            public final long totalUsers = totalUsersCount;
            public final long usersLastWeek = usersLastWeekCount;
            public final long usersLastMonth = usersLastMonthCount;
            public final long passwordChangesLastWeek = passwordChangesLastWeekCount;
        });
    }
}