package form.backend.repository;

import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

import form.backend.entity.Response;

@Repository
public interface ResponseRepository extends JpaRepository<Response, Long> {}