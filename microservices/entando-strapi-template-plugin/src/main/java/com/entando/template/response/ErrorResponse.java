package com.entando.template.response;

import java.util.List;
import lombok.Data;

@Data
public class ErrorResponse {
	//General error message about nature of error
	private boolean isError;
    private String message;
    private String exception;
 
    //Specific errors in API request processing
    private List<String> details;
 
	public ErrorResponse(String message, String exception, List<String> details) {
        super();
        this.isError = true;
        this.message = message;
        this.exception = exception;
        this.details = details;
    }
}
