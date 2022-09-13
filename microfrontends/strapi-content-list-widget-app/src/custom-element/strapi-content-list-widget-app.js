import ReactDOM from "react-dom"
import React from "react"
import App from '../App'
import { checkIfUrlExists, getStrapiConfigurations } from "../api/Api";
import { STRAPI_BASE_URL_KEY } from "../helper/Constant";

const ATTRIBUTES = {
    contentName: "contentName",
    contentIdsAndTemplateIds: "contentIdsAndTemplateIds",
    saveQueryDetails: "saveQueryDetails",
    colLabelName: "colLabelName"
};
class StrapiListWidgetApp extends HTMLElement {

    static get observedAttributes() {
        return Object.values(ATTRIBUTES);
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (!Object.values(ATTRIBUTES).includes(name)) {
            throw new Error(`Untracked changed attribute: ${name}`);
        }
        if (this.mountPoint && newValue !== oldValue) {
            this.getStrapiConfiguration();
        }
    }

    connectedCallback() {
        this.mountPoint = document.createElement('div');
        this.appendChild(this.mountPoint);
        this.getStrapiConfiguration();
    }

    render() {
        const contentName = this.getAttribute(ATTRIBUTES.contentName);
        const contentIdsAndTemplateIds = this.getAttribute(ATTRIBUTES.contentIdsAndTemplateIds);
        const saveQueryDetails = this.getAttribute(ATTRIBUTES.saveQueryDetails);
        const colLabelName = this.getAttribute(ATTRIBUTES.colLabelName);

        ReactDOM.render(
            <App
                contentName={contentName}
                contentIdsAndTemplateIds={contentIdsAndTemplateIds}
                saveQueryDetails={saveQueryDetails}
                colLabelName={colLabelName}
            />,
            this.mountPoint
        );
    }

    /**
     * Get strapi configurations
     */
     getStrapiConfiguration = async () => {
        localStorage.removeItem(STRAPI_BASE_URL_KEY);
        const { data, isError } = await getStrapiConfigurations();
        if (!isError && data && data.data && data.data.baseUrl) {
            const result = await checkIfUrlExists(data.data.baseUrl);
            if (result && result.data && result.data.status === 200 && !result.isError) {
                localStorage.setItem(STRAPI_BASE_URL_KEY, data.data.baseUrl);
            }
        }
        this.render();
    }
}

customElements.get('strapi-content-list-widget-app') || customElements.define('strapi-content-list-widget-app', StrapiListWidgetApp);

export default StrapiListWidgetApp;

