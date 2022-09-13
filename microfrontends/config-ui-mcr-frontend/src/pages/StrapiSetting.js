import React, { Component } from 'react';
import StrapiSettingForm from '../components/StrapiSettingForm';
export default class StrapiSetting extends Component {

    render() {
        return (
            <div className="container-fluid">
                <StrapiSettingForm apiURL={this.props.apiURL}/>
            </div>
        )
    }
}
