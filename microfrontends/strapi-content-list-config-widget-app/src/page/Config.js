import {
    Button, Col, Row
} from 'patternfly-react';
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { fetchStrapiBaseUrl, getCollectionTypes, getTemplate } from '../api/Api';
import { BTN_ADD_NEW_CONTENT, STRAPI_CONTENT_MANAGER_URI } from '../helper/Constant';
import { SimpleTable } from '../ui/SimpleTable';
import { FormattedMessage, injectIntl } from "react-intl";
import { parseData } from '../helper/Helper';

class Config extends Component {
    constructor(props) {
        super(props);
        this.state = {
            collectionTypes: [],
            templateList: [],
            templateId: 'none'
        };
        this.handleAddNewContent = this.handleAddNewContent.bind(this);
    }

    handleTypeaheadChangeContentType = selected => {
        let selectedContentType = selected.map(option => option.label);
        this.setState({ templateList: selectedContentType });
    };

    componentDidMount = async () => {
        let contentTypes = await getCollectionTypes();
        contentTypes = contentTypes.data.filter(obj => {
            return obj && (obj.uid && obj.uid.startsWith("api::")) && obj.isDisplayed;
        });
        const contentTypeRefine = [];
        contentTypes.length && contentTypes.forEach(element => {
            contentTypeRefine.push({ label: element.info.pluralName })
        });
        let { data: templatesList } = await getTemplate(this.props.selectedContentName ? this.props.selectedContentName : '');
        this.setState({ templateList: templatesList, collectionTypes: templatesList })

        const saveQueryDecode = parseData(decodeURI(this.props.saveQuery));
        if (saveQueryDecode) {
            this.setState({ templateId: saveQueryDecode.templateId })
        }
    }

    componentDidUpdate = (prevProps, prevState) => {
        if (prevProps.saveQuery !== this.props.saveQuery) {
            const saveQueryDecode = parseData(decodeURI(this.props.saveQuery));
            if (saveQueryDecode) {
                this.setState({ templateId: saveQueryDecode.templateId })
            }
        }
    }

    /**
    * Navigate to Strapi Content Manager page in a new tab on browser
    */
    handleAddNewContent = async () => {
        let strapiContentManagerUrl = `${await fetchStrapiBaseUrl()}${STRAPI_CONTENT_MANAGER_URI}`;
        var newWindow = window.open(strapiContentManagerUrl, '_blank');
        if (newWindow) {
            newWindow.focus();
        }
    }

    decideToShowQuery = () => this.props.selectedContentLabel && !this.props.selectedContent.length;

    onChangeTemplateId = (e) => {
        this.props.SaveQueryHandler(
            {
                "templateId": e.target.value,
                "searchTerm": this.props.searchTerm
            }
        );
    }

    render() {
        return (
            <form className="form-horizontal lcw-SingleContentConfigForm well">
                <Row>
                    <Col xs={12}>
                        <div>

                            <div>
                                <span className="icon fa fa-puzzle-piece" title="Widget" />
                                <h5 className="lcw-SingleContentConfigFormBody__widgetTitle"><FormattedMessage id="app.contentList" /></h5>
                                <div className="lcw-SectionTitle lcw-SectionTitle__non-collapsable" role="button">
                                    <span><FormattedMessage id="app.info" /></span>
                                </div>
                                <div className="row">
                                    <Col xs={6}>
                                        <h3 className="lcw-SingleContentConfigFormBody__contentTitle">
                                            <FormattedMessage id="app.content" />: -
                                        </h3>
                                    </Col>
                                    <Col xs={6} className="lcw-SingleContentConfigFormBody__addButtons">
                                        <Link to="/configpage">
                                            <Button bsStyle="primary"
                                                onClick={() => (this.decideToShowQuery() || this.props.selectedContent.length) && this.props.manipulateIsEditable('edit')}
                                            >
                                                {this.props.selectedContent.length || this.decideToShowQuery() ? <FormattedMessage id='app.edit' /> : <FormattedMessage id='app.addExistingContent' />}
                                                {!this.decideToShowQuery() && this.props.selectedContent.length > 0 && ' list of '}
                                                {this.decideToShowQuery() && <FormattedMessage id='app.query' />}
                                                {this.props.selectedContent.length ? <FormattedMessage id='app.contentsButton' /> : !this.decideToShowQuery() ? <FormattedMessage id='app.contentButton' /> : ''}
                                            </Button>
                                        </Link>
                                        <Button className="lcw-AddContentTypeFormBody__save--btn" bsStyle="primary" onClick={this.handleAddNewContent}>
                                            {BTN_ADD_NEW_CONTENT}
                                        </Button>
                                    </Col>
                                </div>
                                <div className="config-mt"></div>
                                <SimpleTable
                                    setTemplateId={this.props.setTemplateId}
                                    templateList={this.state.templateList}
                                    selectedContent={this.props.selectedContent}
                                    mappingOfContentTemplate={this.props.mappingOfContentTemplate}
                                    setContentTemplate={this.props.setContentTemplate}
                                    decideToShowQuery={this.decideToShowQuery}
                                    contentIdAndTemplateId={this.props.contentIdAndTemplateId}
                                    selectedContentName={this.props.selectedContentName}
                                />
                                {
                                    (
                                        <div className="form-horizontal lcw-SingleContentConfigForm custom-well well">
                                            <Row className="divider">
                                                <Col xs={2}>
                                                    <span className="lcw-SectionTitle" role="button">
                                                        <span><FormattedMessage id='app.query' /></span>
                                                    </span>
                                                </Col>
                                                <Col xs={10}>
                                                    <div className="lcw-SingleContentConfigFormBody__addButtons">
                                                        <span><b><FormattedMessage id='app.selectDefaultTemplate' /></b></span>
                                                    </div>
                                                </Col>
                                            </Row>
                                            {this.decideToShowQuery() && <Row>
                                                <Col xs={2} className="showquery-border-right">
                                                    <FormattedMessage id='app.savedAsQuery' />
                                                </Col>
                                                <Col xs={1} className="showquery-border-right">
                                                </Col>
                                                <Col lg={6} className="showquery-border-padding">
                                                    <code>
                                                        <span className="showquery-span"><b>Collection Type =  </b> {this.props.selectedContentLabel} </span>
                                                        <span className="showquery-span">
                                                            {this.props.searchTerm && <b>WHERE Name =  </b>}
                                                            {this.props.searchTerm && `%${this.props.searchTerm}% `}
                                                            {/* <b>WHERE Name =  </b> %{this.props.searchTerm}% */}
                                                            <b>ORDER BY</b> creation date <b>DESC</b></span>
                                                    </code>
                                                </Col>
                                                <Col lg={3}>
                                                    <div className="lcw-SingleContentConfigFormBody__addButtons">
                                                        <select name="modelId" className="form-control showquery-select" onChange={(e) => this.onChangeTemplateId(e)}>
                                                            <option
                                                                selected={this.state.templateId === "none" ? true : false}
                                                                value="none"
                                                                disabled
                                                                hidden>{this.props.intl.formatMessage({ id: "app.selectTemplate" })}</option>
                                                            {this.state.templateList.length > 0 && this.state.templateList.map((el) => {
                                                                return (<option
                                                                    selected={+this.state.templateId === +el.id ? true : false}
                                                                    key={el.id} value={el.id}>
                                                                    {el.templateName}
                                                                </option>);
                                                            })}
                                                        </select>
                                                    </div>
                                                </Col>
                                            </Row>}
                                        </div>
                                    )
                                }
                            </div>
                        </div>
                    </Col>
                </Row>
            </form>
        )
    }
}

export default injectIntl(Config);