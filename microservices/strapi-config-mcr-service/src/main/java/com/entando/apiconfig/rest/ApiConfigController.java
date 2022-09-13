package com.entando.apiconfig.rest;

import java.util.List;
import java.util.Optional;

import javax.validation.Valid;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.util.CollectionUtils;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.entando.apiconfig.config.ApplicationConstants;
import com.entando.apiconfig.exception.ApiConfigNotFoundException;
import com.entando.apiconfig.persistence.entity.ApiConfig;
import com.entando.apiconfig.request.ApiConfigRequestView;
import com.entando.apiconfig.response.ApiConfigResponseView;
import com.entando.apiconfig.service.ApiConfigService;

import io.swagger.v3.oas.annotations.Operation;

/**
 * Controller class to perform CRUD for Api configurations
 * 
 */
@RestController
@RequestMapping({"/api/config"})
public class ApiConfigController {

	private final Logger logger = LoggerFactory.getLogger(ApiConfigController.class);

	@Autowired
	private ApiConfigService apiConfigService;
	
	@Operation(summary = "Create an Api Configuration", description = "Public api, no authentication required.")
	@PostMapping("/")
	@CrossOrigin
//	@RolesAllowed({ ApplicationConstants.ADMIN })
	public ResponseEntity<ApiConfigResponseView> createApiConfiguration(@Valid @RequestBody ApiConfigRequestView configRequestView) {
		logger.debug("REST request to create an Api Configuration: {}", configRequestView);
		try {
			ApiConfig entity = apiConfigService.createApiConfiguration(configRequestView.createEntity(configRequestView, null));
			return new ResponseEntity<>(new ApiConfigResponseView(entity), HttpStatus.CREATED);
		} catch (org.springframework.dao.DataIntegrityViolationException e) {
			throw new RuntimeException(e.getCause().getCause().getMessage());
		} catch (Exception e) {
			throw new RuntimeException(e.getCause().getCause().getMessage());
		}
	}
	
	@Operation(summary = "Update an Api Configuration", description = "Public api, no authentication required.")
	@PutMapping("/{apiConfigId}")
	@CrossOrigin
//	@RolesAllowed({ ApplicationConstants.ADMIN })
	public ResponseEntity<ApiConfigResponseView> updateApiConfiguration(@Valid @RequestBody ApiConfigRequestView reqView, @PathVariable Long apiConfigId) {
		logger.debug("REST request to update Api Configuration: {}", apiConfigId);
		try {
			Optional<ApiConfig> apiConfigOptional = apiConfigService.getApiConfiguration(apiConfigId);
			if (!apiConfigOptional.isPresent()) {
				logger.warn("Api Configuration '{}' does not exist", apiConfigId);
				throw new ApiConfigNotFoundException(String.format(ApplicationConstants.API_CONFIG_NOT_FOUND_ERR_MSG, "id", apiConfigId));
			} else {
				ApiConfig updatedEntity = apiConfigService.updateApiConfiguration(apiConfigOptional.get(), reqView);
				return new ResponseEntity<>(new ApiConfigResponseView(updatedEntity), HttpStatus.OK);
			}
		} catch (ApiConfigNotFoundException e) {
			throw new ApiConfigNotFoundException(e.getMessage());
		} catch (org.springframework.dao.DataIntegrityViolationException e) {
			throw new RuntimeException(e.getCause().getCause().getMessage());
		} catch (Exception e) {
			throw new RuntimeException(e.getCause().getCause().getMessage());
		}
	}
	
	@Operation(summary = "Get the api configuration", description = "Public api, no authentication required.")
	@GetMapping("/")
	@CrossOrigin
//	@RolesAllowed({ ApplicationConstants.ADMIN })
	public ResponseEntity<ApiConfigResponseView> getApiConfigurations() {
		logger.debug("REST request to get Api Configurations");
		List<ApiConfig> configs = apiConfigService.getAllApiConfigurations();
		if(!CollectionUtils.isEmpty(configs)) {
			return new ResponseEntity<>(new ApiConfigResponseView(configs.get(0)), HttpStatus.OK);
		} else {
			logger.warn("Api Configuration '{}' does not exist");
			throw new ApiConfigNotFoundException(ApplicationConstants.API_CONFIG_NOT_AVAILABLE);
		}
	}
	
	@Operation(summary = "Get the Api Configuration details by id", description = "Public api, no authentication required.")
	@GetMapping("/{apiConfigId}")
	@CrossOrigin
//	@RolesAllowed({ ApplicationConstants.ADMIN })
	public ResponseEntity<ApiConfigResponseView> getApiConfigById(@PathVariable Long apiConfigId) {
		logger.debug("REST request to get Api Configuration by Id: {}", apiConfigId);
		Optional<ApiConfig> apiConfigOptional = apiConfigService.getApiConfiguration(apiConfigId);
		if (apiConfigOptional.isPresent()) {
			return new ResponseEntity<>(apiConfigOptional.map(ApiConfigResponseView::new).get(), HttpStatus.OK);
		} else {
			logger.warn("Requested Api Configuration '{}' does not exist", apiConfigId);
			throw new ApiConfigNotFoundException(String.format(ApplicationConstants.API_CONFIG_NOT_FOUND_ERR_MSG, "id", apiConfigId));
		}
	}
	
	@Operation(summary = "Delete an Api Configuration", description = "Public api, no authentication required.")
	@DeleteMapping("/{apiConfigId}")
	@CrossOrigin
//	@RolesAllowed({ ApplicationConstants.ADMIN })
	public ResponseEntity<String> deleteApiConfiguration(@PathVariable Long apiConfigId) {
		logger.debug("REST request to delete Api Configuration {}", apiConfigId);
		try {
			Optional<ApiConfig> apiConfigOptional = apiConfigService.getApiConfiguration(apiConfigId);
			if (!apiConfigOptional.isPresent()) {
				logger.warn("Requested Api Configuration '{}' does not exist", apiConfigId);
				throw new ApiConfigNotFoundException(String.format(ApplicationConstants.API_CONFIG_NOT_FOUND_ERR_MSG, "id", apiConfigId));
			}
			apiConfigService.deleteApiConfiguration(apiConfigId);
			return new ResponseEntity<>(ApplicationConstants.API_CONFIG_DELETED_MSG, HttpStatus.OK);
		} catch (ApiConfigNotFoundException e) {
			throw new ApiConfigNotFoundException(e.getMessage());
		} catch (Exception e) {
			throw new RuntimeException(e.getMessage());
		}
	}
}
