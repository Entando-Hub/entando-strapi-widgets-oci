import Spinner from 'patternfly-react/dist/js/components/Spinner/Spinner';
import React, { Component } from 'react';
import { IntlProvider } from "react-intl";
import { HashRouter, Route, Switch } from 'react-router-dom';
import { checkIfUrlExists, getStrapiConfigurations } from './api/Api.js';
import en from "./en.js";
import { STRAPI_BASE_URL_KEY } from './helper/Constant.js';
import it from "./it.js";
import Config from './page/Config';
import SingleContentList from './page/SingleContentList';
import StrapiConfigWarning from './page/StrapiConfigWarning.js';


class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedContentId: 0,
            selectedTemplateId: 'default',
            selectedContentName: null,
            name: '',
            nameTwo: 'nameTwoVar',
            collectionType: '',
            locale:'en',
            strapiConfLoaded: false
        };
    }

    componentDidMount = async () => {
        await this.getStrapiConfiguration();
        this.setLocale();
        if (!localStorage.getItem(STRAPI_BASE_URL_KEY)) {
            this.shouldShowEtSaveBtn('hidden');
        }
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
        this.setState({ strapiConfLoaded: true });
    }
 
    // TODO: PBCS-54 ~ Need to verify once the mechanism is implemented by Entando Team 
    componentDidUpdate = (prevProps) => {
        if (prevProps.config !== this.props.config) {
            this.setLocale();
        }
    }

    setContent = (data) => {
        if (data.length) this.setState({ selectedContentId: data[0].id })
    }

    setSelectedContentName = (contentName) => {
        this.setState({ selectedContentName: contentName, name: contentName, nameTwo: contentName })
    }

    setTemplateId = (tempId) => {
        this.setState({ selectedTemplateId: tempId })
    }

    setCollectionType = (collType) => {
        this.setState({ collectionType: JSON.stringify(collType) })
    }

    setLocale = () => {
        const currLocale = this.props.config && this.props.config.locale;
        if (currLocale.length) {
            this.setState({ locale: currLocale });
        }
    }

    decideLocale = locale => {
        if (locale === 'en') { return en }
        else if (locale === 'it') { return it };
    }

    /**
     * Hide save button
     * @param {*} btnVisibility 
     */
    shouldShowEtSaveBtn = (btnVisibility) => {
        for (let el of document.getElementsByClassName('pull-right save btn btn-primary')) {
            el.style.visibility = btnVisibility;
        }
    }

    render() {
        console.log("this.props", this.props);
        return (
            <IntlProvider locale={this.state.locale} messages={this.decideLocale(this.state.locale)}>
                <>
                    {
                    !this.state.strapiConfLoaded || typeof this.state.strapiConfLoaded === 'string'
                    ?
                        <Spinner loading={true} size="md" />
                    :
                        this.state.strapiConfLoaded && localStorage.getItem(STRAPI_BASE_URL_KEY)
                    ?
                        <HashRouter>
                            <Switch>
                                <Route path='/' exact>
                                    <Config setTemplateId={this.setTemplateId}
                                        selectedContentName={this.state.selectedContentName}
                                        collType={this.state.collectionType}
                                        selectedContentId={this.state.selectedContentId}
                                        selectedTemplateId={this.state.selectedTemplateId} />
                                </Route>
                                <Route path='/singleconfigpage' exact>
                                    <SingleContentList
                                        setContent={this.setContent}
                                        selectedContentName={this.state.selectedContentName}
                                        setSelectedContentName={this.setSelectedContentName}
                                        selectedContentId={this.state.selectedContentId}
                                        setCollectionType={this.setCollectionType}
                                        collType={this.state.collectionType}
                                        setTemplateId={this.setTemplateId}
                                    />
                                </Route>
                            </Switch>
                        </HashRouter>
                    :
                        this.state.strapiConfLoaded && <StrapiConfigWarning />
                    }
                </>
            </IntlProvider>
        )
    }
}
export default App; 