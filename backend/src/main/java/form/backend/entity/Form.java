package form.backend.entity;

import java.time.LocalDateTime;
import org.hibernate.annotations.CreationTimestamp;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "\"Forms\"")
public class Form {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "form_id")
    @JsonProperty("form_id")
    private Long formId;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    @JsonProperty("user_id")
    private User user;

    @Column(nullable = false)
    @JsonProperty("is_public")
    @Builder.Default
    private boolean isPublic = false;

    @CreationTimestamp
    @Column(updatable = false)
    @JsonProperty("created_at")
    private LocalDateTime createdAt;
}