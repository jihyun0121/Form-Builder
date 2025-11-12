package form.backend.repository;

import java.util.*;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import form.backend.entity.Answer;

@Repository
public interface AnswerRepository extends JpaRepository<Answer, Long> {
    List<Answer>findByQuestion_QuestionId(Long questionId);
    List<Answer>findByResponse_ResponseId(Long responseId);
}
