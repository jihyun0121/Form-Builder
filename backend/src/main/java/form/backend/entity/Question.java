package form.backend.entity;

import java.util.*;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.hypersistence.utils.hibernate.type.json.JsonType;
import org.hibernate.annotations.Type;

import form.backend.enums.QuestionType;
import jakarta.persistence.*;
import lombok.*;

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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "section_id")
    @JsonProperty("section_id")
    private Section section;

    @Column(name = "question_text", nullable = false, columnDefinition = "TEXT")
    @JsonProperty("question_text")
    private String questionText;

    @Enumerated(EnumType.STRING)
    @Column(name = "question_type", nullable = false, length = 30)
    @JsonProperty("question_type")
    private QuestionType questionType;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Type(JsonType.class)
    @Column(columnDefinition = "jsonb")
    private Map<String, Object> settings;

    @Column(name = "is_required", nullable = false)
    @JsonProperty("is_required")
    @Builder.Default
    private boolean isRequired = false;

    @Column(name = "order_num")
    @JsonProperty("order_num")
    private Integer orderNum;
}