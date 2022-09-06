import React from "react";
import moment from 'moment';
import { UNIVERSAL_DATE_FORMAT } from "../helper/Constant";
import {  FormattedMessage } from "react-intl";
import { getKey } from "../helper/Helper";
import { Spinner } from "patternfly-react/dist/js/components/Spinner";

export class SimpleTable extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            // DATA STATE
            templateType: [{'label': 'vj'}],
            selectedTemplateType: [],
        }
    }

    /**
       * Renders Button on Typehead.
       * @returns Button element
       */
    renderToggleButton = ({ isMenuShown, onClick }) => (
        <button
            type="button"
            className="simple-table-toggle-button"
            onClick={(e) => {
                e.preventDefault();
                onClick(e);
            }}
        ><span className="fa fa-angle-down"></span></button>
    );

    onChangeTemplateId = (e) => {
        this.props.setTemplateId(e.target.value);
    }

    render() {
        return (
            <>
                {this.props.loadingData &&
                    <Spinner
                        loading={this.props.loadingData}
                        className=""
                        size="md"
                    ></Spinner>}
                {
                    !this.props.loadingData && (
                        <table className="table table-bordered table-datatable table-hover table-striped Contents__table-element">
                            <thead>
                                <tr>
                                    {Object.keys(contentAttribute).map((item, idx) => <th key={idx}><FormattedMessage id={contentAttribute[item]} /></th>)}
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    this.props.selectedContent.length > 0 && (
                                        this.props.selectedContent.map(item => {
                                            return (
                                                <tr key={item.id}>
                                                    <td>{item[getKey(item)]}</td>
                                                    <td>{`${item.createdBy.firstname} ${item.createdBy.lastname}`}</td>
                                                    <td>{moment(new Date(item.updatedAt)).format(UNIVERSAL_DATE_FORMAT)}</td>
                                                    <td>{moment(new Date(item.publishedAt)).format(UNIVERSAL_DATE_FORMAT)}</td>
                                                    <td>
                                                        <select name="modelId" defaultValue={this.props.selectedTemplateId === 'default' ? 'none' : this.props.selectedTemplateId} className="form-control" onChange={this.onChangeTemplateId}>
                                                            {<FormattedMessage id='app.selectTemplate' >
                                                                {(message) => <option value='none' disabled hidden>{message}</option>}
                                                            </FormattedMessage>}
                                                            {this.props.templateList.map((el) => {
                                                                return <option key={el.id} value={el.id}>{el.templateName}</option>;
                                                            })}
                                                        </select>
                                                    </td>
                                                </tr>
                                            )
                                        })
                                    )
                                }
                            </tbody>
                        </table>
                    )
                }
            </>
        );
    }
}


const contentAttribute = {
    Title: "app.name" ,
    createdAt: "app.created",
    updatedAt: "app.lastEdited",
    createDate: "app.createdDate",
    selectDefaultTemplate: "app.selectDefaultTemplate"
}