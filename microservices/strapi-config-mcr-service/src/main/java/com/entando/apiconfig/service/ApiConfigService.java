package com.entando.apiconfig.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;

import com.entando.apiconfig.persistence.ApiConfigRepository;
import com.entando.apiconfig.persistence.entity.ApiConfig;
import com.entando.apiconfig.request.ApiConfigRequestView;
import com.entando.apiconfig.response.ApiConfigResponseView;

@Service
public class ApiConfigService {

	private final Logger logger = LoggerFactory.getLogger(ApiConfigService.class);
	private final String CLASS_NAME = this.getClass().getSimpleName();

	@Autowired
	private ApiConfigRepository apiConfigRepository;

	/**
	 * Get all Api Configurations
	 * @return
	 */
	public List<ApiConfig> getAllApiConfigurations() {
		return apiConfigRepository.findAll();
	}
	
	/**
	 * Get an Api Configuration by id
	 * @param apiConfigId
	 * @return
	 */
	public Optional<ApiConfig> getApiConfiguration(Long apiConfigId) {
		return apiConfigRepository.findById(apiConfigId);
	}

	/**
	 * 
	 * @param toSave
	 * @return
	*/
	public ApiConfig createApiConfiguration(ApiConfig toSave) {
		List<ApiConfig> configs = getAllApiConfigurations();
		if(CollectionUtils.isEmpty(configs)) {
			toSave.setCreatedAt(LocalDateTime.now());
			toSave.setUpdatedAt(LocalDateTime.now());
			return apiConfigRepository.save(toSave);
		} else {
			ApiConfig apiConfigDb = configs.get(0);
			apiConfigDb.setBaseUrl(toSave.getBaseUrl());
			apiConfigDb.setUpdatedAt(LocalDateTime.now());
			return apiConfigRepository.save(apiConfigDb);
		}
	}

	/**
	 * Update an Api Configuration
	 * @param toUpdate
	 * @param reqView
	 * @return
	 */
	public ApiConfig updateApiConfiguration(ApiConfig toUpdate, ApiConfigRequestView reqView) {
		toUpdate.setBaseUrl(reqView.getBaseUrl());
		toUpdate.setUpdatedAt(LocalDateTime.now());
		
		return apiConfigRepository.save(toUpdate);
	}

	/**
	 * Delete an Api Configuration
	 * @param apiConfigId
	 */
	public void deleteApiConfiguration(Long apiConfigId) {
		apiConfigRepository.deleteById(apiConfigId);
	}

	/**
	 * Convert to response view list
	 * Not in use
	 * @param page
	 * @return
	 */
	private List<ApiConfigResponseView> toResponseViewList(Page<ApiConfig> page) {
		logger.debug("{}: toResponseViewList: Convert ApiConfig list to response view list", CLASS_NAME);
		List<ApiConfigResponseView> list = new ArrayList<ApiConfigResponseView>();
		page.getContent().stream().forEach((entity) -> {
			ApiConfigResponseView viewObj = new ApiConfigResponseView();
			viewObj.setId(entity.getId());
			viewObj.setApplicationName(entity.getApplicationName());
			viewObj.setBaseUrl(entity.getBaseUrl());
			viewObj.setCreatedAt(entity.getCreatedAt());
			viewObj.setUpdatedAt(entity.getUpdatedAt());

			list.add(viewObj);
		});
		return list;
	}
}
