import React, { useEffect, useState } from 'react';
import { fetchStrapiBaseUrl, filterContentByQuery, getContents, getTemplateById, getTemplates } from './api/Api';
import './app.css';
import { STRAPI_BASE_URL_KEY } from './helper/Constant';
import StrapiConfigWarning from './page/StrapiConfigWarning';
var velocityjs = require("velocityjs");

function App({ contentName, contentIdsAndTemplateIds, saveQueryDetails, colLabelName }) {
    const [htmlCode, setHtmlCode] = useState(null);
    const [CID_TID, set_CID_TID] = useState(decodeURI(contentIdsAndTemplateIds));

    useEffect(async () => {
        const cid_tid_obj = CID_TID.length && JSON.parse(CID_TID);
        if (contentName) {
            // if (saveQueryDetails && colLabelName) {
            if (saveQueryDetails) {
                await fetchBySaveQuery();
            }
            if (cid_tid_obj) {
                await fetchMultiSelect(cid_tid_obj);
            }
        }
    }, []);

    async function fetchMultiSelect(cid_tid_obj) {
        const domain = await fetchStrapiBaseUrl();
        const getTemplateData = await getTemplates(cid_tid_obj.map(el => el.templateId));
        const getContentsData = await getContents(contentName, cid_tid_obj.map(el => el.contentId));
        mappingOfDataWithTemplate(getTemplateData, getContentsData, cid_tid_obj, domain);
    }

    async function fetchBySaveQuery() {
        const domain = await fetchStrapiBaseUrl();
        const queryDetails = JSON.parse(decodeURI(saveQueryDetails));
        const filteredContent = await filterContentByQuery(contentName, colLabelName, queryDetails.searchTerm);
        const template = await getTemplateById(queryDetails.templateId);
        const finalHtml = filteredContent.map(content => {
            updateImgUrl(content, domain);
            return velocityjs.render(template.contentShape, { content: content });
        });
        if (finalHtml.length) {
            setHtmlCode(finalHtml);
        } else {
            console.error('App.js: No Content Found');
        }
    }

    function mappingOfDataWithTemplate(getTemplateData, getContentsData, cid_tid_obj, domain) {
        if (getTemplateData && getContentsData && Object.keys(cid_tid_obj).length) {
            const finalTemplate = cid_tid_obj.map(contentIdAndTemplateId => {
                const filterContent = getContentsData.filter(content => content.id === contentIdAndTemplateId.contentId);
                const filterTemplate = getTemplateData.filter(template => +template.id === +contentIdAndTemplateId.templateId);
                // To bind domain with image src(url).
                if (filterTemplate.length && filterContent[0] && Object.keys(filterContent[0]).length) {
                    updateImgUrl(filterContent[0], domain);
                    return velocityjs.render(filterTemplate[0].contentShape, { content: filterContent[0] });
                }
                return "";
            });
            setHtmlCode(finalTemplate);
        }
    }

    function updateImgUrl(content, domain) {
        Object.keys(content).map((key, i) => {
            if (content[key] && Array.isArray(content[key])) {
                // For MultiMedia
                if (content[key] && content[key][0] && content[key][0]['ext']) {
                    content[key].map(el => {
                        return el.url = domain + el.url;
                    });
                }
            } else if (content[key] && typeof content[key] === 'object') {
                // For SingleMedia
                if (content[key] && content[key]['ext']) {
                    if (typeof content[key] === 'object') {
                        content[key].url = domain + content[key].url;
                    }
                }
            }
        });
    }
    if(localStorage.getItem(STRAPI_BASE_URL_KEY)) {
        return (
            <>
                {
                    htmlCode && htmlCode.length ?
                        htmlCode.map((html, idx) => (
                            <div key={idx} dangerouslySetInnerHTML={{
                                __html: html
                            }}>
                            </div>
                        ))
                        : <h1>Loading...</h1>
                }
            </>
        );
    } else {
        return <StrapiConfigWarning />
    }
}

export default App;
