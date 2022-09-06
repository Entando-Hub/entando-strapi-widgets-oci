import axios from 'axios';
import { KC_TOKEN_PREFIX, PAGE, PAGESIZE, STRAPI_BASE_URL_KEY } from '../helper/Constant';

const templateBaseUrl = `${process.env.REACT_APP_PUBLIC_API_URL}/template/`;
const sortByCreateDateByDescOrder = `&sort=createdAt:DESC`;
const STRAPI_TOKEN = {
    'Authorization': `Bearer ${process.env.REACT_APP_LOCAL_STRAPI_TOKEN}`
}

export const postLoginAdmin = async (data) => {
    return axios.post(`${await fetchStrapiBaseUrl()}/admin/login`, data);
}

// GET Collection Type
export const getCollectionTypes = async () => {
    const { data } = await axios.get(`${await fetchStrapiBaseUrl()}/content-manager/content-types`, addAuthorizationRequestConfig({}, KC_TOKEN_PREFIX));
    return data;
}

export const getContents = async (collectionType, page = PAGE, pageSize = PAGESIZE) => {
    const rootAdminEndPoint = `${await fetchStrapiBaseUrl()}/content-manager/collection-types/api::`;
    let url = `${rootAdminEndPoint}${collectionType}.${collectionType}?page=${page}&pageSize=${pageSize}${sortByCreateDateByDescOrder}`;
    const { data } = await axios.get(url, addAuthorizationRequestConfig({}, KC_TOKEN_PREFIX));
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
    const { data } = await axios.get(url, addAuthorizationRequestConfig({}, KC_TOKEN_PREFIX))
    return data;
}

export const getCollectionLocaleWise = async (collectionType, localecode) => {
    const rootAdminEndPoint = `${await fetchStrapiBaseUrl()}/content-manager/collection-types/api::`;
    let url = `${rootAdminEndPoint}${collectionType}.${collectionType}?locale=${localecode}`;
    const { data } = await axios.get(url, addAuthorizationRequestConfig({}, KC_TOKEN_PREFIX));
    return data;
}

// API to get locales
export const getLocales = async () => {
    let url = `${await fetchStrapiBaseUrl()}/i18n/locales`
    const { data } = await axios.get(url, addAuthorizationRequestConfig({}, KC_TOKEN_PREFIX));
    return data;
}

export const fetchContents = async (collectionType) => {
    return await getContents(collectionType);
}

export const getContentDetailsByCollectionTypeAndId = async (collectionType, contentId) => {
    const rootAdminEndPoint = `${await fetchStrapiBaseUrl()}/content-manager/collection-types/api::`;
    let url = `${rootAdminEndPoint}${collectionType}.${collectionType}/${contentId}`;
    const { data } = await axios.get(url, addAuthorizationRequestConfig({}, KC_TOKEN_PREFIX));
    return data;
}

export const filterContentsByName = async (collectionType, query, searchBy, page = PAGE, pageSize = PAGESIZE) => {
    if (!collectionType) {
        throw new Error('collectionType is missing');
    }
    const rootAdminEndPoint = `${await fetchStrapiBaseUrl()}/content-manager/collection-types/api::`;
    const url = `${rootAdminEndPoint}${collectionType}.${collectionType}?filters[${searchBy}][$containsi]=${query}&page=${page}&pageSize=${pageSize}`

    const { data } = await axios.get(url, addAuthorizationRequestConfig({}, KC_TOKEN_PREFIX))
    return data;
}

// API to list of templates Spring-Boot API
export const getTemplate = async (collectionType) => {
    const collectionTypeUrl = collectionType ? `?collectionType=${collectionType}` : "";
    const data = await axios.get(`${templateBaseUrl+collectionTypeUrl}`, addAuthorizationRequestConfig({}));
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
 * Get strapi configuration from local storage
 * @returns 
 */
export const fetchStrapiBaseUrl = async () => {
    const strapiBaseUrl = localStorage.getItem(STRAPI_BASE_URL_KEY);
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
