package form.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import form.backend.entity.Section;

@Repository
public interface SectionRepository extends JpaRepository<Section, Long> {}