package com.entando.apiconfig.request;

import javax.validation.constraints.NotEmpty;

import org.springframework.http.HttpMethod;

import lombok.Data;

@Data
public class ApiProxyRequestView {
	
	@NotEmpty(message = "contextPath is mandatory field")
	private String contextPath;
	
	@NotEmpty(message = "method is mandatory field")
	private HttpMethod httpMethod;
	
	@NotEmpty(message = "kcToken is mandatory field")
	private String token;
	
	private String uri;

}
