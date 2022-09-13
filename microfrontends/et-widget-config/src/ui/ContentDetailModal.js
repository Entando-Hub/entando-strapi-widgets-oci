import { Button, Modal, Tab, Tabs } from 'patternfly-react';
import React, { Component } from 'react';
import { FormattedMessage } from "react-intl";
import { fetchStrapiBaseUrl, getContentDetailsByCollectionTypeAndId, getLocales } from '../api/Api';
import { renderPanelGroup } from '../helper/AccordionHelper';
import { Spinner } from 'patternfly-react/dist/js/components/Spinner';

export default class ContentDetailModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            show: true,
            collectionTypes: [],
            mockRows: [],
            selectedContent: [],
            selectedCollectionType: null,
            collectionAttributes: this.props.dummyData,
            dataToShowOnModal: {},
            localeInfo: [],
            currentCode: [this.props.contentId],
            dataToShowOnModalRestTabs: {},
            loadingData: false,
            loadingLang: false,
            strapiBaseUrl: ''
        };
        this.toggleTab = this.toggleTab.bind(this);
        this.getCollectionByLocaleName = this.getCollectionByLocaleName.bind(this);
    }

    toggleTab = (index) => {
        if (this.state.dataToShowOnModal.localizations && this.state.dataToShowOnModal.localizations.length > 0) {
            this.getCollectionByLocaleName(this.state.currentCode[index]);
        }
        this.props.setActiveTabKey(index);
    }

    getLocaleInfo = async () => {
        const data = await getLocales();
        this.setState({ localeInfo: data });
    }

    getLocaleFullName(code) {
        const filterItem = this.state.localeInfo.filter(item => item.code === code)
        return filterItem[0].name;
    }

    componentDidMount = async () => {
        this.getLocaleInfo();
        const strapiUrl = await fetchStrapiBaseUrl();
        this.setState({ strapiBaseUrl: strapiUrl });
    }

    getCollectionByLocaleName = async (code) => {
        this.setState({ loadingLang: true })
        const contentDettailsResponse = await getContentDetailsByCollectionTypeAndId(this.props.collectionType, code);
        if (code === this.props.contentId)
            this.setState({ dataToShowOnModal: { ...contentDettailsResponse } });
        else {
            this.setState({ dataToShowOnModalRestTabs: { ...contentDettailsResponse } });
        }
        this.setState({ loadingLang: false })
    }

    componentDidUpdate = async (prevProps, prevState) => {
        if (this.props.collectionType && this.props.contentId) {
            if (prevProps.collectionType !== this.props.collectionType || prevProps.contentId !== this.props.contentId) {
                this.setState({ loadingData: true })
                const contentDettailsResponse = await getContentDetailsByCollectionTypeAndId(this.props.collectionType, this.props.contentId);
                this.setState({ loadingData: false })
                this.setState({ dataToShowOnModal: { ...contentDettailsResponse } });
                this.setState({ dataToShowOnModalRestTabs: { ...contentDettailsResponse } });
                this.props.setActiveTabKey(0);
                this.setState({ currentCode: [this.props.contentId] })
            }
        }
    }

    render() {
        return (
            <>
                <Modal dialogClassName="scw-ContentsFilterModal" show={this.props.show} onHide={this.props.onHide} >
                    {this.state.loadingData ?
                        <Spinner loading={this.state.loadingData} size="md"></Spinner>
                         : <>
                            <Modal.Header>
                                <Modal.Title>{this.state.dataToShowOnModal && Object.keys(this.state.dataToShowOnModal).length > 0 && this.props.fetchTitleOrName(this.state.dataToShowOnModal)}
                                </Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                <div className="CollapsibleSection__title no-padding" role="button" tabIndex={0}>
                                </div>
                                <div>
                                    <Tabs id={'id'} activeKey={this.props.activeTabKey} onSelect={this.toggleTab}>
                                        {this.state.dataToShowOnModal && this.state.dataToShowOnModal.locale ? 
                                            <Tab eventKey={0} title={this.getLocaleFullName(this.state.dataToShowOnModal.locale).split(" ")[0]} className="lang-tab">
                                                {renderPanelGroup(this.state.dataToShowOnModal, this.state.strapiBaseUrl)}
                                            </Tab> :
                                            <Tab eventKey={0} title="English" className="lang-tab">
                                                {renderPanelGroup(this.state.dataToShowOnModal, this.state.strapiBaseUrl)}
                                            </Tab>}
                                        {this.state.dataToShowOnModal && this.state.dataToShowOnModal.localizations && this.state.dataToShowOnModal.localizations.length > 0 && this.state.dataToShowOnModal.localizations.map((locTabs, i) => {
                                            this.state.currentCode.push(locTabs.id)
                                            return <Tab key={i + 1} eventKey={i + 1} title={this.getLocaleFullName(locTabs.locale).split(" ")[0]} className="lang-tab">
                                                {this.state.loadingLang && <Spinner loading={this.state.loadingLang} size="md"></Spinner>}
                                                {!this.state.loadingLang && renderPanelGroup(this.state.dataToShowOnModalRestTabs, this.state.strapiBaseUrl)}
                                            </Tab>
                                        }
                                        )}
                                    </Tabs>
                                </div>
                            </Modal.Body>
                            <Modal.Footer>
                                <Button bsStyle={'primary'} onClick={this.props.onHide}>
                                    <FormattedMessage id='app.ok' />
                                </Button>
                            </Modal.Footer>
                        </>
                    }
                </Modal>
            </>
        );
    }
}
