package form.backend.dto;

import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FormDTO {

    @JsonProperty("form_id")
    private Long formId;

    private String title;

    private String description;

    @JsonProperty("user_id")
    private Long userId;

    @JsonProperty("is_public")
    private boolean isPublic;

    @JsonProperty("created_at")
    private LocalDateTime createdAt;
}
