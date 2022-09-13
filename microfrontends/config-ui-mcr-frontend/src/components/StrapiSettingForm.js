import { Col, FieldLevelHelp, Grid, Row } from 'patternfly-react';
import { Spinner } from 'patternfly-react/dist/js/components/Spinner';
import { TimedToastNotification, ToastNotificationList } from 'patternfly-react/dist/js/components/ToastNotification';
import React, { Component } from 'react';
import { getStrapiConfiguration, saveStrapiConfiguration } from '../api/api';
import { BUTTON_SAVE, LABEL_APPLICATION_URL, LABEL_STRAPI_CONFIG_SETTINGS, MSG_REQ_APPLICATION_URL, MSG_VALID_APPLICATION_URL, TOOLTIP_URL } from '../helpers/constants';

export default class StrapiSettingForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            baseUrl: "",
            error: '',
            loadingData: false,
            showNotification: false,
            message: "",
            notificationType: "success"
        };
    }

    validate = (value) => {
        if (!value) {
            return MSG_REQ_APPLICATION_URL;
        } else if (
            !value.match(/(((http)|(https))?:\/\/(www)\.(\w+)\.((\w{3})|(\w{2}))$)|^((https?:\/\/))(?:([a-zA-Z]+)|(\d+\.\d+\.\d+\.\d+)):\d{4}?$/)
        ) {
            return MSG_VALID_APPLICATION_URL;
        } else {
            return "";
        }
    }

    handleUserInput = e => {
        this.setState({
            error: this.validate(e.target.value),
            baseUrl: e.target.value
        });
    };

    handleSubmit = e => {
        e.preventDefault();
        if (this.state.baseUrl) {
            this.callSaveStrapiConfiguration({ baseUrl: this.state.baseUrl });
        }
    };

    componentDidMount = async () => {
        this.callGetStrapiConfiguration();
    }

    componentDidUpdate = async (prevProps, prevState) => {
        if (prevProps.apiURL !== this.props.apiURL) {
            this.callGetStrapiConfiguration(this.props.apiURL['int-api']['url']);
        }
    }

    async callSaveStrapiConfiguration(payload) {
        this.setState({ loadingData: true });
        const { data, isError } = await saveStrapiConfiguration(payload, this.props.apiURL['int-api']['url']);
        if (data && data.data && !isError) {
            this.setState({
                baseUrl: data.data.baseUrl,
                showNotification: true,
                notificationType: "success",
                message: "URL configured successfully."
            });
        } else if (data && isError) {
            console.error(data);
            this.setState({
                showNotification: true,
                notificationType: "error",
                message: "URL not configured successfully."
            });
        }
        this.setState({ loadingData: false });
        setTimeout(() => this.setState({ showNotification: false }), 3000);
    }

    async callGetStrapiConfiguration(url) {
        this.setState({ loadingData: true });
        const { data, isError } = await getStrapiConfiguration(url);
        if (data && data.data && !isError) {
            this.setState({
                baseUrl: data.data.baseUrl
            });
        }
        this.setState({ loadingData: false });
    }

    render() {
        const { error, baseUrl } = this.state;
        return (
            <div>
                <form autoComplete="off" onSubmit={this.handleSubmit}>
                    <Grid>
                        <Row className="mt-2">
                            <Col lg={12}>
                                <h1><b>{LABEL_STRAPI_CONFIG_SETTINGS}</b></h1>
                            </Col>
                        </Row>
                        <Row className="mt-2"></Row>
                        <Row className="mt-2">
                            <Col lg={3}>
                                <label htmlFor="type" className="control-label">
                                    <span className="FormLabel">
                                        <span>{LABEL_APPLICATION_URL}</span>
                                        <sup>
                                            <i className="fa fa-asterisk required-icon FormLabel__required-icon"></i>
                                        </sup>
                                    </span>
                                </label>
                                <FieldLevelHelp buttonClass="" close={undefined} content={TOOLTIP_URL} inline placement="right" rootClose />
                            </Col>
                            <Col lg={5}>
                                <input
                                    name="baseUrl"
                                    type="text"
                                    id="id"
                                    value={baseUrl}
                                    placeholder=""
                                    className="form-control RenderTextInput"
                                    onChange={event => this.handleUserInput(event)}
                                />
                                <span className="text-danger">{error}</span>
                                {this.state.loadingData &&
                                    <Spinner
                                        loading={this.state.loadingData}
                                        className=""
                                        size="md"
                                    ></Spinner>}
                            </Col>
                            <Col lg={4}>
                                <button className="btn-primary btn"
                                    disabled={!baseUrl || error}>{BUTTON_SAVE}
                                </button>
                            </Col>
                        </Row>
                        {/* <Row>
                            <Col lg={8}></Col>
                            <Col lg={4}>
                                <button className="btn-primary btn"
                                    disabled={!baseUrl || error}>{BUTTON_SAVE}
                                </button>
                            </Col>
                        </Row> */}
                    </Grid>
                </form>
                <div>
                    {this.state.showNotification &&
                        <ToastNotificationList>
                            <TimedToastNotification onDismiss={()=>this.setState({showNotification: false})} type={this.state.notificationType}>
                                <span> {this.state.message} </span>
                            </TimedToastNotification>
                        </ToastNotificationList>}
                </div>
            </div>
        )
    }
}
