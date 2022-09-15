import { getStrapiContentTypes } from '../integration/StrapiAPI';

export const getKeycloakToken = () => {
    if (window && window.entando && window.entando.keycloak && window.entando.keycloak.authenticated) {
        return window.entando.keycloak.token
    }
    return ''
}

export const isAuthenticated = props => {
    const {keycloak} = props
    return keycloak.initialized && keycloak.authenticated
}

export const authenticationChanged = (props, prevProps) => {
    const authenticated = isAuthenticated(props)
    const changedAuth = prevProps.keycloak.authenticated !== authenticated
    return authenticated && changedAuth
}

// export const isHubAdmin = () => {
//     return hasKeycloakClientRole(ADMIN)
// }

// export const isHubAuthor = () => {
//     return hasKeycloakClientRole(AUTHOR)
// }

// export const isHubManager = () => {
//     return hasKeycloakClientRole(MANAGER)
// }

// export const isHubUser = () => {
//     return isHubAdmin() || isHubManager() || isHubAuthor()
// }

// export const getHigherRole = () => {
//     if (isHubAdmin()) return ADMIN
//     if (isHubManager()) return MANAGER
//     if (isHubAuthor()) return AUTHOR
// }

export const getUserName = async () => {
    if (window.entando && window.entando.keycloak && window.entando.keycloak.tokenParsed) {
        const userInfo = window.entando.keycloak.tokenParsed;
        return userInfo.preferred_username;
    } else {
        return ""
    }
}


export const hasKeycloakClientRole = clientRole => {
    if (getKeycloakToken()) {
        const {resourceAccess} = window.entando.keycloak
        if (resourceAccess) {
            for (const client in resourceAccess) {
                const item = resourceAccess[client]
                if (item.roles && item.roles.includes(clientRole)) {
                    return true
                }
            }
        }
    }
    return false
}


export const getDefaultOptions = () => {
    const token = getKeycloakToken()
    if (!token) return {}
    return {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    }
}

// export const clickableSSHGitURL= (gitRepoUrl) => {
//     if (gitRepoUrl.startsWith(MATCHER)) {
//         return `${GIT_DOMAIN}${gitRepoUrl.split(':')[1]}`;
//     }
//     return gitRepoUrl;
// }

export const isCurrentUserAuthenticated = () => {
   return window.entando && window.entando.keycloak && window.entando.keycloak.authenticated;
}

// export const isCurrentUserAssignedAValidRole = () => {
//     return USER_ROLES.includes(getHigherRole());
// }

export const isCurrentUserAssignedAPreferredName = () => {
    return window.entando.keycloak.tokenParsed && window.entando.keycloak.tokenParsed.preferred_username;
}

/**
 * Get all collection types and filter them based on api::
 * @returns 
 */
export const getFilteredContentTypes = async () => {
    let filteredCollectionTypes;
    const { data: { data } } = await getStrapiContentTypes();
    if (data.length) {
        filteredCollectionTypes = data.filter((el) => el.uid.startsWith('api::') && el.isDisplayed);
    }
    return filteredCollectionTypes;
}

/**
 * Fetch required fields from the filtered collection types
 * @returns 
 */
export const getSanitizedCollectionTypes = async () => {
    let sanitizedCollectionTypes = [];
    const data = await getFilteredContentTypes();
    if (data.length) {
        data.forEach(element => {
            if(element) {
                sanitizedCollectionTypes.push({...element.info, apiID: element.apiID});
            }
        });
    }
    return sanitizedCollectionTypes;
}

export const filterACollectionType = async (data, collectionType) => {
    let filteredCollectionType;
    if (data.length) {
        filteredCollectionType = data.filter((el) => el.label === collectionType);
    }
    return filteredCollectionType;
}

export const PAGINATION_MESSAGES = (props) => ({
    "firstPage": props.intl.formatMessage({ id: "app.firstPage" }),
    "previousPage": props.intl.formatMessage({ id: "app.previousPage" }),
    "currentPage": props.intl.formatMessage({ id: "app.currentPage" }),
    "nextPage": props.intl.formatMessage({ id: "app.nextPage" }),
    "lastPage": props.intl.formatMessage({ id: "app.lastPage" }),
    "perPage": props.intl.formatMessage({ id: "app.perPage" }),
    "of": props.intl.formatMessage({ id: "app.of" }),
});