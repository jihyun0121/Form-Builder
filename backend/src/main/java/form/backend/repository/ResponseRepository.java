package form.backend.repository;

import java.util.*;

import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

import form.backend.entity.Response;

@Repository
public interface ResponseRepository extends JpaRepository<Response, Long> {
    List<Response>findByForm_FormId(Long formId);
    List<Response>findByUser_UserId(Long userId);
}