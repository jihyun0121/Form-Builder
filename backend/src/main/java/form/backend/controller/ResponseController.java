package form.backend.controller;

import java.util.*;

import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import form.backend.dto.FormDTO;
import form.backend.dto.ResponseDTO;
import form.backend.entity.Response;
import form.backend.service.ResponseService;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class ResponseController {
    private final ResponseService responseService;

    @PostMapping("/forms/{formId}/responses")
    public ResponseEntity<?> addResponse(@PathVariable Long formId, @RequestBody ResponseDTO dto) {
        try {
            Response response = responseService.addResponse(formId, dto);

            ResponseDTO newResponse = ResponseDTO.builder()
                .responseId(response.getResponseId())
                .formId(formId)
                .userId(response.getUser().getUserId())
                .build();

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(Map.of("message", "응답 생성되었습니다", "response", newResponse));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "서버 오류가 발생했습니다"));
        }
    }

    @GetMapping("/forms/{formId}/responses")
    public ResponseEntity<?> getResponseByFormId(@PathVariable Long formId) {
        try {
            List<ResponseDTO> responses = responseService.getResponseByFormId(formId);
            return ResponseEntity.ok(responses);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/responses/{responseId}")
    public ResponseEntity<?> getResponseById(@PathVariable Long responseId) {
        try {
            ResponseDTO response = responseService.getResponseById(responseId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}