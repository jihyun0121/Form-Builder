package form.backend.service;

import java.util.*;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import form.backend.dto.AnswerDTO;
import form.backend.entity.Answer;
import form.backend.entity.Question;
import form.backend.entity.Response;
import form.backend.enums.QuestionType;
import form.backend.repository.AnswerRepository;
import form.backend.repository.QuestionRepository;
import form.backend.repository.ResponseRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AnswerService {
    private final AnswerRepository answerRepository;
    private final ResponseRepository responseRepository;
    private final QuestionRepository questionRepository;

    @Transactional
    public int saveAnswers(Long responseId, List<AnswerDTO> dtos) {
        Response response = responseRepository.findById(responseId)
            .orElseThrow(() -> new IllegalArgumentException("응답 세션(response)을 찾을 수 없습니다."));

        List<Answer> answersToSave = new ArrayList<>();

        for (AnswerDTO dto : dtos) {
            Question question = questionRepository.findById(dto.getQuestionId())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 질문입니다. (ID: " + dto.getQuestionId() + ")"));

            QuestionType type = question.getQuestionType();
            Map<String, Object> answerData = dto.getAnswerData();

            type.validateAnswer(answerData);

            Answer answer = Answer.builder()
                    .response(response)
                    .question(question)
                    .answerData(answerData)
                    .build();
            answersToSave.add(answer);
        }
        answerRepository.saveAll(answersToSave);

        return answersToSave.size();
    }

	public List<AnswerDTO> getAnswerByQuestionId(Long questionId) {
		List<Answer> answers = answerRepository.findByQuestion_QuestionId(questionId);

        if (answers.isEmpty()) {
			throw new IllegalArgumentException("해당 질문이 없습니다");
		}

		return answers.stream()
			.map(answer -> AnswerDTO.builder()
                .answerId(answer.getAnswerId())
                .responseId(answer.getResponse().getResponseId())
                .questionId(answer.getQuestion().getQuestionId())
                .answerData(answer.getAnswerData())
                .build())
            .toList();
	}

	public List<AnswerDTO> getAnswerByResponseId(Long responseId) {
		List<Answer> answers = answerRepository.findByResponse_ResponseId(responseId);

        if (answers.isEmpty()) {
			throw new IllegalArgumentException("해당 질문이 없습니다");
		}

		return answers.stream()
			.map(answer -> AnswerDTO.builder()
                .answerId(answer.getAnswerId())
                .responseId(answer.getResponse().getResponseId())
                .questionId(answer.getQuestion().getQuestionId())
                .answerData(answer.getAnswerData())
                .build())
            .toList();
	}
}