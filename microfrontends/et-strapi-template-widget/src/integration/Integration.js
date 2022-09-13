import { KC_TOKEN_PREFIX, REACT_APP_LOCAL_STRAPI_TOKEN } from "../constant/constant";

const STRAPI_TOKEN = {
    'Authorization': `Bearer ${REACT_APP_LOCAL_STRAPI_TOKEN}`
}

// Get authrization tokens
export const addAuthorizationRequestConfig = (config = {}, defaultBearer = 'Bearer') => {
    let defaultOptions = getDefaultOptions(defaultBearer);
    return {
        ...config,
        ...defaultOptions
    }
}

const getKeycloakToken = () => {
    // uncomment only for development purpose only
    // return '';
    if (window && window.entando && window.entando.keycloak && window.entando.keycloak.authenticated) {
        return window.entando.keycloak.token
    } else {
        return localStorage.getItem('token');
    }
}

const getDefaultOptions = (defaultBearer) => {
    const token = getKeycloakToken()
    if (!token) {
        //Below if condition is to run the strapi API in local
        if (defaultBearer === KC_TOKEN_PREFIX) {
            return {
                headers: STRAPI_TOKEN,
            }
        } else {
            return {}
        }
    }
    // logic to add token for both strapi and MS api
    return {
        headers: {
            Authorization: `${defaultBearer} ${token}`,
        },
    }
}

// checks if the input data contain an error and sends back either the error itself or the actual data
export const checkForErrorsAndSendResponse = (data, isError, objectLabel) => {
    if (isError) {
        return {
            errorBody: data,
            isError,
        }
    } else {
        return {
            [objectLabel]: data,
            isError,
        }
    }
}

