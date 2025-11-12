package form.backend.service;

import java.util.*;

import org.springframework.stereotype.Service;

import form.backend.dto.QuestionDTO;
import form.backend.entity.Form;
import form.backend.entity.Question;
import form.backend.enums.QuestionType;
import form.backend.repository.FormRepository;
import form.backend.repository.QuestionRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class QuestionService {
    private final QuestionRepository questionRepository;
    private final FormRepository formRepository;

    public Question addQuestion(Long formId, QuestionDTO dto) {
        Form form = formRepository.findById(formId)
            .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 설문입니다."));

        Question question = Question.builder()
                .form(form)
                .questionText(dto.getQuestionText())
                .questionType(QuestionType.valueOf(dto.getQuestionType().toUpperCase()))
                .description(dto.getDescription())
                .settings(dto.getSettings())
                .isRequired(dto.isRequired())
                .orderNum(dto.getOrderNum())
                .build();

        return questionRepository.save(question);
    }

	public List<QuestionDTO> getQuestionByFormId(Long formId) {
		List<Question> questions = questionRepository.findByForm_FormId(formId);
		
		if (questions.isEmpty()) {
			throw new IllegalArgumentException("해당 설문의 질문이 없습니다");
		}

		return questions.stream()
			.map(question -> QuestionDTO.builder()
                .questionId(question.getQuestionId())
				.formId(question.getForm().getFormId())
				.questionText(question.getQuestionText())
				.questionType(question.getQuestionType().name())
				.description(question.getDescription())
				.isRequired(question.isRequired())
                .settings(question.getSettings())
                .orderNum(question.getOrderNum())
				.build())
			.toList();
	}

	@Transactional
	public Question updateQuestion(Long questionId, QuestionDTO dto) {
		Question question = questionRepository.findById(questionId)
			.orElseThrow(() -> new IllegalArgumentException("해당 질문을 찾을 수 없습니다."));
		
		Long formId = question.getForm().getFormId();
		
		if (dto.getOrderNum() != null && !dto.getOrderNum().equals(question.getOrderNum())) {
			int oldOrder = question.getOrderNum();
			int newOrder = dto.getOrderNum();

			if (newOrder > oldOrder) {
				questionRepository.shiftOrderDown(formId, oldOrder, newOrder);
			}
			else {
				questionRepository.shiftOrderUp(formId, newOrder, oldOrder);
			}

			question.setOrderNum(newOrder);
		}

		if (dto.getQuestionText() != null && !dto.getQuestionText().isBlank())
			question.setQuestionText(dto.getQuestionText());
		if (dto.getDescription() != null)
			question.setDescription(dto.getDescription());
		if (dto.getSettings() != null)
			question.setSettings(dto.getSettings());
		if (dto.getQuestionType() != null)
			question.setQuestionType(QuestionType.valueOf(dto.getQuestionType().toUpperCase()));

		question.setRequired(dto.isRequired());
		return questionRepository.save(question);
	}

    @Transactional
	public void deleteQuestion(Long questionId) {
		Question question = questionRepository.findById(questionId)
			.orElseThrow(() -> new IllegalArgumentException("해당 질문을 찾을 수 없습니다."));

		Long formId = question.getForm().getFormId();
		int deletedOrder = question.getOrderNum();
		questionRepository.delete(question);
		questionRepository.shiftOrderAfterDelete(formId, deletedOrder);
	}
}