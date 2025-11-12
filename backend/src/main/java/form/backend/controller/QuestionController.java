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

    @PostMapping("/forms/{formId}/questions")
    public ResponseEntity<?> addQuestion(@PathVariable Long formId, @RequestBody QuestionDTO dto) {
        try {
            Question question = questionService.addQuestion(formId, dto);

            QuestionDTO newQuestion = QuestionDTO.builder()
                .questionId(question.getQuestionId())
                .formId(formId)
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

    @GetMapping("/forms/{formId}/question")
    public ResponseEntity<?> getQuestionByFormId(@PathVariable Long formId) {
        try {
            List<QuestionDTO> questions = questionService.getQuestionByFormId(formId);
            return ResponseEntity.ok(questions);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/questions/{questionId}")
    public ResponseEntity<?> updateQuestion(@PathVariable Long questionId, @RequestBody QuestionDTO dto) {
        try {
            Question updatedQuestion = questionService.updateQuestion(questionId, dto);
            QuestionDTO response = QuestionDTO.builder()
                    .questionId(updatedQuestion.getQuestionId())
                    .formId(updatedQuestion.getForm().getFormId())
                    .questionText(updatedQuestion.getQuestionText())
                    .questionType(updatedQuestion.getQuestionType().name())
                    .description(updatedQuestion.getDescription())
                    .settings(updatedQuestion.getSettings())
                    .isRequired(updatedQuestion.isRequired())
                    .orderNum(updatedQuestion.getOrderNum())
                    .build();
            return ResponseEntity.ok(Map.of("message", "질문이 수정되었습니다", "question", response));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "서버 오류가 발생했습니다"));
        }
    }

    @DeleteMapping("/questions/{questionId}")
    public ResponseEntity<?> deleteQuestion(@PathVariable Long questionId){
        try {
            questionService.deleteQuestion(questionId);
            return ResponseEntity.ok(Map.of("message", "질문이 삭제되었습니다", "question_id", questionId));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "서버 오류가 발생했습니다"));
        }
    }
}