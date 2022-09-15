import React from 'react';
import ReactDOM from 'react-dom';
import App from '../App';

class StrapiListWidgetConfigApp extends HTMLElement {

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
        this.#updateConfig(newValue)
        // this.render()
        const MainApp = <App ref={this.reactRootRef} config={this.#config} />;
        ReactDOM.render(MainApp, this.mountPoint);
    }

    get config() {
        return (this.reactRootRef && this.reactRootRef.current) ? this.reactRootRef.current.state : {};
    }

    set config(value) {
        return (this.reactRootRef && this.reactRootRef.current) ? this.reactRootRef.current.setState(value) : {}
    }

    connectedCallback() {
        this.mountPoint = document.createElement('div');
        this.appendChild(this.mountPoint);
        const MainApp = <App ref={this.reactRootRef} config={this.#config} />;
        ReactDOM.render(MainApp, this.mountPoint);
    }
}

customElements.define('strapi-content-list-config-widget-app', StrapiListWidgetConfigApp);

export default StrapiListWidgetConfigApp;
