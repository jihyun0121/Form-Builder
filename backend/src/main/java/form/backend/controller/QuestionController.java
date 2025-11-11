package form.backend.controller;

import org.springframework.web.bind.annotation.RestController;

import form.backend.dto.QuestionDTO;
import form.backend.entity.Question;
import form.backend.service.QuestionService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PathVariable;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

@RestController
@RequiredArgsConstructor
public class QuestionController {
    private final QuestionService questionService;

    @PostMapping("/forms/{formId}")
    public ResponseEntity<?> addQuestion(@PathVariable Long formId, @RequestBody QuestionDTO dto) {
        try {
            Question question = questionService.addQuestion(formId, dto);

            QuestionDTO newQuestion = QuestionDTO.builder()
                .questionId(question.getQuestionId())
                .formId(formId)
                .questionText(question.getQuestionText())
                .questionType(question.getQuestionType())
                .description(question.getDescription())
                .settings(question.getSettings())
                .isRequired(question.isRequired())
                .orderNum(question.getOrderNum())
                .build();

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(Map.of("message", "문항이 생성되었습니다", "question", newQuestion));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "서버 오류가 발생했습니다"));
        }
    }
}
