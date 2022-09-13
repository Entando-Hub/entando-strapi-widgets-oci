import ReactDOM from "react-dom"
import React from "react"
import App from '../App'
import { checkIfUrlExists, getStrapiConfigurations } from "../api/Api";
import { STRAPI_BASE_URL_KEY } from "../helper/Constant";

const ATTRIBUTES = {
    name: 'name',
    nameTwo: 'nameTwo',
    selectedTemplateId: 'selectedTemplateId',
    selectedContentId: 'selectedContentId',
    selectedContentName: 'selectedContentName',
};
class SingleWidgetElement extends HTMLElement {

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
        const name = this.getAttribute(ATTRIBUTES.name);
        const nameTwo = this.getAttribute(ATTRIBUTES.nameTwo);
        const templateId = this.getAttribute(ATTRIBUTES.selectedTemplateId);
        const contentId = this.getAttribute(ATTRIBUTES.selectedContentId);
        const contentName = this.getAttribute(ATTRIBUTES.selectedContentName);
        ReactDOM.render(
            <App name={name} nameTwo={nameTwo} templateId={templateId} contentId={contentId} contentName={contentName} />,
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

customElements.get('my-single-widget') || customElements.define('my-single-widget', SingleWidgetElement);

export default SingleWidgetElement;

