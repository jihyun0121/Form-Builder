package form.backend.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import form.backend.entity.Question;

public interface QuestionRepository extends JpaRepository<Question, Long>{
    List<Question>findByForm_FormId(Long formId);
}
