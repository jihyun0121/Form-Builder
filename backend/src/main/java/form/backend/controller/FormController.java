package form.backend.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.*;
import form.backend.dto.FormDTO;
import form.backend.entity.Form;
import form.backend.service.FormService;
import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.Locale.Category;
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
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "서버 오류가 발생했습니다"));
        }
    }

    @GetMapping
    public ResponseEntity<?> getAllForms() {
        try {
            List<FormDTO> forms = formService.getAllForms();
            return ResponseEntity.ok(forms);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "설문을 불러오지 못했습니다"));
        }
    }

    @GetMapping("/{formId}")
    public ResponseEntity<?> getFormById(@PathVariable Long formId) {
        try {
            FormDTO form = formService.getFormById(formId);
            return ResponseEntity.ok(form);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getFormByUserId(@PathVariable Long userId) {
        try {
            List<FormDTO> forms = formService.getFormByUserId(userId);
            return ResponseEntity.ok(forms);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @PutMapping("/{formId}")
    public ResponseEntity<?> updateForm(@PathVariable Long formId, @RequestBody FormDTO dto) {
        try {
            Form updatedForm = formService.updateForm(formId, dto);
            FormDTO response = FormDTO.builder()
                    .formId(updatedForm.getFormId())
                    .title(updatedForm.getTitle())
                    .description(updatedForm.getDescription())
                    .userId(updatedForm.getUser().getUserId())
                    .isPublic(updatedForm.isPublic())
                    .createdAt(updatedForm.getCreatedAt())
                    .build();
            return ResponseEntity.ok(Map.of("message", "설문이 수정되었습니다", "form", response));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "서버 오류가 발생했습니다"));
        }
    }
}
