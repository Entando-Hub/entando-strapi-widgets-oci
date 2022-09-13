import React, { Component } from 'react'
// import { Route } from 'react-router';
// import { BrowserRouter } from 'react-router-dom';
import { HashRouter, Route, Switch } from 'react-router-dom';
import ListContentTemplates from './pages/ListContentTemplates';
import AddContentTemplate from './pages/AddContentTemplate';
import EditContentTemplate from './pages/EditContentTemplate';
import './App.css';
import { TimedToastNotification, ToastNotificationList } from 'patternfly-react';
import { IntlProvider } from "react-intl";
import en from "./en.js";
import it from "./it.js";
import { STRAPI_BASE_URL_KEY } from './constant/constant';
import StrapiConfigWarning from './pages/StrapiConfigWarning';

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      notificationList : [],
      locale:'en',
      messages:{ en, it },
      loading: false,
      apiUrl: null,
    }
  }

  componentDidMount = () => {
    this.setLocale();
    const { systemParams, } = this.props.config || {};
      const { api } = systemParams || {};
      this.setState({
        apiUrl: {
          'int-api': api && api['int-api'].url,
          // Optional
          'ext-api': api && api['ext-api'].url
        }
      });
  }
  
  componentDidUpdate = (prevProps, prevState) => {
    if (prevProps.config !== this.props.config) {
      const { systemParams, } = this.props.config || {};
      const { api } = systemParams || {};
      this.setState({
        apiUrl: {
          'int-api': api && api['int-api'].url,
          // Optional
          'ext-api': api && api['ext-api'].url
        }
      });
      this.setLocale();
    }
  }

  addNotification = (notificationObj) => {
    const allnote = this.state.notificationList;
    allnote.push(notificationObj);
    this.setState({notificationList: allnote});
  }

  removeNotification = (notId) => {
    const filterNotes = this.state.notificationList.filter(el => el.key !== notId);
    this.setState({notificationList: filterNotes})
  }

  setLocale = () => {
    const currLocale = this.props.config && this.props.config.locale;
    if (currLocale && currLocale.length) {
      this.setState({ locale: currLocale });
    }
  }

  // handleChange = event => {
  //   this.setState({ locale: event.target.value })
  // };

  setLoader = (shouldLoad) => {
    this.setState({ loading: shouldLoad })
  }
 
  render() {
    console.log("process.env.SERVER_SERVLET_CONTEXT_PATH: ",process.env.SERVER_SERVLET_CONTEXT_PATH); 

    return (
      <IntlProvider locale={this.state.locale} messages={this.state.messages[this.state.locale]}>
        <div>
          {/* <select onChange={this.handleChange}>
            <option value="en">en</option>
            <option value="it">it</option>
          </select> */}
        <ToastNotificationList>
          {
            this.state.notificationList.map(el => {
              return (
                <TimedToastNotification
                  key={el.key}
                  type={el.type}
                  persistent={false}
                  onDismiss={() => this.removeNotification(el.key)}
                  timerdelay={el.timerdelay}
                >
                  <span>
                    {el.message}
                  </span>
                </TimedToastNotification>
              )
            })
          }
        </ToastNotificationList>
          {localStorage.getItem(STRAPI_BASE_URL_KEY)
            ?
            <HashRouter>
              <Switch>
                <Route path="/" exact>
                  <ListContentTemplates addNotification={this.addNotification} apiUrl={this.state.apiUrl} />
                </Route>
                <Route path="/add-template" exact>
                  <AddContentTemplate addNotification={this.addNotification} loading={this.state.loading} setLoader={this.setLoader} apiUrl={this.state.apiUrl} />
                </Route>
                <Route path="/edit-template/:templateId" exact>
                  <EditContentTemplate addNotification={this.addNotification} loading={this.state.loading} setLoader={this.setLoader} apiUrl={this.state.apiUrl} />
                </Route>
              </Switch>
            </HashRouter>
            :
            <StrapiConfigWarning />}
      </div>
      </IntlProvider>
    )
  }
}
