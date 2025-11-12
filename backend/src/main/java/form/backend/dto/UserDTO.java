package form.backend.dto;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.*;

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