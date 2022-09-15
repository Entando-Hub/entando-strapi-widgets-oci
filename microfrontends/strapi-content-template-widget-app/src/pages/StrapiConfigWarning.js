import { Button } from 'patternfly-react';
import React from 'react';
import { BTN_RELOAD_PAGE, STRAPI_CONFIG_WARNING_MSG } from '../constant/constant';
export default function StrapiConfigWarning() {
    return (
        <div className="well">
            <div>
                <h4>
                    <strong>
                        <span className="pficon pficon-warning-triangle-o"></span>
                        {STRAPI_CONFIG_WARNING_MSG}
                    </strong>
                </h4>
            </div>
            <div className="mt-2">
                <Button bsStyle="primary" onClick={() => window.location.reload()}>
                    {BTN_RELOAD_PAGE}
                </Button>
            </div>
        </div>
    )
}