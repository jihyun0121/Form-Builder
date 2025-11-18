package form.backend.dto;

import java.util.*;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SectionWithQuestionsDTO {
    @JsonProperty("section_id")
    private Long sectionId;

    @JsonProperty("form_id")
    private Long formId;

    @JsonProperty("order_num")
    private Integer orderNum;

    @JsonProperty("title")
    private String title;

    @JsonProperty("description")
    private String description;

    @JsonProperty("questions")
    private List<Map<String, Object>> questions;
}