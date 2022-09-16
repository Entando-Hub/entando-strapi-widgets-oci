package com.entando.template.rest;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import javax.annotation.security.RolesAllowed;
import javax.validation.Valid;

import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.entando.template.config.ApplicationConstants;
import com.entando.template.exception.TemplateNotFoundException;
import com.entando.template.persistence.entity.EntTemplate;
import com.entando.template.request.TemplateRequestView;
import com.entando.template.response.TemplateResponseView;
import com.entando.template.service.EntTemplateService;
import com.entando.template.util.PagedContent;

import io.swagger.v3.oas.annotations.Operation;

/**
 * Controller class to perform CRUD for template
 * 
 * @author akhilesh
 *
 */
@RestController
@RequestMapping("/api/template")
public class EntTemplateController {

	private final Logger logger = LoggerFactory.getLogger(EntTemplateController.class);

	@Autowired
	private EntTemplateService entTemplateService;

	@Operation(summary = "Get all the templates", description = "Private api, authentication required.")
	@GetMapping("/")
	@CrossOrigin
	@RolesAllowed({ ApplicationConstants.ADMIN })
	public List<TemplateResponseView> getTemplates(@RequestParam(required = false) String collectionType) {
		if(Optional.ofNullable(collectionType).isPresent()) {
			logger.debug("REST request to get templates by collectionType");
			return entTemplateService.getTemplatesByCollectionType(collectionType).stream().map(TemplateResponseView::new).collect(Collectors.toList());
		}else {
			logger.debug("REST request to get templates");
			return entTemplateService.getTemplates().stream().map(TemplateResponseView::new).collect(Collectors.toList());
		}
	}

	@Operation(summary = "Get all the templates", description = "Private api, authentication required.")
	@GetMapping("/paged")
	@RolesAllowed({ ApplicationConstants.ADMIN })
	public PagedContent<TemplateResponseView, EntTemplate> getFilteredTemplates(
			@RequestParam Integer page, @RequestParam Integer pageSize, @RequestParam(required = false) String templateApiId) {
		logger.debug("REST request to get paginated templates");
		Integer sanitizedPageNum = page >= 1 ? page - 1 : 0;
		String sanitizedTemplateApiId = StringUtils.isEmpty(templateApiId) ? ApplicationConstants.TEMPLATE_SEARCH_PARAM_ALL : templateApiId.trim();

		PagedContent<TemplateResponseView, EntTemplate> pagedContent = entTemplateService
				.getFilteredTemplates(sanitizedPageNum, pageSize, sanitizedTemplateApiId);
		return pagedContent;
	}

	@Operation(summary = "Get the template details by id", description = "Private api, authentication required.")
	@GetMapping("/{templateId}")
	@RolesAllowed({ ApplicationConstants.ADMIN })
	@CrossOrigin
	public ResponseEntity<TemplateResponseView> getTemplate(@PathVariable Long templateId) {
		logger.debug("REST request to get EntTemplate Id: {}", templateId);
		Optional<EntTemplate> entTemplateOptional = entTemplateService.getTemplate(templateId);
		if (entTemplateOptional.isPresent()) {
			return new ResponseEntity<>(entTemplateOptional.map(TemplateResponseView::new).get(), HttpStatus.OK);
		} else {
			logger.warn("Requested template '{}' does not exists", templateId);
			throw new TemplateNotFoundException(String.format(ApplicationConstants.TEMPLATE_NOT_FOUND_ERR_MSG, templateId));
		}
	}

	@Operation(summary = "Create a new template", description = "Private api, authentication required.")
	@PostMapping("/")
	@RolesAllowed({ ApplicationConstants.ADMIN })
	public ResponseEntity<TemplateResponseView> createEntTemplate(@Valid @RequestBody TemplateRequestView templateReqView) {
		logger.debug("REST request to create EntTemplate: {}", templateReqView);
		try {
			EntTemplate entity = entTemplateService.createTemplate(templateReqView.createEntity(templateReqView, null));
			return new ResponseEntity<>(new TemplateResponseView(entity), HttpStatus.CREATED);
		} catch (Exception e) {
			throw new RuntimeException(e.getMessage());
		}
	}

	@Operation(summary = "Update a template", description = "Private api, authentication required.")
	@PutMapping("/{templateId}")
	@RolesAllowed({ ApplicationConstants.ADMIN })
	public ResponseEntity<TemplateResponseView> updateTemplate(@Valid @RequestBody TemplateRequestView reqView, @PathVariable Long templateId) {
		logger.debug("REST request to update EntTemplate {}: {}", templateId);
		try {
			Optional<EntTemplate> templateOptional = entTemplateService.getTemplate(templateId);
			if (!templateOptional.isPresent()) {
				logger.warn("Template '{}' does not exists", templateId);
				throw new TemplateNotFoundException(String.format(ApplicationConstants.TEMPLATE_NOT_FOUND_ERR_MSG, templateId));
			} else {
				EntTemplate updatedEntity = entTemplateService.updateTemplate(templateOptional.get(), reqView);
				return new ResponseEntity<>(new TemplateResponseView(updatedEntity), HttpStatus.OK);
			}
		} catch (TemplateNotFoundException e) {
			throw new TemplateNotFoundException(e.getMessage());
		} catch (Exception e) {
			throw new RuntimeException(e.getMessage());
		}
	}

	@Operation(summary = "Delete a template", description = "Private api, authentication required.")
	@DeleteMapping("/{templateId}")
	@RolesAllowed({ ApplicationConstants.ADMIN })
	public ResponseEntity<String> deleteEntTemplate(@PathVariable Long templateId) {
		logger.debug("REST request to delete template {}", templateId);
		try {
			Optional<EntTemplate> entTemplateOptional = entTemplateService.getTemplate(templateId);
			if (!entTemplateOptional.isPresent()) {
				logger.warn("Requested template '{}' does not exists", templateId);
				throw new TemplateNotFoundException(String.format(ApplicationConstants.TEMPLATE_NOT_FOUND_ERR_MSG, templateId));
			}
			entTemplateService.deleteTemplate(templateId);
			return new ResponseEntity<>(ApplicationConstants.TEMPLATE_DELETED_MSG, HttpStatus.OK);
		} catch (TemplateNotFoundException e) {
			throw new TemplateNotFoundException(e.getMessage());
		} catch (Exception e) {
			throw new RuntimeException(e.getMessage());
		}
	}
}
