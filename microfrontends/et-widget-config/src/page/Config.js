import React, { Component } from 'react'

import {  FormattedMessage } from "react-intl";
import {
    Row,
    Col,
    Button
} from 'patternfly-react';
import { SimpleTable } from '../ui/SimpleTable';
import { fetchStrapiBaseUrl, getCollectionTypes, getContentById, getTemplate } from '../api/Api';
import { Link } from 'react-router-dom';
import { BTN_ADD_NEW_CONTENT, STRAPI_CONTENT_MANAGER_URI } from '../helper/Constant';
import { parseData } from '../helper/Helper';

export default class Config extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedContent: [],
            name: null,
            nameTwo: null,
            collectionTypes: [],
            selectedContentId: 0,
            selectedTemplateId: 'default',
            templateList: [],
            loadingData: false
        };
        this.handleAddNewContent = this.handleAddNewContent.bind(this);
    }

    componentDidMount = async () => {
        this.setState({ loadingData: true })
        let contentTypes = await getCollectionTypes();
        contentTypes = contentTypes.data.filter(obj => {
            return obj && (obj.uid && obj.uid.startsWith("api::")) && obj.isDisplayed;
        });
        const contentTypeRefine = [];
        contentTypes.length && contentTypes.forEach(element => {
            contentTypeRefine.push({ label: element.info.pluralName })
        });

        const parsedCollType = parseData(this.props.collType);
        if (parsedCollType.length && this.props.selectedContentId) {
            let { data: templatesList } = await getTemplate(parsedCollType[0].value ? parsedCollType[0].value : '');
            this.setState({ templateList: templatesList, collectionTypes: templatesList })
            this.fetchContentById(parsedCollType[0].value, this.props.selectedContentId);
        } else {
            this.setState({ loadingData: false })
        }
    }

    fetchContentById = async (collectionType, contentId) => {
        const content = await getContentById(collectionType, contentId);
        this.setState({ selectedContent: [content], loadingData: false })
    }

    onChangeTemplateId = (event) => {
        this.setState({ selectedTemplateId: event.target.value })
    }

    handleTypeaheadChangeContentType = selected => {
        let selectedContentType = selected.map(option => option.label);
        this.setState({ templateList: selectedContentType });
    };

     /**
     * Navigate to Strapi dashboard/login page in a new tab on browser
     */
      handleAddNewContent = async () => {
        let strapiContentManagerUrl = `${await fetchStrapiBaseUrl()}${STRAPI_CONTENT_MANAGER_URI}`;
        var newWindow = window.open(strapiContentManagerUrl, '_blank');
        if(newWindow) {
            newWindow.focus();
        }
    }

    render() {
        return (
            <form className="form-horizontal scw-SingleContentConfigForm well">
                <Row>
                    <Col xs={12}>
                        <div>
                            <div>
                                <span className="icon fa fa-puzzle-piece" title="Widget" />
                                <h5 className="scw-SingleContentConfigFormBody__widgetTitle"><FormattedMessage id="app.content" /></h5>
                                <div className="scw-SectionTitle scw-SectionTitle__non-collapsable" role="button">
                                <span> <FormattedMessage id="app.info" /></span>
                                </div>
                                <div className="row">
                                    <Col xs={6}>
                                        <h3 className="scw-SingleContentConfigFormBody__contentTitle">
                                        <FormattedMessage id="app.content" />: -
                                        </h3>
                                    </Col>
                                    <Col xs={6} className="scw-SingleContentConfigFormBody__addButtons">
                                        <Link to="/singleconfigpage">
                                            <Button bsStyle="primary">
                                                {this.state.selectedContent.length ? <FormattedMessage id="app.edit" /> : <FormattedMessage id="app.addExistingContent" />}
                                            </Button>
                                        </Link>
                                        <Button className="scw-AddContentTypeFormBody__save--btn" bsStyle="primary" onClick={this.handleAddNewContent}>
                                            {BTN_ADD_NEW_CONTENT}
                                        </Button>
                                    </Col>
                                </div>
                                <div className="simpletable-mt"></div>
                                <SimpleTable
                                    setTemplateId={this.props.setTemplateId}
                                    templateList={this.state.templateList}
                                    content={this.state.selectedContent}
                                    selectedContent={this.state.selectedContent}
                                    selectedTemplateId={this.props.selectedTemplateId}
                                    loadingData={this.state.loadingData}
                                />
                            </div>
                        </div>
                    </Col>
                </Row>
            </form>
        )
    }
}
