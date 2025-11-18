package com.cuido.cuido.repository;

import com.cuido.cuido.model.PasswordResetToken;
import com.cuido.cuido.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {

    Optional<PasswordResetToken> findByCodigoOtpAndUsadoFalse(String codigoOtp);

    List<PasswordResetToken> findByUsuarioAndUsadoFalse(Usuario usuario);

    void deleteByFechaExpiracionBefore(LocalDateTime fecha);

    void deleteByUsuario(Usuario usuario);
}
