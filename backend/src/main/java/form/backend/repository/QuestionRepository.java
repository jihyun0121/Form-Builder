package form.backend.repository;

import java.util.*;

import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import form.backend.entity.Question;

@Repository
public interface QuestionRepository extends JpaRepository<Question, Long> {
    List<Question>findByForm_FormId(Long formId);
    List<Question> findByForm_FormIdOrderByOrderNumAsc(Long formId);
    List<Question> findBySection_SectionIdOrderByOrderNumAsc(Long sectionId);

    @Modifying
    @Query("UPDATE Question q SET q.orderNum = q.orderNum - 1 WHERE q.form.formId = :formId AND q.orderNum > :oldOrder AND q.orderNum <= :newOrder")
    void shiftOrderDown(@Param("formId") Long formId, @Param("oldOrder") int oldOrder, @Param("newOrder") int newOrder);

    @Modifying
    @Query("UPDATE Question q SET q.orderNum = q.orderNum + 1 WHERE q.form.formId = :formId AND q.orderNum >= :newOrder AND q.orderNum < :oldOrder")
    void shiftOrderUp(@Param("formId") Long formId, @Param("newOrder") int newOrder, @Param("oldOrder") int oldOrder);

    @Modifying
    @Query("UPDATE Question q SET q.orderNum = q.orderNum - 1 WHERE q.form.formId = :formId AND q.orderNum > :deletedOrder")
    void shiftOrderAfterDelete(@Param("formId") Long formId, @Param("deletedOrder") int deletedOrder);
}