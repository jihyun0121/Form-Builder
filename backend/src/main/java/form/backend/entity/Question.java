package form.backend.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Type;
import io.hypersistence.utils.hibernate.type.json.JsonType;
import java.util.Map;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "\"Question\"")
public class Question {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "question_id")
    @JsonProperty("question_id")
    private Long questionId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "form_id")
    @JsonProperty("form_id")
    private Form form;

    @Column(name = "question_text", nullable = false, columnDefinition = "TEXT")
    @JsonProperty("question_text")
    private String questionText;

    @Column(name = "question_type", nullable = false, length = 30)
    @JsonProperty("question_type")
    private String questionType;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Type(JsonType.class)
    @Column(columnDefinition = "jsonb")
    private Map<String, Object> settings;

    @Column(nullable = false)
    @JsonProperty("is_required")
    @Builder.Default
    private boolean isRequired = false;

    @Column(name = "order_num")
    @JsonProperty("order_num")
    private Integer orderNum;
}