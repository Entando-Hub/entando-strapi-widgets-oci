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
    }
  }

  componentDidMount = () => {
    this.setLocale();
  }

  componentDidUpdate = (prevProps, prevState) => {
    if (prevProps.config !== this.props.config) {
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
                  <ListContentTemplates addNotification={this.addNotification} />
                </Route>
                <Route path="/add-template" exact>
                  <AddContentTemplate addNotification={this.addNotification} loading={this.state.loading} setLoader={this.setLoader} />
                </Route>
                <Route path="/edit-template/:templateId" exact>
                  <EditContentTemplate addNotification={this.addNotification} loading={this.state.loading} setLoader={this.setLoader} />
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
