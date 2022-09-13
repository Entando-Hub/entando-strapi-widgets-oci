import axios from 'axios';
import { STRAPI_BASE_URL_KEY } from '../helper/Constant';

const apiEndPoint = `${process.env.REACT_APP_PUBLIC_API_URL}/template/searchby/`;
const STRAPI_TOKEN = {
    'Authorization': `Bearer ${process.env.REACT_APP_LOCAL_STRAPI_TOKEN}`
}

export const getTemplate = async (searchby = 'code', searchTerm) => {
    return await axios.get(`${apiEndPoint}${searchby}/${searchTerm}`, addAuthorizationRequestConfig({}))
}

/**
 * getTemplateById Search Template By Id.
 * @param {*} templateId : TemplateId.
 * @returns 
 */
export const getTemplateById = async (templateId) => {
    const { data } = await axios.get(`${process.env.REACT_APP_PUBLIC_API_URL}/template/${templateId}`, addAuthorizationRequestConfig({}));
    return data;
}

/**
 * getContentById Search Content By Id.
 * @param {*} contentType 
 * @param {*} contentId 
 * @returns 
 */
 export const getContentById = async (contentName, contentId) => {
    if (!contentName || !contentId) console.error(contentName, contentId);
    const url = `${await fetchStrapiBaseUrl()}/content-manager/collection-types/api::${contentName}.${contentName}/${contentId}`;
    const { data } = await axios.get(url, addAuthorizationRequestConfig({}, 'EntKcToken'))

    return data;
}

const getKeycloakToken = () => {
    // For testing purpose only
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
        if (defaultBearer === 'EntKcToken') {
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

// Get authorization tokens
export const addAuthorizationRequestConfig = (config = {}, defaultBearer = 'Bearer') => {
    let defaultOptions = getDefaultOptions(defaultBearer);
    return {
        ...config,
        ...defaultOptions
    }
}

/**
 * Get strapi configurations
 * @returns
 */
export const getStrapiConfigurations = async () => {
    const result = await axios.get(process.env.REACT_APP_STRAPI_CONFIG_BE_URL)
        .then((res) => {
            return res;
        }).catch((e) => {
            return e;
        });
    return errorCheck(result);
}

/**
 * Check if the given url is available
 * @param {*} url 
 * @returns 
 */
export const checkIfUrlExists = async (url) => {
    const result = await axios.head(url)
        .then((res) => {
            return res;
        }).catch((e) => {
            return e;
        });
    return errorCheck(result);
}

/**
 *  Get strapi configuration from local storage
 * @returns
 */
export const fetchStrapiBaseUrl = async () => {
    const strapiBaseUrl = localStorage.getItem(STRAPI_BASE_URL_KEY)
    if (!strapiBaseUrl) {
        const { data, isError } = await getStrapiConfigurations();
        if (!isError && data && data.data && data.data.baseUrl) {
            const result = await checkIfUrlExists(data.data.baseUrl);
            if (result && result.data && result.data.status === 200 && !result.isError) {
                localStorage.setItem(STRAPI_BASE_URL_KEY, data.data.baseUrl);
                return data.data.baseUrl;
            }
        }
    }
    return strapiBaseUrl;
}

const errorCheck = (data) => {
    let isError = false
    if (data.hasOwnProperty("toJSON") && data.toJSON().name === "Error") {
        isError = true
    }
    return {
        data,
        isError,
    }
}