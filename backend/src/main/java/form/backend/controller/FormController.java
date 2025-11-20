package form.backend.controller;

import java.util.*;

import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import form.backend.dto.FormDTO;
import form.backend.dto.FormStructureDTO;
import form.backend.entity.Form;
import form.backend.service.FormService;
import lombok.RequiredArgsConstructor;

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
    public ResponseEntity<?> getFormById(@PathVariable("formId") Long formId) {
        try {
            FormDTO form = formService.getFormById(formId);
            return ResponseEntity.ok(form);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getFormByUserId(@PathVariable("userId") Long userId) {
        try {
            List<FormDTO> forms = formService.getFormByUserId(userId);
            return ResponseEntity.ok(forms);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{formId}/structure")
    public ResponseEntity<?> getFormStructure(@PathVariable("formId") Long formId) {
        try {
            FormStructureDTO structure = formService.getFormStructure(formId);
            return ResponseEntity.ok(structure);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));

        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "서버 오류가 발생했습니다"));
        }
    }

    @PutMapping("/{formId}")
    public ResponseEntity<?> updateForm(@PathVariable("formId") Long formId, @RequestBody FormDTO dto) {
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

    @DeleteMapping("/{formId}")
    public ResponseEntity<?> deleteForm(@PathVariable("formId") Long formId) {
        try {
            formService.deleteForm(formId);
            return ResponseEntity.ok(Map.of("message", "설문이 삭제되었습니다", "form_id", formId));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "서버 오류가 발생했습니다"));
        }
    }
}