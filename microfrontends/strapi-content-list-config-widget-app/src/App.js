import React, { Component } from 'react';
import { HashRouter, Route, Switch } from 'react-router-dom';
import { IntlProvider } from "react-intl";
import Config from './page/Config';
import MultiContentList from './page/MultiContentList';

import en from "./en.js";
import it from "./it.js";
import StrapiConfigWarning from './page/StrapiConfigWarning';
import { STRAPI_BASE_URL_KEY } from './helper/Constant';
import { checkIfUrlExists, getStrapiConfigurations } from './api/Api';
import Spinner from 'patternfly-react/dist/js/components/Spinner/Spinner';

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedContentName: null,
            mappingOfContentTemplate: '',
            contentIdAndTemplateId: '',
            selectedCollectionType: null,
            searchText: '',
            saveQuery: '',
            colLabel: '',
            locale: 'en',
            isEditable: '',
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
    componentDidUpdate = (prevProps, prevState) => {
        if (prevProps.config !== this.props.config) {
            this.setLocale();
        }
    }

    setContentTemplate = (data) => {
        const getJsonString = JSON.stringify(data.map(el => ({ templateId: el.templateId, contentId: el.contentId })));
        this.setState({ mappingOfContentTemplate: data.length ? JSON.stringify(data) : '', contentIdAndTemplateId: encodeURI(getJsonString) });
    }

    setSelectedContentName = (contentName, contentLabel) => {
        this.setState({ selectedContentName: contentName, selectedCollectionType: contentLabel })
    }

    setQueryTerm = (searchTerm) => {
        this.setState({ searchText: searchTerm })
    }

    SaveQueryHandler = (saveQueryData) => {
        this.setState({ saveQuery: encodeURI(JSON.stringify(saveQueryData)) });
    }

    setFieldSearchBy = (fieldSearchWith) => {
        this.setState({ colLabel: fieldSearchWith })
    }

    setLocale = () => {
        const currLocale = this.props.config && this.props.config.locale;
        if (currLocale.length) {
            this.setState({ locale: currLocale });
        }
    }

    manipulateIsEditable = (value) => this.setState({ isEditable: value });

    decideLocale = locale => {
        if (locale === 'en') return en;
        if (locale === 'it') return it;
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
        return (
            <IntlProvider locale={this.state.locale} messages={this.decideLocale(this.state.locale)}>
                <>
                    {!this.state.strapiConfLoaded || typeof this.state.strapiConfLoaded === 'string' ?
                        <Spinner
                            loading={true} size="md" />
                        :
                           this.state.strapiConfLoaded && localStorage.getItem(STRAPI_BASE_URL_KEY)
                        ?
                            <HashRouter>
                                <Switch>
                                    <Route path='/' exact>
                                        <Config
                                            selectedContent={this.state.mappingOfContentTemplate}
                                            mappingOfContentTemplate={this.state.mappingOfContentTemplate}
                                            setContentTemplate={this.setContentTemplate}
                                            selectedContentLabel={this.state.selectedCollectionType}
                                            searchTerm={this.state.searchText}
                                            SaveQueryHandler={this.SaveQueryHandler}
                                            selectedContentName={this.state.selectedContentName}
                                            manipulateIsEditable={this.manipulateIsEditable}
                                            contentIdAndTemplateId={this.state.contentIdAndTemplateId}
                                            saveQuery={this.state.saveQuery}
                                        />
                                    </Route>
                                    <Route path='/configpage' exact>
                                        <MultiContentList
                                            setContentTemplate={this.setContentTemplate}
                                            setSelectedContentName={this.setSelectedContentName}
                                            setQueryTerm={this.setQueryTerm}
                                            setFieldSearchBy={this.setFieldSearchBy}
                                            searchText={this.state.searchText}
                                            selectedCollectionTypeValue={{ label: this.state.selectedCollectionType, value: this.state.selectedContentName }}
                                            selectedContentList={this.state.mappingOfContentTemplate}
                                            colLabel={this.state.colLabel}
                                            isEditable={this.state.isEditable}
                                            selectedContentName={this.state.selectedContentName}
                                            contentIdAndTemplateId={this.state.contentIdAndTemplateId}
                                            SaveQueryHandler={this.SaveQueryHandler}
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