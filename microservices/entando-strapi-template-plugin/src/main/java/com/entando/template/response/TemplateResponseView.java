package com.entando.template.response;

import java.time.LocalDateTime;

import com.entando.template.config.ApplicationConstants;
import com.entando.template.persistence.entity.EntTemplate;
import com.fasterxml.jackson.annotation.JsonFormat;

import lombok.Data;

@Data
public class TemplateResponseView {
	private Long id;
	private String templateName;
	private String templateApiId;
	private String collectionType;
	private String contentShape;
	private String styleSheet;

	@JsonFormat(pattern=ApplicationConstants.TEMPLATE_CREATED_DATE_FORMAT)
	private LocalDateTime createdAt;
	
	@JsonFormat(pattern=ApplicationConstants.TEMPLATE_UPDATED_DATE_FORMAT)
	private LocalDateTime updatedAt;
	
	public TemplateResponseView() {
		super();
	}
	public TemplateResponseView(EntTemplate entity) {
		this.id = entity.getId();
		this.templateName = entity.getTemplateName();
		this.templateApiId = entity.getTemplateApiId();
		this.collectionType = entity.getCollectionType();
		this.contentShape = entity.getContentShape();
		this.styleSheet = entity.getStyleSheet();
		this.createdAt = entity.getCreatedAt();
		this.updatedAt = entity.getUpdatedAt();
	}
}
