import ReactDOM from "react-dom"
import React from "react"
import App from '../App'
import { KEYCLOAK_EVENT_TYPE, subscribeToWidgetEvent } from "../helpers/widgetEvents"
import { STRAPI_BASE_URL_KEY } from "../constant/constant"
import { checkIfUrlExists, getStrapiConfigurations } from "../integration/StrapiAPI"
const getKeycloakInstance = () =>
    (window && window.entando && window.entando.keycloak && { ...window.entando.keycloak, initialized: true }) || {
        initialized: false,
    }
class EtApp extends HTMLElement {
    constructor() {
        super();
        this.reactRootRef = React.createRef();
        this.mountPoint = null;
    }
    #config = {
        locale: 'en',
    }
    #updateConfig(value) {
        this.#config = JSON.parse(value)
    }
    static get observedAttributes() {
        return ["config"]
    }
    attributeChangedCallback(name, oldValue, newValue) {
        this.#updateConfig(newValue);
        this.getStrapiConfiguration(false);
    }
    get config() {
        return (this.reactRootRef && this.reactRootRef.current) ? this.reactRootRef.current.state : {};
    }
    set config(value) {
        return (this.reactRootRef && this.reactRootRef.current) ? this.reactRootRef.current.setState(value) : {};
    }
    connectedCallback() {
        this.mountPoint = document.createElement('span')
        this.appendChild(this.mountPoint);
        this.keycloak = { ...getKeycloakInstance(), initialized: true }
        this.unsubscribeFromKeycloakEvent = subscribeToWidgetEvent(KEYCLOAK_EVENT_TYPE, (e) => {
            if (e.detail.eventType === "onReady") {
                this.keycloak = { ...getKeycloakInstance(), initialized: true }
                this.getStrapiConfiguration(true);
            }
        })
    }

    /**
     * Get strapi configurations
     */
     getStrapiConfiguration = async (isConnectedCallback) => {
        localStorage.removeItem(STRAPI_BASE_URL_KEY);
        const configServerURLGet = this.#config.systemParams.api['ext-api']['url']
        const { data, isError } = await getStrapiConfigurations(configServerURLGet); // TODO: Config need(local1337)
        if (!isError && data && data.data && data.data.baseUrl) {
            const result = await checkIfUrlExists(data.data.baseUrl); // TODO: Validating(local1337)
            if (result && result.data && result.data.status === 200 && !result.isError) {
                localStorage.setItem(STRAPI_BASE_URL_KEY, data.data.baseUrl);
            }
        }
        if (isConnectedCallback) {
            ReactDOM.render(<App config={this.#config} />, this.appendChild(this.mountPoint));
        } else {
            ReactDOM.render(<App ref={this.reactRootRef} config={this.#config} />, this.mountPoint);
        }
    }
}
customElements.get('et-strapi-template-app') || customElements.define("et-strapi-template-app", EtApp)