import React, { Component } from 'react'
import TemplateDataTable from '../components/TemplateDataTable'
import TemplateSearch from '../components/TemplateSearch'
export default class ListContentTemplates extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedCollectionType: "All",
            loading: true
        };
    }

    setLoading = (loadingState) => {
        this.setState({loading: loadingState})
    }

    collectionTypeOnChange = (selectedCollectionType) => this.setState({selectedCollectionType});

    render() {
        console.log('microfrontends/et-strapi-template-widget/src/pages/ListContentTemplates.js', this.props.apiUrl);
        return (
            <div className={"mv-2"}>
                <TemplateSearch loadingState={this.state.loading} setLoading={this.setLoading}
                    collectionTypeOnChange={this.collectionTypeOnChange} apiUrl={this.props.apiUrl}
                />
                <TemplateDataTable loadingState={this.state.loading} setLoading={this.setLoading}
                    addNotification={this.props.addNotification} selectedCollectionType={this.state.selectedCollectionType}
                    apiUrl={this.props.apiUrl}
                />
            </div>
        )
    }
}
