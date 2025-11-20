package form.backend.controller;

import java.util.*;

import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import form.backend.dto.AnswerDTO;
import form.backend.service.AnswerService;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class AnswerController {
    private final AnswerService answerService;

    @PostMapping("/responses/{responseId}/answers")
    public ResponseEntity<?> addAnswers(@PathVariable("responseId") Long responseId,
            @RequestBody List<AnswerDTO> answers) {
        try {
            int count = answerService.saveAnswers(responseId, answers);
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                    "message", "답변이 성공적으로 저장되었습니다",
                    "response_id", responseId,
                    "saved_count", count));

        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/questions/{questionId}/answers")
    public ResponseEntity<?> getAnswerByQuestionId(@PathVariable("questionId") Long questionId) {
        try {
            return ResponseEntity.ok(answerService.getAnswerByQuestionId(questionId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/responses/{responseId}/answers")
    public ResponseEntity<?> getAnswerByResponseId(@PathVariable("responseId") Long responseId) {
        try {
            return ResponseEntity.ok(answerService.getAnswerByResponseId(responseId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("responses/{responseId}/answers")
    public ResponseEntity<?> updateAnswers(@PathVariable("responseId") Long responseId, @RequestParam Long userId,
            @RequestBody List<AnswerDTO> dtos) {
        try {
            int count = answerService.updateAnswers(responseId, userId, dtos);
            return ResponseEntity.ok(Map.of(
                    "message", "답변이 수정되었습니다",
                    "response_id", responseId,
                    "updated_count", count));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}