import moment from 'moment';
import { Grid } from 'patternfly-react/dist/js/components/Grid';
import { Panel, PanelGroup } from 'react-bootstrap';
import { ACCORDION_FONT_SIZE, NO_DATA_AVAILABLE_MSG, STRAPI_EXCLUDE_KEYS, STRAPI_IMAGE_EXTENSIONS, STRAPI_IMAGE_HEIGHT, STRAPI_IMAGE_URL_KEY, STRAPI_IMAGE_WIDTH, UNIVERSAL_DATE_FORMAT } from './Constant';

let panelGroupId = 1;

export const renderPanelGroup = (data, strapiBaseUrl) => {
    panelGroupId = panelGroupId + 1;
    return (
        <PanelGroup accordion id={panelGroupId} className="panelgroup-mb">
            {data && Object.keys(data).length > 0
                ?
                isImageObject(data)
                    ?
                    renderPanel(STRAPI_IMAGE_URL_KEY, 0, data[STRAPI_IMAGE_URL_KEY], strapiBaseUrl)
                    :
                    Object.keys(data).filter(key => ignoreProps(key)).map((key, index) => {
                        let keyToShow;
                        let dataToShow;
                        if (isAnArray(data) && key && (Number(key) || Number(key) === 0)) {
                            if(data[key]) {
                                keyToShow = checkIfComponent(data[key]);
                                if(keyToShow && !Number(keyToShow)) {
                                    dataToShow = {...data[key]};
                                    delete dataToShow['__component'];
                                } else {
                                    keyToShow = key;
                                    dataToShow = data[key];
                                }
                            }
                            if (keyToShow && (Number(keyToShow) || Number(keyToShow) === 0)) {
                                keyToShow = Number(keyToShow) + 1;
                                keyToShow = keyToShow.toString();
                            }
                        } else {
                            keyToShow = key;
                            dataToShow = data[key];
                        }
                        return (renderPanel(keyToShow, index, dataToShow, strapiBaseUrl));
                    })
                :
                <span>{NO_DATA_AVAILABLE_MSG}</span>}
        </PanelGroup>
    )
}

const checkIfComponent = (dataObj) => {
    if (dataObj) {
        let keys = Object.keys(dataObj);
        if (keys.includes('__component')) {
            let arr = dataObj['__component'] && dataObj['__component'].split('.');
            if (arr && arr.length > 0) {
                if (arr[1] && arr[1].indexOf('-')) {
                    return arr[1].replace('-', '_');
                } else {
                    return arr[1];
                }
            }
        }
    }
}

const isAnArray = (data) => {
    if (data) {
        if (Array.isArray(data)) {
            return true;
        } else {
            return false;
        }
    } else {
        return false;
    }
}

const renderPanel = (theKey, theIndex, data, strapiBaseUrl) => {
    return (
        <Panel eventKey={theIndex} key={theIndex}>
            {renderPanelHeading(theKey, data, strapiBaseUrl)}
            {
                isObject(data)
                &&
                renderPanelBody(data, true, strapiBaseUrl)
            }
        </Panel>
    )
}

const renderPanelHeading = (theKey, data, strapiBaseUrl) => {
    return (
        <Panel.Heading>
            {isObject(data) && !isImageObject(data)
                ?
                renderPanelTitleToggle(theKey)
                :
                renderPanelTitle(theKey, data, strapiBaseUrl)}
        </Panel.Heading>
    );
}

const renderPanelTitle = (theKey, data, strapiBaseUrl) => {
    return (
        <Panel.Title>
            <Grid.Row className="show-grid">
                <Grid.Col className="grid-col-field">
                    <div>
                        <strong>
                            {isImageObject(data) && isKey0To9(theKey)
                            ?
                            'Photo' + ' ' + theKey.charAt(0).toUpperCase() + theKey.slice(1)
                            :
                            theKey.charAt(0).toUpperCase() + theKey.slice(1)
                            }
                        </strong>
                    </div>
                </Grid.Col>
                <Grid.Col className="grid-col-value">
                    {
                    isImageObject(data)
                    ?
                    renderAccordionData(data[STRAPI_IMAGE_URL_KEY.toLowerCase()], strapiBaseUrl)
                    :
                    renderAccordionData(data, strapiBaseUrl)
                    }
                </Grid.Col>
            </Grid.Row>
        </Panel.Title>
    );
}

const renderPanelTitleToggle = (theKey) => {
    return (
        <Panel.Title toggle className="panel-title">
            <span><strong>{theKey.charAt(0).toUpperCase() + theKey.slice(1)}</strong></span>
        </Panel.Title>
    );
}

const renderPanelBody = (data, isObject, strapiBaseUrl) => {
    if (isObject) {
        return (
            <Panel.Body collapsible>
                {renderPanelGroup(data, strapiBaseUrl)}
            </Panel.Body>
        )
    } else {
        return (
            <Panel.Body collapsible>
                <span>{data}</span>
            </Panel.Body>
        )
    }
}

const renderAccordionData = (data, strapiBaseUrl) => {
    if (data === null || data === undefined) {
        return <span> - </span>
    } else if (typeof data === 'boolean') {
        return <span>{data.toString()}</span>
    } else if (typeof data === 'string') {
        if (endsWithAnyImageExtension(data)) {
            return <img src={strapiBaseUrl + data} width={STRAPI_IMAGE_WIDTH} height={STRAPI_IMAGE_HEIGHT} alt='image' />
        } else if (isDate(data)) {
            return <span>{moment(new Date(data)).format(UNIVERSAL_DATE_FORMAT)}</span>;
        }
        return <span className="accordian-data">{data}</span>;
    } else if (typeof data === 'number') {
        return <span>{data}</span>;
    } else if (typeof data === 'object') {
        return data;
    } else {
        return <span> - </span>;
    }
}

const isDate = (dateString) => {
    if(dateString) {
        if(dateString && dateString.endsWith('Z') && dateString.length === 24 && dateString.split('T')[0].length === 10 && dateString.split('T')[1].length === 13) { //2016-11-16T04:30:00.000Z
            return true;
        }
    }
    return false;
}

const endsWithAnyImageExtension = (string) => {
    for (let suffix of STRAPI_IMAGE_EXTENSIONS)
        if (string.toUpperCase().endsWith(suffix))
            return true;
    return false;
}

const isObject = (data) => {
    if (data) {
        if (typeof data === 'object') {
            return true;
        } else {
            return false;
        }
    } else {
        return false;
    }
}

const isImageObject = (object) => {
    let keys = object && Object.keys(object);
    if (keys && keys.includes('ext') && keys.includes('formats') && keys.includes('url')) {
        if (STRAPI_IMAGE_EXTENSIONS.includes(object['ext'].toUpperCase())) {
            return true;
        }
    }
    return false;
}

const isKey0To9 = (key) => {
    if (key && Number(key) && Number(key) >= 0) {
        return true;
    } return false;
}

const ignoreProps = (key) => {
    return !STRAPI_EXCLUDE_KEYS.includes(key);
}