package form.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SectionDTO {
    @JsonProperty("section_id")
    private Long sectionId;

    @JsonProperty("form_id")
    private Long formId;

    private String title;

    private String description;

    @JsonProperty("order_num")
    private Integer orderNum;
}