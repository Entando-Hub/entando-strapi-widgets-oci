package com.entando.template.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class TemplateNotFoundException extends RuntimeException {

	private static final long serialVersionUID = 1L;

	public TemplateNotFoundException() {
		super();
	}

	public TemplateNotFoundException(final String message) {
		super(message);
	}
}
