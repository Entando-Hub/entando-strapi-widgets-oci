import React from 'react';
import ReactDOM from 'react-dom';
import App from '../App';

class SingleWidgetElement extends HTMLElement {
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
        console.log('name, oldValue, newValue', name, '||', oldValue , '||', newValue);
        console.log("this.#config", this.#config);
        console.log("this.config", this.config)
        ReactDOM.render(<App ref={this.reactRootRef} config={this.#config} />, this.mountPoint);
    }

    get config() {
        return (this.reactRootRef && this.reactRootRef.current) ? this.reactRootRef.current.state : {};
    }

    set config(value) {
        return (this.reactRootRef && this.reactRootRef.current) ? this.reactRootRef.current.setState(value) : {};
    }

    connectedCallback() {
        console.log("this.#configvj", this.#config);
        console.log("this.config", this.config);
        this.mountPoint = document.createElement('div');
        this.appendChild(this.mountPoint);
        
        ReactDOM.render(<App ref={this.reactRootRef} config={this.#config} />, this.mountPoint);
    }
}

customElements.define('single-content-widget-config', SingleWidgetElement);

export default SingleWidgetElement;

