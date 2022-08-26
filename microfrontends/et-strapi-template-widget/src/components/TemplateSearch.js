import React, { Component } from 'react'
import { getSanitizedCollectionTypes } from '../helpers/helpers';
import { FormattedMessage } from "react-intl";
export default class TemplateSearch extends Component {
    constructor(props) {
        super(props);
        this.state = {
            collectionType: [],
            selectedCollectionType: "All"
        };
    }

    componentDidMount = async () => {
        this.getCollectionType();
    }

    getCollectionType = async () => {
        const sanitizedCollectionTypes = await getSanitizedCollectionTypes();
        this.setState({ collectionType: sanitizedCollectionTypes });
    }

    collectionTypeOnChange = (event) => this.setState({ selectedCollectionType: event.target.value });

    collectionTypeOnClick = () => {
        this.props.collectionTypeOnChange(this.state.selectedCollectionType);
        this.props.setLoading(true);
    };

    render() {
        return (
            <div className="well search-well">
                <div className="search-container">
                    <div className="container-fluid">
                        <div className="show-grid row">
                            <div className="col-lg-1 search-label"><FormattedMessage id="app.search" /></div>
                            <div className="col-lg-10"></div>
                        </div>
                        <div className="show-grid row search-show-grid-row">
                            <div className="col-lg-1"></div>
                            <div className="col-lg-1 type-label">
                                <FormattedMessage id="app.type" />
                            </div>
                            <select onChange={this.collectionTypeOnChange} className="col-lg-7 search-select" name="cars" id="cars">
                                <FormattedMessage id='app.all' >
                                    {(message) => <option value='All'>{message}</option>}
                                </FormattedMessage>
                                {this.state.collectionType.map(el => <option key={el.apiID} value={el.apiID}>{el.displayName}</option>)}
                            </select>
                        </div>
                        <div className="show-grid row search-btn-main">
                            <div className="col-lg-7"></div>
                            <div className="col-lg-4 search-btn-col-lg-4">
                                <button onClick={this.collectionTypeOnClick} className="btn btn-primary"><FormattedMessage id="app.search" /></button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}
