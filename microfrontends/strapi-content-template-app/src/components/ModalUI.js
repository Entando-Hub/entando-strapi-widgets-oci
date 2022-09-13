import React, { Component } from 'react'
import { Button } from 'patternfly-react/dist/js/components/Button'
import { Icon } from 'patternfly-react/dist/js/components/Icon'
import { Modal } from 'patternfly-react/dist/js/components/Modal'
import { CANCEL_LABEL, DELETE_LABEL } from '../constant/constant'

export default class ModalUI extends Component {
    render() {
        return (
            <Modal show={this.props.modalShow} onHide={this.props.modalHide}>
                <Modal.Header>
                    <button
                        className="close"
                        onClick={this.props.modalHide}
                        aria-hidden="true"
                        aria-label="Close"
                    >
                        <Icon type="pf" name="close" />
                    </button>

                    <Modal.Title>{this.props.title}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {this.props.children}
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        bsStyle="default"
                        className="btn-cancel"
                        onClick={this.props.modalHide}
                    >
                        {this.props.cancelButtonLabel ? this.props.cancelButtonLabel : CANCEL_LABEL}
                    </Button>
                    {this.props.type === 'delete' && <Button
                        bsStyle="danger"
                        className="btn-delete"
                        onClick={this.props.handleDelete}
                    >
                        {DELETE_LABEL}
                    </Button>}
                </Modal.Footer>
            </Modal>
        )
    }
}
