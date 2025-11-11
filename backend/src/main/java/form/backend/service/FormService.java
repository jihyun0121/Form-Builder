package form.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;
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
			.orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));

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
}