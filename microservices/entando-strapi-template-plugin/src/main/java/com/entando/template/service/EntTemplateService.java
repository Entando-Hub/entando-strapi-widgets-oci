package com.entando.template.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com.entando.template.config.ApplicationConstants;
import com.entando.template.persistence.EntTemplateRepository;
import com.entando.template.persistence.entity.EntTemplate;
import com.entando.template.request.TemplateRequestView;
import com.entando.template.response.TemplateResponseView;
import com.entando.template.util.PagedContent;

@Service
public class EntTemplateService {

	private final Logger logger = LoggerFactory.getLogger(EntTemplateService.class);
	private final String CLASS_NAME = this.getClass().getSimpleName();

	@Autowired
	private EntTemplateRepository templateRepository;

	/**
	 * Get all templates
	 * @return
	 */
	public List<EntTemplate> getTemplates() {
		return templateRepository.findAll();
	}
	
	/**
	 * Get all templates by collection type
	 * @return
	 */
	public List<EntTemplate> getTemplatesByCollectionType(String templateApiId) {
		return templateRepository.findByTemplateApiIdIgnoreCaseOrderByTemplateName(templateApiId);
	}

	/**
	 * Get templates paginated
	 * @param pageNum
	 * @param pageSize
	 * @param code
	 * @return
	 */
	public PagedContent<TemplateResponseView, EntTemplate> getFilteredTemplates(Integer pageNum,
			Integer pageSize, String sanitizedTemplateApiId) {
		logger.debug("{}: getFilteredTemplates: Get templates in paginated manner", CLASS_NAME);
		Pageable pageable;
		Page<EntTemplate> page = null;

		if (pageSize == 0) {
			pageable = Pageable.unpaged();
		} else {
			pageable = PageRequest.of(pageNum, pageSize, Sort.by(new Sort.Order(Sort.Direction.ASC, ApplicationConstants.TEMPLATE_SORT_PARAM_TEMPLATE_NAME))
					.and(Sort.by(ApplicationConstants.TEMPLATE_SORT_PARAM_UPDATAED_AT).descending()));
		}

		//Check if search parameter is 'all/All/ALL'
		if(sanitizedTemplateApiId.equalsIgnoreCase(ApplicationConstants.TEMPLATE_SEARCH_PARAM_ALL)) {
			page = templateRepository.findAll(pageable);
		} else {
			page = templateRepository.findByTemplateApiId(sanitizedTemplateApiId, pageable);
		}

		PagedContent<TemplateResponseView, EntTemplate> pagedContent = new PagedContent<>(toResponseViewList(page), page);
		return pagedContent;
	}

	/**
	 * Get a template by id
	 * @param templateId
	 * @return
	 */
	public Optional<EntTemplate> getTemplate(Long templateId) {
		return templateRepository.findById(templateId);
	}

	/**
	 * 
	 * @param toSave
	 * @return
	 */
	public EntTemplate createTemplate(EntTemplate toSave) {
		toSave.setCreatedAt(LocalDateTime.now());
		toSave.setUpdatedAt(LocalDateTime.now());
		return templateRepository.save(toSave);
	}

	/**
	 * Update a template
	 * @param toUpdate
	 * @param reqView
	 * @return
	 */
	public EntTemplate updateTemplate(EntTemplate toUpdate, TemplateRequestView reqView) {
		toUpdate.setCollectionType(reqView.getCollectionType());
		toUpdate.setTemplateName(reqView.getTemplateName());
		toUpdate.setContentShape(reqView.getContentShape());
		toUpdate.setStyleSheet(reqView.getStyleSheet());
		toUpdate.setUpdatedAt(LocalDateTime.now());
		return templateRepository.save(toUpdate);
	}

	/**
	 * 
	 * @param templateId
	 */
	public void deleteTemplate(Long templateId) {
		templateRepository.deleteById(templateId);
	}

	/**
	 * Convert to response view list
	 * 
	 * @param page
	 * @return
	 */
	private List<TemplateResponseView> toResponseViewList(Page<EntTemplate> page) {
		logger.debug("{}: toResponseViewList: Convert Bundle Group Version list to response view list", CLASS_NAME);
		List<TemplateResponseView> list = new ArrayList<TemplateResponseView>();
		page.getContent().stream().forEach((entity) -> {
			TemplateResponseView viewObj = new TemplateResponseView();
			viewObj.setId(entity.getId());
			viewObj.setCollectionType(entity.getCollectionType());
			viewObj.setTemplateApiId(entity.getTemplateApiId());
			viewObj.setTemplateName(entity.getTemplateName());
			viewObj.setContentShape(entity.getContentShape());
			viewObj.setStyleSheet(entity.getStyleSheet());
			viewObj.setCreatedAt(entity.getCreatedAt());
			viewObj.setUpdatedAt(entity.getUpdatedAt());

			list.add(viewObj);
		});
		return list;
	}
}
