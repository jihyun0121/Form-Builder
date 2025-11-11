package form.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import form.backend.entity.Question;

public interface QuestionRepository extends JpaRepository<Question, Long>{}
