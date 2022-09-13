import React, { Component } from 'react'
import ContentTemplateForm from '../components/ContentTemplateForm';
import { ADD_LABEL } from '../constant/constant';

export default class AddContentTemplate extends Component {
  constructor(props) {
    super(props)
    this.state = {
        data:{},
    }
 }

 render() {
    return (
      <ContentTemplateForm
        addNotification={this.props.addNotification} formType={ADD_LABEL}
        loading={this.props.loading} setLoader={this.props.setLoader} apiUrl={this.props.apiUrl}
      />
    )
  }
}
