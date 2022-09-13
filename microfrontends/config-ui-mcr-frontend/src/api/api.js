import axios from "axios";
const appUrl = `${process.env.REACT_APP_PUBLIC_URL}`;

/**
 * Request to save strapi configurations
 * @param {*} data 
 * @returns 
 */
export const saveStrapiConfiguration = async (data, url) => {
    let configUrl = `${url}/api/config/`;
    const result = await axios.post(configUrl, data, addAuthorizationRequestConfig())
        .then((res) => {
            return res;
        }).catch((e) => {
            return e;
        })
        return errorCheck(result);
}

/**
 * Request to get strapi configurations
 * @returns 
 */
export const getStrapiConfiguration = async (url) => {
    let configUrl = `${url}/api/config/`;
    const result = await axios.get(configUrl, addAuthorizationRequestConfig())
        .then((res) => {
            return res;
        }).catch((e) => {
            return e;
        });
        return errorCheck(result);
}

export const addAuthorizationRequestConfig = (config = {}, defaultBearer = 'Bearer') => {
    let defaultOptions = getDefaultOptions(defaultBearer);
    return {
        ...config,
        ...defaultOptions
    }
}

const getDefaultOptions = (defaultBearer) => {
    const token = getKeycloakToken()
    if (!token) { return {} }
    return {
        headers: {
            Authorization: `${defaultBearer} ${token}`,
        },
    }
}

const getKeycloakToken = () => {
    return ''; // only for local test
    if (window && window.entando && window.entando.keycloak && window.entando.keycloak.authenticated) {
        return window.entando.keycloak.token
    } else {
        return localStorage.getItem('token');
    }
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