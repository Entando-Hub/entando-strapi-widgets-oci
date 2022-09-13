import moment from 'moment';
import React from "react";
import { Link } from "react-router-dom";
import { UNIVERSAL_DATE_FORMAT } from "../helper/Constant";
import { getKey, parseData } from '../helper/Helper';
import { FormattedMessage } from "react-intl";
import { fetchContents, getAllRecordsByCollectionType } from '../api/Api';
import { Spinner } from 'patternfly-react/dist/js/components/Spinner';
export class SimpleTable extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            // DATA STATE
            templateChangedForContent: null,
            templateSelectedForContent: 0,
            selectedContent: [],
            loadingData: false
        }
    }

    componentDidMount = () => {
        if (parseData(decodeURI(this.props.contentIdAndTemplateId)).length) {
            this.getContentByHighestId();
        }
        if (!this.props.contentIdAndTemplateId) {
            this.setState({ loadingData: false })
        }
    }

    componentDidUpdate = (prevProps, prevState) => {
        if (prevProps.contentIdAndTemplateId !== this.props.contentIdAndTemplateId) {
            if (parseData(decodeURI(this.props.contentIdAndTemplateId)).length) {
                this.getContentByHighestId();
            }
        };
    }

    getContentByHighestId = async () => {
        this.setState({ loadingData: true })
        const getContentIds = this.props.contentIdAndTemplateId && parseData(decodeURI(this.props.contentIdAndTemplateId));
        let contents = [];
        if (getContentIds) {
            const highestContentId = getContentIds.map(el => el.contentId).sort(function (a, b) { return a - b; }).reverse()[0];
            contents = await getAllRecordsByCollectionType(this.props.selectedContentName, highestContentId);
        }
        const parsedSelectedContent = this.props.selectedContent.length ? parseData(this.props.selectedContent) : ''
        if (parsedSelectedContent.length) {
            const filteredCont = parsedSelectedContent.map(cont => contents.results.find(el => el.id === cont.id))
            filteredCont.map(el => {
                getContentIds.find(cont => {
                    if (el.id === +cont.contentId) {
                        el.templateId = +cont.templateId;
                    }
                })
            });
            this.setState({ selectedContent: filteredCont, loadingData: false })
        }
    }

    /**
       * Renders Button on Typehead.
       * @returns Button element
       */
    renderToggleButton = ({ isMenuShown, onClick }) => (
        <button
            type="button"
            className="render-toggle-button"
            onClick={(e) => {
                e.preventDefault();
                onClick(e);
            }}
        ><span className="fa fa-angle-down"></span></button>
    );

    onChangeTemplateId = (e, contentId) => {
        this.setState({ templateSelectedForContent: e.target.value })
        this.setState({ templateChangedForContent: contentId });
        const applyTemplateToContent = parseData(this.props.mappingOfContentTemplate).map(el => {
            el.contentId === contentId && (el.templateId = e.target.value)
            return { id: el.id, contentId: el.contentId, templateId: el.templateId };
        });
        this.props.setContentTemplate(applyTemplateToContent);
    }

    onApplyToAll = () => {
        document.getElementsByName('modelId').forEach((el) => { el.value = `${this.state.templateSelectedForContent}` })
        const applyTemplateToAllContent = parseData(this.props.mappingOfContentTemplate).map(el => ({ ...el, templateId: this.state.templateSelectedForContent.toString() }));
        this.props.setContentTemplate(applyTemplateToAllContent);
        const applyTemplateToAllContentTwo = this.state.selectedContent.map(el => ({ ...el, templateId: this.state.templateSelectedForContent.toString() }));
        this.setState({ selectedContent: applyTemplateToAllContentTwo })
    }

    selectTempForContent = (cont) => {
        if (cont.templateId) return cont.templateId;
        return 'none';
    }

    render() {
        const getContentIds = this.props.contentIdAndTemplateId && parseData(decodeURI(this.props.contentIdAndTemplateId));
        return (
            <>
                {this.state.loadingData &&
                    <Spinner
                        loading={this.state.loadingData}
                        className=""
                        size="md"
                    ></Spinner>}
                {!this.state.loadingData && <table className="table table-bordered table-datatable table-hover table-striped Contents__table-element">
                    <thead>
                        <tr className={this.props.decideToShowQuery() ? 'disabled-table' : ''}>
                            {Object.keys(contentAttribute).map((item, idx) => <th key={idx}><FormattedMessage id={contentAttribute[item]} /></th>)}
                        </tr>
                    </thead>
                    <tbody>
                        {
                            this.state.selectedContent.length > 0 && (
                                this.state.selectedContent.map(item => {
                                    return (
                                        <tr key={item.id}>
                                            <td>{item[getKey(item)]}</td>
                                            <td>{`${item.createdBy.firstname} ${item.createdBy.lastname}`}</td>
                                            <td>{moment(new Date(item.updatedAt)).format(UNIVERSAL_DATE_FORMAT)}</td>
                                            <td>{moment(new Date(item.publishedAt)).format(UNIVERSAL_DATE_FORMAT)}</td>
                                            <td width="30%">
                                                <select
                                                    name="modelId"
                                                    className="form-control simpletable-select"
                                                    onChange={(e) => this.onChangeTemplateId(e, item.id)}
                                                >
                                                    {<FormattedMessage id='app.selectTemplate' >
                                                        {(message) => (<option
                                                            selected={!item.templateId ? true : false}
                                                            value='none' disabled hidden>
                                                            {message}
                                                        </option>)
                                                        }
                                                    </FormattedMessage>}
                                                    {this.props.templateList.length > 0 && this.props.templateList.map((el) => {
                                                        return (<option
                                                            selected={+item.templateId === +el.id ? true : false}
                                                            key={el.id}
                                                            value={el.id}>{el.templateName}</option>);
                                                    })}
                                                </select>
                                                {item.id === this.state.templateChangedForContent && <div onClick={this.onApplyToAll} className="simpletable-applyToAll-div">
                                                    <Link to="#">
                                                        <span className="fa fa-copy simpletable-applyToAll-span"></span>
                                                        <FormattedMessage id='app.applyToAllContents' />
                                                    </Link>
                                                </div>}
                                            </td>
                                        </tr>
                                    )
                                })
                            )
                        }
                    </tbody>
                </table>}
            </>
        );

    }
}

const contentAttribute = {
    Title: "app.name",
    createdAt: "app.created",
    updatedAt: "app.lastEdited",
    createDate: "app.createdDate",
    selectDefaultTemplate: "app.selectDefaultTemplate"
}