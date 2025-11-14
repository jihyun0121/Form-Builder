package form.backend.controller;

import java.util.*;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import form.backend.dto.SectionDTO;
import form.backend.entity.Section;
import form.backend.service.SectionService;
import lombok.*;

@RestController
@RequiredArgsConstructor
public class SectionController {
    private final SectionService sectionService;

    @PostMapping("/forms/{formId}/sections")
    public ResponseEntity<?> addSection(@PathVariable Long formId, @RequestBody SectionDTO dto) {
        try {
            Section section = sectionService.addSection(formId, dto);
            SectionDTO newSection = SectionDTO.builder()
                    .sectionId(section.getSectionId())
                    .formId(formId)
                    .title(section.getTitle())
                    .description(section.getDescription())
                    .orderNum(section.getOrderNum())
                    .build();
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("message", "섹션이 생성되었습니다", "section", newSection));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "서버 오류가 발생했습니다"));
        }
    }

    @GetMapping("/forms/{formId}/sections")
    public ResponseEntity<?> getFormStructure(@PathVariable Long formId) {
        try {
            List<SectionDTO> sections = sectionService.getFormStructure(formId);
            return ResponseEntity.ok(sections);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/sections/{sectionId}")
    public ResponseEntity<?> updateSection(@PathVariable Long sectionId, @RequestBody SectionDTO dto) {
        try {
            Section updatedSection = sectionService.updateSection(sectionId, dto);

            SectionDTO response = SectionDTO.builder()
                    .sectionId(updatedSection.getSectionId())
                    .formId(updatedSection.getForm().getFormId())
                    .title(updatedSection.getTitle())
                    .description(updatedSection.getDescription())
                    .orderNum(updatedSection.getOrderNum())
                    .build();
            return ResponseEntity.ok(Map.of("message", "섹션이 수정되었습니다", "section", response));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "서버 오류가 발생했습니다"));
        }
    }

    @DeleteMapping("/sections/{sectionId}")
    public ResponseEntity<?> deleteSection(@PathVariable Long sectionId) {
        try {
            sectionService.deleteSection(sectionId);
            return ResponseEntity.ok(Map.of("message", "섹션이 삭제되었습니다", "section_id", sectionId));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "서버 오류가 발생했습니다"));
        }
    }
}