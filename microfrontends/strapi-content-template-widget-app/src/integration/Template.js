import { deleteData, getData, postData, putData } from "./Http";
import { checkForErrorsAndSendResponse } from "./Integration";

// Template endpoints
const templateBaseUrl = `${process.env.REACT_APP_PUBLIC_API_URL}/template/`;
const urlPagedTemplates = `${templateBaseUrl}paged`;

/*********************
 * TEMPLATES ********
 *********************/

/**
 * Get paginated templates
 * @returns 
 */
export const getAllTemplates = async (page, pageSize, selectedContentType, endpointPath) => {
    const url = `${endpointPath}/api/template/paged?page=${page}&pageSize=${pageSize}&templateApiId=${encodeURIComponent(selectedContentType)}`;
    // const url = `${urlPagedTemplates}?page=${page}&pageSize=${pageSize}&templateApiId=${encodeURIComponent(selectedContentType)}`;
    const { data, isError } = await getData(url)
    // eventHandler(
    //     isError,
    //     `${i18n.t('toasterMessage.impossibleToLoadCategory')} ${data ? data.message : ""}`
    // )
    return checkForErrorsAndSendResponse(data, isError, "templateList")
}

/**
 * Add a template
 * @param {} templateData
 * @returns 
 */
export const addNewTemplate = async (templateData, endpointPath) => {

    const { data, isError } = await postData(`${endpointPath}/api/template/`, templateData);
    // const { data, isError } = await postData(templateBaseUrl, templateData);
    return checkForErrorsAndSendResponse(data, isError, "newTemplate")
}

export const editTemplate = async (templateData,id, endpointPath) => {
    const { data, isError } = await putData(`${endpointPath}/api/template/${id}`, templateData);
    // const { data, isError } = await putData(templateBaseUrl+id, templateData);
    return checkForErrorsAndSendResponse(data, isError, "newTemplate")
}

/**
 * Delete a template
 * @param {} page 
 * @param {*} pageSize 
 * @param {*} selectedCollectionType 
 * @returns 
 */
export const deleteTemplate = async (templateId, endpointPath) => {
    const { data, isError } = await deleteData(`${endpointPath}/api/template/`, templateId)
    return checkForErrorsAndSendResponse(data, isError, "message")
}


/**
 * Get template by id
 * @returns 
 */
 export const getTemplateById = async (templateId, endpointPath) => {
    const { data, isError } = await getData(`${endpointPath}/api/template/`, templateId)
    // eventHandler(
    //     isError,
    //     `${i18n.t('toasterMessage.impossibleToLoadCategory')} ${data ? data.message : ""}`
    // )
    return checkForErrorsAndSendResponse(data, isError, "templateData")
}