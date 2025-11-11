package form.backend.entity;

import java.util.Map;
import org.hibernate.annotations.Type;
import com.fasterxml.jackson.annotation.JsonProperty;
import io.hypersistence.utils.hibernate.type.json.JsonType;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "\"Answer\"")
public class Answer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @JsonProperty("answer_id")
    private Long answerId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "response_id")
    @JsonProperty("response_id")
    private Response response;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id")
    @JsonProperty("question_id")
    private Question question;

    @Type(JsonType.class)
    @Column(columnDefinition = "jsonb")
    @JsonProperty("answer_data")
    private Map<String, Object> answerData;
}