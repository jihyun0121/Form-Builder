package form.backend.service;

import org.springframework.stereotype.Service;
import form.backend.dto.QuestionDTO;
import form.backend.entity.Form;
import form.backend.entity.Question;
import form.backend.repository.FormRepository;
import form.backend.repository.QuestionRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class QuestionService {
    private final QuestionRepository questionRepository;
    private final FormRepository formRepository;
    
    public Question addQuestion(Long formId, QuestionDTO dto) {
        Form form = formRepository.findById(formId)
            .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 설문입니다."));

        Question question = Question.builder()
                .form(form)
                .questionText(dto.getQuestionText())
                .questionType(dto.getQuestionType())
                .description(dto.getDescription())
                .settings(dto.getSettings())
                .isRequired(dto.isRequired())
                .orderNum(dto.getOrderNum())
                .build();

        return questionRepository.save(question);
    }
}
