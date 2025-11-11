package form.backend.dto;

import java.util.Map;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuestionDTO {
    @JsonProperty("question_id")
    private Long questionId;

    @JsonProperty("form_id")
    private Long formId;

    @JsonProperty("question_text")
    private String questionText;

    @JsonProperty("question_type")
    private String questionType;

    private String description;

    private Map<String, Object> settings;

    @JsonProperty("is_required")
    private boolean isRequired;

    @JsonProperty("order_num")
    private Integer orderNum;
}