package form.backend.repository;

import form.backend.entity.Form;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FormRepository extends JpaRepository<Form, Long> {
    List<Form>findByUser_UserId(Long userId);
}