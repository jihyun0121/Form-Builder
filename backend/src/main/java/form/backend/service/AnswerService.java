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
            .orElseThrow(() -> new IllegalArgumentException("응답 세션(response)을 찾을 수 없습니다"));

        List<Answer> answerList = new ArrayList<>();

        for (AnswerDTO dto : dtos) {
            Question question = questionRepository.findById(dto.getQuestionId())
                    .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 질문입니다 (ID: " + dto.getQuestionId() + ")"));

            QuestionType type = question.getQuestionType();
            type.validateAnswer(dto.getAnswerData());

            Answer answer = Answer.builder()
                    .response(response)
                    .question(question)
                    .answerData(dto.getAnswerData())
                    .build();
            answerList.add(answer);
        }

        answerRepository.saveAll(answerList);
        return answerList.size();
    }

    public List<AnswerDTO> getAnswerByQuestionId(Long questionId) {
        List<Answer> answers = answerRepository.findByQuestion_QuestionId(questionId);

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

		return answers.stream()
			.map(answer -> AnswerDTO.builder()
                .answerId(answer.getAnswerId())
                .responseId(answer.getResponse().getResponseId())
                .questionId(answer.getQuestion().getQuestionId())
                .answerData(answer.getAnswerData())
                .build())
            .toList();
	}

    @Transactional
    public int updateAnswers(Long responseId, Long requesterUserId, List<AnswerDTO> dtos) {
        Response response = responseRepository.findById(responseId)
                .orElseThrow(() -> new IllegalArgumentException("응답 세션을 찾을 수 없습니다"));

        if (!response.getUser().getUserId().equals(requesterUserId))
            throw new IllegalArgumentException("응답 작성자만 답변을 수정할 수 있습니다");

        int count = 0;

        for (AnswerDTO dto : dtos) {
            Question question = questionRepository.findById(dto.getQuestionId())
                    .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 질문입니다 (ID: " + dto.getQuestionId() + ")"));

            QuestionType type = question.getQuestionType();
            type.validateAnswer(dto.getAnswerData());

            Optional<Answer> optional = answerRepository
                    .findByResponse_ResponseIdAndQuestion_QuestionId(responseId, dto.getQuestionId());

            if (optional.isPresent()) {
                Answer existing = optional.get();
                existing.setAnswerData(dto.getAnswerData());
            } else {
                Answer newAnswer = Answer.builder()
                        .response(response)
                        .question(question)
                        .answerData(dto.getAnswerData())
                        .build();
                answerRepository.save(newAnswer);
            }
            count++;
        }
        return count;
    }
}