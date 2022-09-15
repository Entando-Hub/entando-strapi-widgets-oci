package com.entando.template.persistence;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.entando.template.persistence.entity.EntTemplate;

public interface EntTemplateRepository extends JpaRepository<EntTemplate, Long> {

	/**
	 * Find all templates paginated
	 */
	Page<EntTemplate> findAll(Pageable pageable);

	/**
	 * Find all templates by templateApiId in paginated manner
	 * @param code
	 * @param pageable
	 * @return
	 */
	Page<EntTemplate> findByTemplateApiId(String templateApiId, Pageable pageable);
	
	/**
	 * Find all templates by templateApiId
	 * @param collectionType
	 * @return
	 */
	List<EntTemplate> findByTemplateApiIdIgnoreCaseOrderByTemplateName(String templateApiId);


}
