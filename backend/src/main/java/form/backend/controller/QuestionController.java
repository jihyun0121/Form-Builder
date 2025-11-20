package form.backend.controller;

import java.util.*;

import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import form.backend.dto.QuestionDTO;
import form.backend.entity.Question;
import form.backend.service.QuestionService;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class QuestionController {
    private final QuestionService questionService;

    @PostMapping("/forms/{formId}/question")
    public ResponseEntity<?> addQuestion(@PathVariable("formId") Long formId, @RequestBody QuestionDTO dto) {
        try {
            Question question = questionService.addQuestion(formId, dto);

            QuestionDTO newQuestion = QuestionDTO.builder()
                    .questionId(question.getQuestionId())
                    .formId(formId)
                    .sectionId(question.getSection() != null ? question.getSection().getSectionId() : null)
                    .questionText(question.getQuestionText())
                    .questionType(question.getQuestionType().name())
                    .description(question.getDescription())
                    .settings(question.getSettings())
                    .isRequired(question.isRequired())
                    .orderNum(question.getOrderNum())
                    .build();
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(Map.of("message", "질문이 생성되었습니다", "question", newQuestion));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "서버 오류가 발생했습니다"));
        }
    }

    @GetMapping("/forms/{formId}/questions")
    public ResponseEntity<?> getQuestionByFormId(@PathVariable("formId") Long formId) {
        try {
            List<QuestionDTO> questions = questionService.getQuestionByFormId(formId);
            return ResponseEntity.ok(questions);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/questions/{questionId}")
    public ResponseEntity<?> updateQuestion(@PathVariable("questionId") Long questionId, @RequestBody QuestionDTO dto) {
        try {
            Question updated = questionService.updateQuestion(questionId, dto);
            QuestionDTO response = QuestionDTO.builder()
                    .questionId(updated.getQuestionId())
                    .formId(updated.getForm().getFormId())
                    .sectionId(updated.getSection() != null ? updated.getSection().getSectionId() : null)
                    .questionText(updated.getQuestionText())
                    .questionType(updated.getQuestionType().name())
                    .description(updated.getDescription())
                    .settings(updated.getSettings())
                    .isRequired(updated.isRequired())
                    .orderNum(updated.getOrderNum())
                    .build();
            return ResponseEntity.ok(Map.of("message", "문항이 수정되었습니다", "question", response));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "서버 오류가 발생했습니다"));
        }
    }

    @DeleteMapping("/questions/{questionId}")
    public ResponseEntity<?> deleteQuestion(@PathVariable("questionId") Long questionId) {
        try {
            questionService.deleteQuestion(questionId);
            return ResponseEntity.ok(Map.of("message", "문항이 삭제되었습니다", "question_id", questionId));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "서버 오류가 발생했습니다"));
        }
    }
}