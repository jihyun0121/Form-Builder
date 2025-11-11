package form.backend.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.*;
import form.backend.dto.FormDTO;
import form.backend.entity.Form;
import form.backend.service.FormService;
import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/forms")
@RequiredArgsConstructor
public class FormController {

    private final FormService formService;

    @PostMapping
    public ResponseEntity<?> createForm(@RequestBody FormDTO dto) {
        try {
            Form form = formService.createForm(dto);

            FormDTO newForm = FormDTO.builder()
                .formId(form.getFormId())
                .title(form.getTitle())
                .description(form.getDescription())
                .userId(form.getUser().getUserId())
                .isPublic(form.isPublic())
                .createdAt(form.getCreatedAt())
                .build();
            
            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(Map.of("message", "설문 생성 성공", "form", newForm));
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
