import axios from "axios";
import { KC_TOKEN_PREFIX, STRAPI_BASE_URL_KEY } from "../constant/constant";
import { addAuthorizationRequestConfig } from "./Integration";

/**
 * Get strapi content types
 * @returns
 */
export const getStrapiContentTypes = async () => {
    const url = `${await fetchStrapiBaseUrl()}/content-manager/content-types`;
    const data = await axios.get(url, addAuthorizationRequestConfig({}, KC_TOKEN_PREFIX));
    return data;
}

/**
 * Get attribute fields of given content type from strapi
 * @param {*} contentType 
 * @returns
 */
export const getFields = async (contentType) => {
    const strapiBaseUrl = await fetchStrapiBaseUrl();
    const STRAPI_COLTYPE_URL = `${strapiBaseUrl}/content-manager/collection-types/`;
    const { data: { results } } = await axios.get(`${STRAPI_COLTYPE_URL}${contentType}`, addAuthorizationRequestConfig({}, KC_TOKEN_PREFIX));
    const getContentTypeObj = await getContentTypes(contentType.split('.')[contentType.split('.').length - 1]);

    const content = {};
    if (results && results.length) {
        const fieldsArr = Object.keys(getContentTypeObj);
        const obj = {}
        mutableDataObj = getContentTypeObj;
        for (const One in mutableDataObj) {
            if (Object.hasOwnProperty.call(mutableDataObj, One)) {
                const element = mutableDataObj[One];
                if (typeof mutableDataObj[One] === 'object' && mutableDataObj[One] !== null && !Array.isArray(mutableDataObj[One])) {
                    obj[One] = Object.keys(mutableDataObj[One]);
                }
            }
        }

        fieldsArr.map((el) => {
            if (obj.hasOwnProperty(el)) {
                const arr = obj[el];
                content[el] = arr;
            } else {
                content[el] = [
                    "getTextForLang(\"<LANG_CODE>\")",
                    "text",
                    "textMap(\"<LANG_CODE>\")"
                ]
            }
        });
    }
    let contentObject = { '$content': content };
    return contentObject;
}

let mutableDataObj = {};

export const getAttributes = async (contentType) => {
    const STRAPI_COLTYPE_URL = `${await fetchStrapiBaseUrl()}/content-manager/collection-types/`;
    const { data: { results } } = await axios.get(`${STRAPI_COLTYPE_URL}${contentType}`, addAuthorizationRequestConfig({}, KC_TOKEN_PREFIX));
    if (results && results.length) {
        const fieldsArr = Object.keys(results[0]);

        return fieldsArr;
    }
}

/**
 * Mapping with content-types with components
 * @param {*} conType
 * @returns
 */
export const getContentTypes = async (conType) => {
    const strapiBaseUrl = await fetchStrapiBaseUrl();
    const { data: { data: contentTypesList } } = await axios.get(`${strapiBaseUrl}/content-type-builder/content-types`, addAuthorizationRequestConfig({}, KC_TOKEN_PREFIX));
    const filteredContentType = contentTypesList.filter(el => el.uid.startsWith('api::'));
    const { data: { data: componentsList } } = await axios.get(`${strapiBaseUrl}/content-type-builder/components`, addAuthorizationRequestConfig({}, KC_TOKEN_PREFIX));
    if (contentTypesList.length) {
        filteredContentType.map(el => {
            for (const key in el.schema.attributes) {
                if (Object.hasOwnProperty.call(el.schema.attributes, key)) {
                    const element = el.schema.attributes[key];
                    if (isTypeComponent(element, componentsList)) {
                        const filtered = filterBy(componentsList, element)
                        el.schema.attributes[key] = filtered[0].schema.attributes;
                        for (const pointer in filtered[0].schema.attributes) {
                            if (Object.hasOwnProperty.call(filtered[0].schema.attributes, pointer)) {
                                const elementTwo = filtered[0].schema.attributes[pointer];
                                if (isTypeComponent(elementTwo, componentsList)) {
                                    const filteredTwo = filterBy(componentsList, elementTwo);
                                    el.schema.attributes[key][pointer] = filteredTwo[0].schema.attributes;
                                }
                            }
                        }
                    } else if (isTypeDynamiczone(element, componentsList)) {
                        el.schema.attributes[key].type = 'array';
                    }
                }
            }
        })
    } else {
        console.error('Something Went Wrong');
    }
    let filterListByConType = filteredContentType.filter(el => {
        if (el.uid.split('.')[el.uid.split('.').length - 1] === conType) {
            return el;
        }
    });
    if (filterListByConType && filterListByConType.length && filterListByConType[0].schema) {
        return filterListByConType[0].schema.attributes;
    }
}

/**
 * To check if type is component type
 * @param {*} element
 * @param {*} componentsList
 * @returns
 */
function isTypeComponent(element, componentsList) {
    return element.type === 'component' && componentsList.length;
}

/**
 * To check if type is dynamiczone type
 * @param {*} element
 * @param {*} componentsList
 * @returns
 */
function isTypeDynamiczone(element, componentsList) {
    return element.type === 'dynamiczone' && componentsList.length;
}

function filterBy(componentsList, element) {
    return (
        componentsList.filter(el => element.component.split('.')[element.component.split('.').length - 1] === el.uid.split('.')[el.uid.split('.').length - 1])
    );
}

/**
 * Get strapi configurations
 * @returns
 */
export const getStrapiConfigurations = async (configServerURL) => {
    
    const result = await axios.get(`${configServerURL}/api/config/`)
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
    url && url.endsWith('/') ? '' : url = url + '/';
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