package com.entando.apiconfig.config;

/**
 * Application constants
 */
public final class ApplicationConstants {

	public static final String ADMIN = "et-first-role";
    public static final String AUTHOR = "author";
    public static final String MANAGER = "manager";
    public static final String APPLICATION_NAME = "STRAPI";

    /* Date formats */
    public static final String API_CONFIG_CREATED_DATE_FORMAT = "yyyy-MM-dd HH:mm:ss";
    public static final String API_CONFIG_UPDATED_DATE_FORMAT = "yyyy-MM-dd HH:mm:ss";
    
    /* Messages */
    public static final String API_CONFIG_NOT_FOUND_ERR_MSG = "The Api Configuration with %s: %s not found";
    public static final String API_CONFIG_NOT_AVAILABLE= "No Api Configuration is present";
    public static final String API_CONFIG_DELETED_MSG = "Api Configuration deleted successfully.";

}
