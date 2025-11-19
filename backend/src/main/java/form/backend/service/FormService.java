package form.backend.service;

import java.util.*;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import form.backend.dto.FormDTO;
import form.backend.dto.FormStructureDTO;
import form.backend.dto.SectionWithQuestionsDTO;
import form.backend.entity.Form;
import form.backend.entity.Question;
import form.backend.entity.Section;
import form.backend.entity.User;
import form.backend.repository.FormRepository;
import form.backend.repository.QuestionRepository;
import form.backend.repository.SectionRepository;
import form.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class FormService {
	private final FormRepository formRepository;
	private final UserRepository userRepository;
	private final SectionRepository sectionRepository;
	private final QuestionRepository questionRepository;

	public Form createForm(FormDTO dto) {
		User user = userRepository.findById(dto.getUserId())
				.orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다"));
	
		Form form = Form.builder()
				.title(dto.getTitle())
				.description(dto.getDescription())
				.settings(dto.getSettings() != null ? dto.getSettings() : new HashMap<>())
				.user(user)
				.isPublic(dto.isPublic())
				.build();
	
		return formRepository.save(form);
	}	

	public List<FormDTO> getAllForms() {
		return formRepository.findAll().stream()
				.map(form -> FormDTO.builder()
						.formId(form.getFormId())
						.title(form.getTitle())
						.description(form.getDescription())
						.userId(form.getUser().getUserId())
						.settings(form.getSettings())
						.isPublic(form.isPublic())
						.createdAt(form.getCreatedAt())
						.build())
				.toList();
	}

	public FormDTO getFormById(Long formId) {
		Form form = formRepository.findById(formId)
				.orElseThrow(() -> new IllegalArgumentException("해당 설문이 존재하지 않습니다"));
	
		return FormDTO.builder()
				.formId(form.getFormId())
				.title(form.getTitle())
				.description(form.getDescription())
				.userId(form.getUser().getUserId())
				.settings(form.getSettings())
				.isPublic(form.isPublic())
				.createdAt(form.getCreatedAt())
				.build();
	}
	
	public List<FormDTO> getFormByUserId(Long userId) {
		List<Form> forms = formRepository.findByUser_UserId(userId);

		if (forms.isEmpty()) {
			throw new IllegalArgumentException("해당 사용자가 생성한 설문이 없습니다");
		}

		return forms.stream()
				.map(form -> FormDTO.builder()
						.formId(form.getFormId())
						.title(form.getTitle())
						.description(form.getDescription())
						.userId(form.getUser().getUserId())
						.isPublic(form.isPublic())
						.createdAt(form.getCreatedAt())
						.build())
				.toList();
	}

	public FormStructureDTO getFormStructure(Long formId) {
		Form form = formRepository.findById(formId)
				.orElseThrow(() -> new IllegalArgumentException("해당 설문지가 존재하지 않습니다."));

		List<Section> sections = sectionRepository.findByForm_FormIdOrderByOrderNumAsc(formId);
		List<SectionWithQuestionsDTO> sectionDTOs = sections.stream()
				.map(section -> {
					List<Question> questions = questionRepository
							.findBySection_SectionIdOrderByOrderNumAsc(section.getSectionId());

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
									"order_num", question.getOrderNum()))
							.collect(Collectors.toList());

					return SectionWithQuestionsDTO.builder()
							.sectionId(section.getSectionId())
							.formId(section.getForm().getFormId())
							.orderNum(section.getOrderNum())
							.title(section.getTitle())
							.description(section.getDescription())
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

	public Form updateForm(Long formId, FormDTO dto) {
		Form form = formRepository.findById(formId)
				.orElseThrow(() -> new IllegalArgumentException("해당 설문을 찾을 수 없습니다."));
	
		if (dto.getTitle() != null && !dto.getTitle().isBlank()) {
			form.setTitle(dto.getTitle());
		}
		if (dto.getDescription() != null) {
			form.setDescription(dto.getDescription());
		}
	
		if (dto.getSettings() != null) {
			form.setSettings(dto.getSettings());
		}
	
		form.setPublic(dto.isPublic());
	
		return formRepository.save(form);
	}
	

	@Transactional
	public void deleteForm(Long formId) {
		Form form = formRepository.findById(formId)
				.orElseThrow(() -> new IllegalArgumentException("해당 설문을 찾을 수 없습니다"));
		formRepository.delete(form);
	}
}