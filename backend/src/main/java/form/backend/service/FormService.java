package form.backend.service;

import java.util.*;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import form.backend.dto.FormDTO;
import form.backend.entity.Form;
import form.backend.entity.User;
import form.backend.repository.FormRepository;
import form.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class FormService {
	private final FormRepository formRepository;
	private final UserRepository userRepository;

	public Form createForm(FormDTO dto) {
		User user = userRepository.findById(dto.getUserId())
			.orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다"));

		Form form = Form.builder()
			.title(dto.getTitle())
			.description(dto.getDescription())
			.user(user)
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

	public Form updateForm(Long formId, FormDTO dto) {
		Form form = formRepository.findById(formId)
				.orElseThrow(() -> new IllegalArgumentException("해당 설문을 찾을 수 없습니다"));

		if (dto.getTitle() != null && !dto.getTitle().isBlank()) {
			form.setTitle(dto.getTitle());
		}
		if (dto.getDescription() != null) {
			form.setDescription(dto.getDescription());
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