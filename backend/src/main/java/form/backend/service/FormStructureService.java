package form.backend.service;

import java.util.*;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import form.backend.dto.FormStructureDTO;
import form.backend.dto.SectionWithQuestionsDTO;
import form.backend.entity.Form;
import form.backend.entity.Question;
import form.backend.entity.Section;
import form.backend.repository.FormRepository;
import form.backend.repository.QuestionRepository;
import form.backend.repository.SectionRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class FormStructureService {
    private final FormRepository formRepository;
    private final SectionRepository sectionRepository;
    private final QuestionRepository questionRepository;

    public FormStructureDTO getFormStructure(Long formId) {
        Form form = formRepository.findById(formId).orElseThrow(() -> new IllegalArgumentException("해당 설문지가 존재하지 않습니다."));

        List<Section> sections = sectionRepository.findByForm_FormIdOrderByOrderNumAsc(formId);
        List<SectionWithQuestionsDTO> sectionDTOs = sections.stream()
                .map(section -> {
                    List<Question> questions =
                        questionRepository.findBySection_SectionIdOrderByOrderNumAsc(section.getSectionId());

                    List<Map<String, Object>> questionList = questions.stream()
                            .map(question -> Map.of(
                                    "question_id", question.getQuestionId(),
                                    "form_id", question.getForm().getFormId(),
                                    "section_id", question.getSection().getSectionId(),
                                    "question_text", question.getQuestionText(),
                                    "question_type", question.getQuestionType().name(),
                                    "description", question.getDescription(),
                                    "settings", question.getSettings(),
                                    "is_required", question.isRequired(),
                                    "order_num", question.getOrderNum()
                            ))
                            .collect(Collectors.toList());

                    return SectionWithQuestionsDTO.builder()
                            .sectionId(section.getSectionId())
                            .formId(section.getForm().getFormId())
                            .orderNum(section.getOrderNum())
                            .sectionTitle(section.getTitle())
                            .sectionDescription(section.getDescription())
                            .questions(questionList)
                            .build();
                })
                .collect(Collectors.toList());

        return FormStructureDTO.builder()
                .formId(form.getFormId())
                .title(form.getTitle())
                .description(form.getDescription())
                .userId(form.getUser().getUserId())
                .isPublic(form.isPublic())
                .createdAt(form.getCreatedAt())
                .sections(sectionDTOs)
                .build();
    }
}