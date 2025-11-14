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

    @JsonProperty("section_title")
    private String sectionTitle;

    @JsonProperty("section_description")
    private String sectionDescription;

    @JsonProperty("questions")
    private List<Map<String, Object>> questions;
}