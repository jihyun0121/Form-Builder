package form.backend.controller;

import java.util.*;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import form.backend.dto.AnswerDTO;
import form.backend.service.AnswerService;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class AnswerController {
    private final AnswerService answerService;

    @PostMapping("/responses/{responseId}/answers")
    public ResponseEntity<?> addAnswers(@PathVariable Long responseId, @RequestBody List<AnswerDTO> answers) {
        try {
            int count = answerService.saveAnswers(responseId, answers);
            return ResponseEntity.status(HttpStatus.CREATED) .body(Map.of(
                "message", "답변이 성공적으로 저장되었습니다.",
                "response_id", responseId,
                "saved_count", count
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError() .body(Map.of("error", "서버 오류가 발생했습니다."));
        }
    }
}