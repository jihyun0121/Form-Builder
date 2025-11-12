package form.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import form.backend.entity.Answer;

@Repository
public interface AnswerRepository extends JpaRepository<Answer, Long> {}
