package form.backend.repository;

import java.util.*;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import form.backend.entity.Form;

@Repository
public interface FormRepository extends JpaRepository<Form, Long> {
    List<Form>findByUser_UserId(Long userId);
}