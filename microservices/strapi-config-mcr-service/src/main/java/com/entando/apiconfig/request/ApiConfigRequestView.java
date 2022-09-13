package com.entando.apiconfig.request;

import javax.validation.constraints.NotEmpty;

import com.entando.apiconfig.config.ApplicationConstants;
import com.entando.apiconfig.persistence.entity.ApiConfig;

import lombok.Data;

@Data
public class ApiConfigRequestView {

	@NotEmpty(message = "baseUrl is mandatory field")
	private String baseUrl;
	
	public ApiConfig createEntity(ApiConfigRequestView apiConfigRequestView, Long id) {
		ApiConfig entity = new ApiConfig();
		entity.setId(id);
		entity.setApplicationName(ApplicationConstants.APPLICATION_NAME);
		entity.setBaseUrl(apiConfigRequestView.getBaseUrl());
		return entity;
	}
}
