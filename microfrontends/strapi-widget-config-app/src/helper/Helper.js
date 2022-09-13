import { STRAPI_EXCLUDE_KEYS } from "./Constant";

/**
 * Value to show under Name colum in the table.
 * Checks if name or title key is present, if yes, fetches its value or fetches any other key's value by excluding some specific keys.
 * @param {*} content
 * @returns
 */
export const getKey = (content) => {
    if (content) {
        const keys = Object.keys(content);
        let index = keys.findIndex(item => 'title' === item.toLowerCase());
        if (index > -1) {
            return Object.keys(content)[index];
        } else {
            index = keys.findIndex(item => 'name' === item.toLowerCase());
            if (index > -1) {
                return Object.keys(content)[index];
            } else {
                const allowedKeys = keys.filter(item => !STRAPI_EXCLUDE_KEYS.includes(item));
                if (allowedKeys && allowedKeys.length) {
                    return allowedKeys[0];
                }
            }
        }
    }
    return '-';
}
export const PAGINATION_MESSAGES = (props) => ({
    "firstPage": props.intl.formatMessage({ id: "app.firstPage" }),
    "previousPage": props.intl.formatMessage({ id: "app.previousPage" }),
    "currentPage": props.intl.formatMessage({ id: "app.currentPage" }),
    "nextPage": props.intl.formatMessage({ id: "app.nextPage" }),
    "lastPage": props.intl.formatMessage({ id: "app.lastPage" }),
    "perPage": props.intl.formatMessage({ id: "app.perPage" }),
    "of": props.intl.formatMessage({ id: "app.of" })
});

export const parseData = (data) => data.length > 0 ? JSON.parse(data) : data;