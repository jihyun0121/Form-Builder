package form.backend.service;

import org.springframework.stereotype.Service;

import form.backend.dto.ResponseDTO;
import form.backend.entity.Form;
import form.backend.entity.Response;
import form.backend.entity.User;
import form.backend.repository.FormRepository;
import form.backend.repository.ResponseRepository;
import form.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ResponseService {
    private final ResponseRepository responseRepository;
    private final UserRepository userRepository;
    private final FormRepository formRepository;

    public Response addResponse(Long formId, ResponseDTO dto) {
		User user = userRepository.findById(dto.getUserId())
			.orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다"));

        Form form = formRepository.findById(formId)
            .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 설문입니다."));

        Response response = Response.builder()
                .form(form)
                .user(user)
                .build();

        return responseRepository.save(response);
    }
}