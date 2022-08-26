package com.entando.template.config;

/**
 * Application constants
 */
public final class ApplicationConstants {
    
    public static final String TEMPLATE_DOES_NOT_EXIST_MSG = "The template does not exist.";
    
    public static final String TEMPLATE_DELETED_MSG = "Template deleted successfully.";
    
    public static final String SPRING_PROFILE_DEVELOPMENT = "dev";

    public static final String ADMIN = "et-first-role";

    public static final String AUTHOR = "eh-author";

    public static final String MANAGER = "eh-manager";

    /* Date formats */
    public static final String TEMPLATE_CREATED_DATE_FORMAT = "yyyy-MM-dd HH:mm:ss";
    public static final String TEMPLATE_UPDATED_DATE_FORMAT = "yyyy-MM-dd HH:mm:ss";
    
    /* Parameter values */
    public static final String TEMPLATE_SEARCH_PARAM_ALL = "ALL";
    public static final String TEMPLATE_SORT_PARAM_UPDATAED_AT = "updatedAt";
    public static final String TEMPLATE_SORT_PARAM_TEMPLATE_NAME = "templateName";
    
    public static final short TEMPLATE_NAME_MAX_LENGTH = 50;
    
    public static final String TEMPLATE_NOT_FOUND_ERR_MSG = "The template with id %s not found";
    public static final String TEMPLATE_ALREADY_EXISTS_ERR_MSG = "A template with same code already exists";

}
