package form.backend.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.*;
import form.backend.dto.FormDTO;
import form.backend.entity.Form;
import form.backend.service.FormService;
import lombok.RequiredArgsConstructor;

import java.util.Map;

@RestController
@RequestMapping("/forms")
@RequiredArgsConstructor
public class FormController {

    private final FormService formService;

    @PostMapping
    public ResponseEntity<?> createForm(@RequestBody FormDTO dto) {
        try {
            Form newForm = formService.createForm(dto);
            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(Map.of("message", "설문지 생성 성공", "form", newForm));
        } catch (IllegalArgumentException e) {
            return ResponseEntity
                    .badRequest()
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity
                    .internalServerError()
                    .body(Map.of("error", "서버 오류가 발생했습니다"));
        }
    }
}
