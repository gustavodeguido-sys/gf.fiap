package br.com.fiap.fintech.repository;

import br.com.fiap.fintech.model.ContaBancaria;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ContaBancariaRepository extends JpaRepository<ContaBancaria, Long> {

    List<ContaBancaria> findByUsuarioId(Long idUsuario);

    boolean existsByUsuarioId(Long idUsuario);

    boolean existsByNomeBancoAndAgenciaAndNumeroConta(String nomeBanco, String agencia, String numeroConta);

    boolean existsByNomeBancoAndAgenciaAndNumeroContaAndIdNot(
            String nomeBanco, String agencia, String numeroConta, Long id);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select c from ContaBancaria c where c.id = :id")
    Optional<ContaBancaria> buscarPorIdComBloqueio(@Param("id") Long id);
}
