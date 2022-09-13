import axios from 'axios';
import { STRAPI_BASE_URL_KEY } from '../helper/Constant';

const apiEndPoint = `${process.env.REACT_APP_PUBLIC_API_URL}/template/searchby/`;
const EntKcToken = 'EntKcToken';

const STRAPI_TOKEN = {
    'Authorization': `Bearer ${process.env.REACT_APP_LOCAL_STRAPI_TOKEN}`
}

export const getTemplate = async (searchby = 'code', searchTerm) => {
    return await axios.get(`${apiEndPoint}${searchby}/${searchTerm}`,addAuthorizationRequestConfig({}))
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
 * getTemplate Get all templates.
 * @param {*} templateId : TemplateId.
 * @returns
 */
export const getTemplates = async (templateIds) => {
    const { data: templateData } = await axios.get(`${process.env.REACT_APP_PUBLIC_API_URL}/template/`, addAuthorizationRequestConfig({}));
    const filtered = templateData.filter(temp => {
        return templateIds.indexOf(temp.id + "") > -1
    });
    return filtered
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
    const { data } = await axios.get(url, addAuthorizationRequestConfig({}, EntKcToken))

    return data;
}

/**
 * getContents get all contents.
 * @param {*} contentType
 * @param {*} contentId
 * @returns
 */
export const getContents = async (contentName, contentIds) => {
    if (!contentName && !contentIds.length) console.error(contentName);
    const strapiUrl = await fetchStrapiBaseUrl();
    const apiendpoints = contentIds.map(el => `${strapiUrl}/content-manager/collection-types/api::${contentName}.${contentName}/${el}`);
    const data = await axios.all(apiendpoints.map((endpoint) => axios.get(endpoint, addAuthorizationRequestConfig({}, EntKcToken))));
    return data.map((item) => {
        return item.data;
    });
}

export const filterContentByQuery = async (contentName, fieldName, searchQuery) => {
    let finaldata = null;
    // Passing page size as 100 due to strapi restriction.
    // Getting searched data.
    const { data: { results } } = await axios.get(
        `${await fetchStrapiBaseUrl()}/content-manager/collection-types/api::${contentName}.${contentName}?page=1&pageSize=100&sort=createdAt:DESC&filters[${fieldName}][$containsi]=${searchQuery}`,
        addAuthorizationRequestConfig({}, EntKcToken)
    );
    if (results) {
        const strapiUrl = await fetchStrapiBaseUrl();
        finaldata = await axios.all(results.map(el => el.id).map(id => axios.get(
            `${strapiUrl}/content-manager/collection-types/api::${contentName}.${contentName}/${id}`,
            addAuthorizationRequestConfig({}, EntKcToken))));
    }
    return finaldata.length ? finaldata.map(data => data.data) : [];
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
        if (defaultBearer === EntKcToken) {
            return {
                headers: STRAPI_TOKEN
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

//To update the build