package form.backend.dto;

import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResponseDTO {
    @JsonProperty("response_id")
    private Long responseId;

    @JsonProperty("user_id")
    private Long userId;

    @JsonProperty("form_id")
    private Long formId;

    @JsonProperty("created_at")
    private LocalDateTime createdAt;
}
