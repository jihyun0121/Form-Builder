package form.backend.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import form.backend.dto.FormStructureDTO;
import form.backend.service.FormStructureService;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class FormStructureController {
    private final FormStructureService formStructureService;

    @GetMapping("/forms/{formId}/structure")
    public ResponseEntity<?> getFormStructure(@PathVariable Long formId) {
        try {
            FormStructureDTO structure = formStructureService.getFormStructure(formId);
            return ResponseEntity.ok(structure);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));

        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "서버 오류가 발생했습니다"));
        }
    }
}