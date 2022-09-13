import React, { Component } from 'react';
import './App.css';
import StrapiSetting from './pages/StrapiSetting';
export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {apiUrl: null};
  }

  componentDidMount = () => {
    // TODO: Adding font-awesome.min.css
    if (!document.getElementById('id2')) {
      var link = document.createElement('link');
      link.id = 'id2';
      link.rel = 'stylesheet';
      link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css';
      document.head.appendChild(link);
    }

    if (!document.getElementById('id3')) {
      var link2 = document.createElement('link');
      link2.id = 'id3';
      link2.rel = 'stylesheet';
      link2.href = 'https://cdnjs.cloudflare.com/ajax/libs/patternfly/3.24.0/css/patternfly-additions.min.css';
      document.head.appendChild(link2);
    }
    // <link rel="stylesheet" type="text/css" href="https://cdnjs.cloudflare.com/ajax/libs/patternfly/3.24.0/css/patternfly-additions.min.css"></link>

    const { systemParams,  } = this.props.config || {};
    const { api } = systemParams || {};
    this.setState({apiUrl: api});
  }

  render() {
    console.log("process.env.SERVER_SERVLET_CONTEXT_PATH: ",process.env.SHELL); 

    return (
      <StrapiSetting apiURL={this.state.apiUrl}/>
    )
  }
}
