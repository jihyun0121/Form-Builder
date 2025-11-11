package form.backend.dto;

import java.util.Map;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnswerDTO {
    @JsonProperty("answer_id")
    private Long answerId;

    @JsonProperty("response_id")
    private Long responseId;

    @JsonProperty("question_id")
    private Long questionId;

    @JsonProperty("answer_data")
    private Map<String, Object> answerData;
}
