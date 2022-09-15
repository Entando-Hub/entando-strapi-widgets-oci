package com.entando.template.request;

import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.Size;

import com.entando.template.config.ApplicationConstants;
import com.entando.template.persistence.entity.EntTemplate;

import lombok.Data;

@Data
public class TemplateRequestView {

	@NotEmpty(message = "collectionType is mandatory field")
	private String collectionType;

	@NotEmpty(message = "templateName is mandatory field")
	@Size(min = 1, max = ApplicationConstants.TEMPLATE_NAME_MAX_LENGTH, message = "Max char length for templateName: "+ ApplicationConstants.TEMPLATE_NAME_MAX_LENGTH)
	private String templateName;
	
	@NotEmpty(message = "templateApiId is mandatory field")
	private String templateApiId;

	@NotEmpty(message = "contentShape is mandatory field")
	private String contentShape;
	private String styleSheet;

	public EntTemplate createEntity(TemplateRequestView templateRequestView, Long id) {
		EntTemplate entity = new EntTemplate();
		entity.setId(id);
		entity.setCollectionType(templateRequestView.getCollectionType());
		entity.setTemplateName(templateRequestView.getTemplateName());
		entity.setTemplateApiId(templateRequestView.getTemplateApiId());
		entity.setContentShape(templateRequestView.getContentShape());
		entity.setStyleSheet(templateRequestView.getStyleSheet());
		return entity;
	}
}
