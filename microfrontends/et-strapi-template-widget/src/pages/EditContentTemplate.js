import React, { Component } from 'react';
import ContentTemplateForm from '../components/ContentTemplateForm';
import { EDIT_LABEL } from '../constant/constant';

export default class EditContentTemplate extends Component {
    constructor(props) {
        super(props)
        this.state = {
            data:{},
            notifications: []
        }

        this.removeNotificationAction = notificationToRemove => {
            this.setState({
                notifications: this.state.notifications.filter(notification => notificationToRemove.key !== notification.key)
            });
        };
        this.showNotification = this.showNotification.bind(this);
    }

    showNotification = (notificationToAdd) => {
        this.state.notifications.push(notificationToAdd);
        this.setState({
            notifications: this.state.notifications
        });
    }

    render() {
        return (
            <div>
                <ContentTemplateForm
                    formType={EDIT_LABEL} addNotification={this.props.addNotification}
                    loading={this.props.loading} setLoader={this.props.setLoader}
                    apiUrl={this.props.apiUrl}
                />
            </div>
        )
    }
}
