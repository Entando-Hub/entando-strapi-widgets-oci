import React from 'react';
import { BTN_RELOAD_PAGE, STRAPI_CONFIG_WARNING_MSG } from '../helper/Constant';
import { WarningAlt } from '@carbon/icons-react';

export default function StrapiConfigWarning() {
    return (
        <div className="warning-container">
            <div className="msg-top well">
                <div>
                    <div><strong><span className="mr-10"><WarningAlt /> </span>
                        <span className="warning-text-fontsize">{STRAPI_CONFIG_WARNING_MSG}</span>
                    </strong>
                    </div>
                </div>
                <div className="mt-2">
                    <button className="main-widget-btn-primary" onClick={() => window.location.reload()}>
                        {BTN_RELOAD_PAGE}
                    </button>
                </div>
            </div>
        </div>
    )
}