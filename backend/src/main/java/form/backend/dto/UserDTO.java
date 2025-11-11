package form.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDTO {
    @JsonProperty("user_id")
    private Long userId;

    private String email;

    private String password;

    @JsonProperty("created_at")
    private LocalDateTime createdAt;
}