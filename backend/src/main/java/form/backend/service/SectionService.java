package form.backend.service;

import java.util.*;

import org.springframework.stereotype.Service;

import form.backend.dto.SectionDTO;
import form.backend.entity.Form;
import form.backend.entity.Section;
import form.backend.repository.FormRepository;
import form.backend.repository.SectionRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SectionService {
    private final SectionRepository sectionRepository;
    private final FormRepository formRepository;

    public Section addSection(Long formId, SectionDTO dto) {
        Form form = formRepository.findById(formId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 설문입니다"));

        Section section = Section.builder()
                .form(form)
                .title(dto.getTitle())
                .description(dto.getDescription())
                .orderNum(dto.getOrderNum())
                .build();
        return sectionRepository.save(section);
    }

    public List<SectionDTO> getFormStructure(Long formId) {
        List<Section> sections = sectionRepository.findByForm_FormIdOrderByOrderNumAsc(formId);

        return sections.stream()
                .map(s -> SectionDTO.builder()
                        .sectionId(s.getSectionId())
                        .formId(s.getForm().getFormId())
                        .title(s.getTitle())
                        .description(s.getDescription())
                        .orderNum(s.getOrderNum())
                        .build())
                .toList();
    }
}