import ace from 'brace';
import 'brace/ext/language_tools';
import 'brace/mode/html';
import 'brace/snippets/html';
import 'brace/theme/tomorrow';
import React, { Component } from 'react';
import AceEditor from 'react-ace';
import { Typeahead } from 'react-bootstrap-typeahead';
import { Link, withRouter } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import {
    ADD_LABEL, ADD_TEMP_LABEL, CANCEL_LABEL, CLOSE_LABEL, DICTIONARY, DICTMAPPED, EDIT_LABEL, EDIT_TEMP_LABEL, ELE_TYPE, FIELD_REQ, MAX50CHAR, NOTIFICATION_OBJECT, NOTIFICATION_TIMER_ERROR,
    NOTIFICATION_TIMER_SUCCESS, NOTIFICATION_TYPE, SAVE_LABEL, SOMETHING_WENT_WRONG_MSG,
    TEMPLATE_CREATED_SUCCESSFULLY_MSG, TEMPLATE_UPDATED_MSG
} from '../constant/constant';
import { filterACollectionType, getFilteredContentTypes } from '../helpers/helpers';
import { getAttributes, getContentTypes, getFields } from '../integration/StrapiAPI';
import { addNewTemplate, editTemplate, getTemplateById } from '../integration/Template';
import ModalUI from './ModalUI';
import { FieldLevelHelp } from 'patternfly-react';
import { FormattedMessage, injectIntl } from "react-intl";
import { Spinner } from 'patternfly-react/dist/js/components/Spinner';

const langTools = ace.acequire('ace/ext/language_tools');
const tokenUtils = ace.acequire('ace/autocomplete/util');
const { textCompleter, keyWordCompleter, snippetCompleter } = langTools;
const defaultCompleters = [textCompleter, keyWordCompleter, snippetCompleter];

const escChars = term => term.replace('$', '\\$').replace('#', '\\#');
const isAttribFunction = term => /[a-zA-Z]+\([^)]*\)(\.[^)]*\))?/g.test(term);
const createSuggestionItem = (key, namespace, lvl = 0, meta = '') => ({
    caption: key,
    value: key,
    score: 10000 + lvl,
    meta: meta || `${namespace} Object ${isAttribFunction(key) ? 'Method' : 'Property'}`,
});

const aceOnBlur = onBlur => (_event, editor) => {
    if (editor) {
        const value = editor.getValue();
        onBlur(value);
    }
};

class ContentTemplateForm extends Component {

    constructor(props) {
        super(props)
        this.state = {
            code: '',
            name: '',
            selectedContentType: [],
            editorCoding: '',
            contentTypes: [],
            styleSheet: '',
            modalShow: false,
            editor: null,
            dictionaryLoaded: false,
            dictionary: DICTIONARY,
            dictList: [],
            dictMapped: DICTMAPPED,
            contentTemplateCompleter: null,
            attributes: {},
            subSpaceState: [],

            attributesList: [],
            attributesListJson: {},
            attributesListArray: [],
            formType: this.props.formType,
            saveStatus: false,
            errorObj: {
                name: {
                    message: '',
                    valid: false,
                },
                type: {
                    message: '',
                    valid: false,
                },
                editorCoding: {
                    message: '',
                    valid: false,
                },
                styleSheet: {
                    message: '',
                    valid: false,
                }
            },
        }
        this.prevToken = '';
        this.handleNameChange = this.handleNameChange.bind(this);
        this.handleTypeHeadChange = this.handleTypeHeadChange.bind(this);
        this.handleStyleSheetChange = this.handleStyleSheetChange.bind(this);
        this.handleEditorCodingChange = this.handleEditorCodingChange.bind(this);
    }

    componentDidMount = async () => {
        await this.getCollectionTypes();
        if (this.state.formType === EDIT_LABEL) {
            this.props.setLoader(true);
            await this.getTemplateById();
            this.props.setLoader(false);
        }
    }

    componentDidUpdate = async (prevProps, prevState) => {
        if (this.state.selectedContentType !== prevState.selectedContentType) {
            if (this.state.selectedContentType.length && this.state.selectedContentType[0].uid) {
                const conType = this.state.selectedContentType[0].uid.split('.');
                const attrdata = await getContentTypes(conType[conType.length - 1]);
                this.setState({ attributes: attrdata });
            }
        }
    }

    /**
     * Get the collection types
     */
    getCollectionTypes = async () => {
        const contentList = await getFilteredContentTypes();
        if (contentList && contentList.length) {
            const refinedContentTypes = [];
            contentList.forEach(element => {
                refinedContentTypes.push({ label: element.info.displayName, uid: element.uid, attributes: element.attributes })
            });
            this.setState({ contentTypes: refinedContentTypes });
        }
    }

    getTemplateById = async () => {
        const res = await getTemplateById(this.props.match.params.templateId);
        if (res && !res.isError) {
            let collectionTypeToPrefill = await filterACollectionType(this.state.contentTypes, res.templateData.collectionType);
            this.handleTypeHeadChange(collectionTypeToPrefill);
            const errorObject = this.state.errorObj;
            for (const key in errorObject) {
                const element = this.state.errorObj[key];
                element.valid = true
            }
            this.setState({
                selectedContentType: collectionTypeToPrefill,
                name: res.templateData.templateName,
                editorCoding: res.templateData.contentShape,
                styleSheet: res.templateData.styleSheet,
                errorObj: errorObject
            });
        } else if (res.isError) {
            let notificationObj = NOTIFICATION_OBJECT;
            notificationObj.key = uuidv4();
            notificationObj.type = NOTIFICATION_TYPE.ERROR;
            if (res.errorBody && res.errorBody.response && res.errorBody.response.data && res.errorBody.response.data.details && res.errorBody.response.data.details.length) {
                notificationObj.message = res.errorBody.response.data.details.join(", ");
            } else {
                notificationObj.message = SOMETHING_WENT_WRONG_MSG;
            }
            notificationObj.timerdelay = NOTIFICATION_TIMER_ERROR;
            this.props.addNotification(notificationObj);
        }
    }

    handleSubmit = async (event) => {
        this.setState({saveStatus: true});
        event.preventDefault();
        let notificationObj = NOTIFICATION_OBJECT;
        notificationObj.key = uuidv4();

        let filterUidByContentTypeLabel = this.state.contentTypes.find(el => {
            if (el.label === this.state.selectedContentType[0].label) return el;
        })

        let templateObject =
        {
            "collectionType": this.state.selectedContentType.length ? this.state.selectedContentType[0].label : '',
            "templateName": this.state.name ? this.state.name : '',
            "templateApiId": filterUidByContentTypeLabel.uid.split('.')[filterUidByContentTypeLabel.uid.split('.').length - 1],
            "contentShape": this.state.editorCoding,
            // TODO: require clear
            "code": "News7777",
            "styleSheet": this.state.styleSheet,
        }
        if (this.state.formType === EDIT_LABEL) {
            await this.callEditTemplateApi(templateObject, notificationObj);
        }
        else if (this.state.formType === ADD_LABEL) {
            await this.callAddTemplateApi(templateObject, notificationObj);
        }
    }

    async callAddTemplateApi(templateObject, notificationObj) {
        await addNewTemplate(templateObject).then((res) => {
            if (res.isError) {
                notificationObj.type = NOTIFICATION_TYPE.ERROR;
                if (res.errorBody && res.errorBody.response && res.errorBody.response.data && res.errorBody.response.data.errors && res.errorBody.response.data.errors.length) {
                    notificationObj.message = res.errorBody.response.data.errors.join(", ");
                } else {
                    notificationObj.message = SOMETHING_WENT_WRONG_MSG;
                }
                notificationObj.timerdelay = NOTIFICATION_TIMER_ERROR;
            } else {
                notificationObj.type = NOTIFICATION_TYPE.SUCCESS;
                notificationObj.message = TEMPLATE_CREATED_SUCCESSFULLY_MSG;
                notificationObj.timerdelay = NOTIFICATION_TIMER_SUCCESS;
                this.props.history.push('/');
            }
            this.props.addNotification(notificationObj);
        });
    }

    async callEditTemplateApi(templateObject, notificationObj) {
        await editTemplate(templateObject, this.props.match.params.templateId).then((res) => {
            if (res.isError) {
                notificationObj.type = NOTIFICATION_TYPE.ERROR;
                if (res.errorBody && res.errorBody.response && res.errorBody.response.data && res.errorBody.response.data.errors && res.errorBody.response.data.errors.length) {
                    notificationObj.message = res.errorBody.response.data.errors.join(", ");
                } else {
                    notificationObj.message = SOMETHING_WENT_WRONG_MSG;
                }
                notificationObj.timerdelay = NOTIFICATION_TIMER_ERROR;
            } else {
                notificationObj.type = NOTIFICATION_TYPE.SUCCESS;
                notificationObj.message = TEMPLATE_UPDATED_MSG;
                notificationObj.timerdelay = NOTIFICATION_TIMER_SUCCESS;
                this.props.history.push('/');
            }
            this.props.addNotification(notificationObj);
        });
    }

    /**
     * Get code and type fields of attributes
     */
    async getAttributeData(uid) {
        this.props.setLoader(true);
        let refinedAttributes = [];
        let refinedJson = {};
        const filteredAttributes = this.state.contentTypes.filter((el) => el.uid === uid);
        for (let attr in filteredAttributes[0].attributes) {
            refinedAttributes.push({ [attr]: filteredAttributes[0].attributes[attr]['type'] });
            refinedJson[attr] = filteredAttributes[0].attributes[attr]['type'];
        }
        const getAtt = await getAttributes(filteredAttributes[0]['uid'])
        this.setState({ attributesList: refinedAttributes, attributesListJson: refinedJson, attributesListArray: getAtt }, () => {
            this.props.setLoader(false);
        });

    }

    /**
     * Get the fields to show in editor on pressing dot with content
     * @param {*} filteredAttributes 
     */
    getReflectiveFields(filteredAttributes) {
        const content = {};
        if (filteredAttributes && filteredAttributes.length && filteredAttributes[0].attributes) {
            const fieldsArr = Object.keys(filteredAttributes[0].attributes);

            fieldsArr.map((el) => {
                content[el + "}}"] = [
                    "getTextForLang(\"<LANG_CODE>\")",
                    "text",
                    "textMap(\"<LANG_CODE>\")"
                ]
            });
        }
        const contentObject = { 'content': content }
        this.setState({ dictMapped: contentObject });
    }

    handleNameChange(event) {
        const errObjTemp = this.state.errorObj;
        if (!event.target.value.length) {
            errObjTemp.name.message = FIELD_REQ;
            errObjTemp.name.valid = false;
        }
        if (event.target.value.length) {
            errObjTemp.name.message = '';
            errObjTemp.name.valid = true;
        }
        if (event.target.value.length > 50) {
            errObjTemp.name.message = MAX50CHAR;
            errObjTemp.name.valid = false;
        }
        this.setState({ name: event.target.value, errorObj: errObjTemp })
    }

    handleTypeHeadChange = async (selectedContentTypeObj) => {
        const errObjTemp = this.state.errorObj;
        if (selectedContentTypeObj.length) {
            errObjTemp.type.valid = true;
            errObjTemp.type.message = '';
            this.setState({ errorObj: errObjTemp })
            this.setState({ selectedContentType: selectedContentTypeObj }, async () => {
                this.getAttributeData(selectedContentTypeObj[0].uid);
                const dataForDictMap = await getFields(selectedContentTypeObj[0].uid);
                this.setState({ dictMapped: dataForDictMap });
            });
        } else {
            errObjTemp.type.valid = false;
            errObjTemp.type.message = FIELD_REQ;
            this.setState({ errorObj: errObjTemp })
            this.setState({ selectedContentType: selectedContentTypeObj });
        }
    }

    handleEditorCodingChange(value) {
        const errObjTemp = this.state.errorObj;
        if (!value.length) {
            errObjTemp.editorCoding.message = FIELD_REQ;
            errObjTemp.editorCoding.valid = false;
        }
        if (value.length) {
            errObjTemp.editorCoding.message = '';
            errObjTemp.editorCoding.valid = true;
        }
        this.setState({ editorCoding: value, errorObj: errObjTemp })
    }

    handleStyleSheetChange(event) {
        this.setState({ styleSheet: event.target.value });
    }

    modalHide = () => {
        this.setState({ modalShow: false });
    }

    onBlurHandler = (elementType) => {
        const errObjTemp = this.state.errorObj
        if (elementType === ELE_TYPE.NAME) {
            if (!this.state.name.length) {
                errObjTemp.name.valid = false;
                errObjTemp.name.message = FIELD_REQ;
            }
        }
        else if (elementType === ELE_TYPE.EDITORCODING) {
            if (!this.state.editorCoding.length) {
                errObjTemp.editorCoding.valid = false;
                errObjTemp.editorCoding.message = FIELD_REQ;
            }
        }
        else if (elementType === ELE_TYPE.TYPE) {
            if (!this.state.selectedContentType.length) {
                errObjTemp.type.valid = false;
                errObjTemp.type.message = FIELD_REQ;
            }
        }
        this.setState({ errorObj: errObjTemp })
    }

    // =================== START: Coding of React-Ace ============== 
    onEditorLoaded = (editor) => {
        this.setState({ editor });

        this.initCompleter();

        editor.commands.addCommand({
            name: 'dotCommandSubMethods',
            bindKey: { win: '.', mac: '.' },
            exec: () => {
                editor.insert('.');
                const { selection } = editor;
                const cursor = selection.getCursor();
                const extracted = this.extractCodeFromCursor(cursor);
                const { namespace } = extracted;
                if (!namespace) {
                    this.enableRootSuggestions();
                    return;
                }

                const [rootSpace, ...subSpace] = namespace.split('.');
                this.setState({ subSpaceState: subSpace });

                if (subSpace.length > 4) {
                    this.enableRootSuggestions();
                    return;
                }

                const verified = subSpace.length
                    ? this.findTokenInDictMap(subSpace[subSpace.length - 1], rootSpace)
                    : this.findTokenInDictMap(rootSpace);
                if (verified) {
                    this.disableRootSuggestions();
                } else {
                    this.enableRootSuggestions();
                }
                editor.execCommand('startAutocomplete');
            },
        });
    }

    initCompleter() {
        const contentTemplateCompleter = {
            getCompletions: (
                _editor,
                session,
                cursor,
                prefix,
                callback,
            ) => {
                const extracted = this.extractCodeFromCursor(cursor, prefix);
                const { namespace, } = extracted;
                if (!namespace) {
                    this.enableRootSuggestions();
                } else {
                    const [rootSpace, ...subSpace] = namespace.split('.');

                    const verified = subSpace.length
                        ? this.findTokenInDictMap(subSpace[subSpace.length - 1], rootSpace)
                        : this.findTokenInDictMap(rootSpace);
                    if (verified) {
                        this.disableRootSuggestions();
                        const { dictMapped } = this.state;

                        if (verified.namespace) {
                            const mappedToken = dictMapped[verified.namespace];
                            let dictList = null
                            if (!mappedToken[verified.term]) {
                                dictList = Object.keys(this.state.attributes[subSpace[0]][subSpace[1]]).map((entry) => {
                                    return createSuggestionItem(entry, verified.namespace, 2)
                                })
                            } else {
                                dictList = mappedToken[verified.term].map((entry) => {
                                    return createSuggestionItem(entry, verified.namespace, 2)
                                });
                            }
                            this.setState({ dictList });
                        } else {
                            const mappedToken = dictMapped[verified.term];
                            const dictList = Object.entries(mappedToken)
                                .map(([entry]) => createSuggestionItem(entry, verified.term, 1));
                            this.setState({ dictList });
                        }
                    } else {
                        this.disableRootSuggestions();
                    }
                }

                const dictList = this.state.dictList;

                callback(null, dictList);
            },
        };

        langTools.setCompleters([...defaultCompleters, contentTemplateCompleter]);
        this.setState({ contentTemplateCompleter });
    }

    extractCodeFromCursor = ({ row, column }, prefixToken) => {
        const { editor: { session } } = this.state;
        const codeline = (session.getDocument().getLine(row)).trim();
        const token = prefixToken || tokenUtils.retrievePrecedingIdentifier(codeline, column);
        const wholeToken = tokenUtils.retrievePrecedingIdentifier(
            codeline,
            column,
            /[.a-zA-Z_0-9$\-\u00A2-\uFFFF]/,
        );
        if (token === wholeToken) {
            return { token, namespace: '' };
        }
        const namespace = wholeToken.replace(/\.$/g, '');
        return { token, namespace };
    }

    enableRootSuggestions = () => {
        const { dictionary, contentTemplateCompleter } = this.state;
        langTools.setCompleters([...defaultCompleters, contentTemplateCompleter]);
        this.setState({
            dictList: [...dictionary],
        });
    }

    findTokenInDictMap = (token, parentToken) => {
        this.prevToken = token;
        const { dictMapped } = this.state;

        const findInDict = (term, dict) => {
            if (Array.isArray(dict)) {
                return dict.find(dictEl => {
                    const keyRegEx = new RegExp(`${escChars(dictEl)}$`, 'g');
                    const result = keyRegEx.test(term)
                    return token;
                })
            }
            if (typeof dict === 'object') {
                return (Object.keys(dict).find((key) => {
                    const keyRegEx = new RegExp(`${escChars(key)}$`, 'g');
                    const result = keyRegEx.test(term)
                    return result;
                }
                ))
            }
        };

        if (!parentToken) {
            const term = findInDict(token, dictMapped);
            return term && { term };
        }
        const namespace = findInDict(parentToken, dictMapped);
        if (!namespace) {
            return false;
        }
        let term = null;

        if (this.state.subSpaceState.length === 2) {
            term = findInDict(this.prevToken, dictMapped[parentToken][this.state.subSpaceState[0]])
        } else {
            term = findInDict(this.prevToken, dictMapped[parentToken]);
        }
        if (!term) return false;
        return { term, namespace };
    }

    disableRootSuggestions = () => {
        const { contentTemplateCompleter } = this.state;
        langTools.setCompleters([contentTemplateCompleter]);
    }
    // =================== END: Coding of React-Ace ==============

    saveBtnStatus = () => {
        return this.state.errorObj.name.valid && this.state.errorObj.editorCoding.valid && this.state.errorObj.type.valid && !this.state.saveStatus;
    }

    render() {
        return (
            <div className="container-fluid container-fluid-margin">
                <form onSubmit={this.handleSubmit}>
                    <div className="formContainer col-xs-12 formContainer-margin">
                        <div className="col-lg-6">
                            <h1 className="ctf-heading"><b>{this.props.formType === EDIT_LABEL ? EDIT_TEMP_LABEL : ADD_TEMP_LABEL}</b></h1>
                        </div>
                        <div className="col-lg-6">
                            <div className="pull-right">
                                <Link to="/">
                                    <button className="btn-default btn">{CANCEL_LABEL}</button>
                                </Link>
                                <button className="btn-primary btn ctf-save-btn" type="submit" disabled={!this.saveBtnStatus()} >{SAVE_LABEL}</button>
                            </div>
                        </div>
                    </div>
                    <div className="formContainer col-xs-12 form-group">
                        <div className="col-lg-12">
                            <legend className="ctf-legend">
                                <div className="text-right">
                                    * <span><FormattedMessage id="app.requiredFields" /></span>
                                </div>
                            </legend>
                        </div>
                    </div>
                    <div className="formContainer col-xs-12 form-group">
                        <div className="col-lg-2 text-right">
                            <label htmlFor="type" className="control-label">
                                <span className="FormLabel">
                                    <span><FormattedMessage id="app.type" /></span>
                                    <sup>
                                        <i className="fa fa-asterisk required-icon FormLabel__required-icon"></i>
                                    </sup>
                                </span>
                            </label>
                            <FieldLevelHelp buttonClass="" close={undefined} content={this.props.intl.formatMessage({ id: "app.selectOneExistingCollectionTypeToUseForTheContentTemplate" })} inline placement="right" rootClose />
                        </div>
                        <div className={`col-lg-10`}>
                            <Typeahead
                                id="basic-typeahead-multiple"
                                onChange={this.handleTypeHeadChange}
                                options={this.state.contentTypes}
                                placeholder={this.props.intl.formatMessage({ id: "app.choose" })}
                                emptyLabel={this.props.intl.formatMessage({ id: "app.noMatchesFound" })}
                                selected={this.state.selectedContentType}
                                className={this.state.errorObj.type.message && 'has-error'}
                                onBlur={() => this.onBlurHandler(ELE_TYPE.TYPE)}
                                disabled={this.state.formType === EDIT_LABEL}
                            />
                            {this.state.errorObj.type.message &&
                                <span className="validation-block">
                                    <span>{this.state.errorObj.type.message}</span>
                                </span>
                            }
                        </div>
                    </div>
                    <div className="formContainer col-xs-12 form-group">
                        <div className="col-lg-2 text-right">
                            <label htmlFor="name" className="control-label">
                                <span className="FormLabel">
                                    <span><FormattedMessage id="app.name" /></span>
                                    <sup>
                                        <i className="fa fa-asterisk required-icon FormLabel__required-icon"></i>
                                    </sup>
                                    <FieldLevelHelp buttonClass="" close={undefined} content={this.props.intl.formatMessage({ id: "app.youCanInsertUpTo50Characters,IncludingUpperOrLowerCaseLettersNumbersAndSpecialCharacters" })} inline placement="right" rootClose />
                                </span>
                            </label>
                        </div>
                        <div className={`col-lg-10 ${this.state.errorObj.name.message && 'has-error'}`}>
                            <input
                                name="id"
                                type="text"
                                id="id"
                                placeholder=""
                                className="form-control RenderTextInput"
                                value={this.state.name}
                                onChange={this.handleNameChange}
                                onBlur={() => this.onBlurHandler(ELE_TYPE.NAME)}
                            />
                        </div>
                        <div className="col-lg-2">
                        </div>
                        <div className="col-lg-10">
                            {this.state.errorObj.name.message &&
                                <span className="validation-block">
                                    <span>{this.state.errorObj.name.message}</span>
                                </span>
                            }
                        </div>
                    </div>
                    <div className="formContainer col-xs-12 form-group">
                        <div className="col-lg-2 text-right">
                            <label htmlFor="attributes" className="control-label">
                                <span className="FormLabel">
                                    <span><FormattedMessage id="app.attributes" /> </span>
                                    <sup>
                                        <i className="fa fa-asterisk required-icon FormLabel__required-icon"></i>
                                    </sup>
                                    <FieldLevelHelp buttonClass="" close={undefined} content={this.props.intl.formatMessage({ id: "app.providesTheAttributesListForTheSelectedCollectionType" })} inline placement="right" rootClose />
                                </span>
                            </label>
                        </div>

                        <div className="col-lg-10">
                            <Spinner
                                inline={false}
                                inverse={false}
                                loading={this.props.loading}
                                size="lg"
                            >
                                <table className="table table-striped table-bordered table-hover">
                                    <thead>
                                        <tr>
                                            <th><FormattedMessage id="app.code" /></th>
                                            <th><FormattedMessage id="app.type" /></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {this.state.attributesList.map(el => (
                                            <tr key={Object.keys(el)[0]}>
                                                <td>{Object.keys(el)[0]}</td>
                                                <td>{el[Object.keys(el)[0]]}</td>
                                            </tr>))}
                                    </tbody>
                                </table>
                            </Spinner>
                        </div>
                    </div>
                    <div className="formContainer col-xs-12 form-group">
                        <div className="col-lg-2 text-right">
                            <label htmlFor="modal" className="control-label">
                                <span className="FormLabel">
                                    <span><FormattedMessage id="app.htmlModel" /></span>
                                    <sup>
                                        <i className="fa fa-asterisk required-icon FormLabel__required-icon"></i>
                                    </sup>
                                    <FieldLevelHelp buttonClass="" close={undefined} content={this.props.intl.formatMessage({ id: "app.definesTheHTMLContentStructureUsingTheContentElementsDefinedByTheGivenCollectionType" })} inline placement="right" rootClose />
                                </span>
                            </label>
                        </div>
                        <div className="col-lg-10">
                            <button type="button" onClick={() => this.setState({ modalShow: true })} className="btn-default btn inlineEditingAssistant-btn"><FormattedMessage id="app.inlineEditingAssistant" /></button>
                        </div>
                    </div>
                    <div className="formContainer col-xs-12 form-group">
                        <div className="col-lg-2">
                        </div>
                        <div className="col-lg-10">
                            <AceEditor
                                mode="html"
                                theme="tomorrow"
                                width="100%"
                                showPrintMargin={false}
                                editorProps={{
                                    $blockScrolling: Infinity,
                                }}
                                setOptions={{
                                    useWorker: false,
                                }}
                                enableBasicAutocompletion
                                enableLiveAutocompletion
                                enableSnippets
                                name="UNIQUE_ID_OF_DIV"
                                onChange={this.handleEditorCodingChange}
                                onLoad={this.onEditorLoaded}
                                value={this.state.editorCoding}
                                className="aceEditor"
                                onBlur={() => this.onBlurHandler(ELE_TYPE.EDITORCODING)}
                            />
                        </div>

                        <div className="col-lg-2">
                        </div>
                        <div className="col-lg-10">
                            <span><FormattedMessage id="app.pressCtrlSpaceToOpenContentAssistMenu" /></span>
                        </div>

                        <div className="col-lg-2">
                        </div>
                        <div className="col-lg-10">
                            {this.state.errorObj.editorCoding.message &&
                                <span className="validation-block">
                                    <span>{this.state.errorObj.editorCoding.message}</span>
                                </span>
                            }
                        </div>
                    </div>
                    <div className="formContainer col-xs-12 form-group">
                        <div className="col-lg-2 text-right">
                            <label htmlFor="stylesheet" className="control-label">
                                <span className="FormLabel">
                                    <span><FormattedMessage id="app.styleSheet" /></span>
                                    <FieldLevelHelp buttonClass="" close={undefined} content={this.props.intl.formatMessage({ id: "app.providesAStylesheetFileToBeUsedWithTheHTMLModel" })} inline placement="right" rootClose />
                                </span>
                            </label>
                        </div>
                        <div className="col-lg-10">
                            <input
                                name="id"
                                type="text"
                                id="id"
                                placeholder=""
                                className="form-control RenderTextInput"
                                value={this.state.styleSheet}
                                onChange={this.handleStyleSheetChange}
                            />
                        </div>
                        <div className="col-lg-2">
                        </div>
                        <div className="col-lg-10">
                            {this.state.errorObj.styleSheet.message &&
                                <span className="validation-block">
                                    <span>{this.state.errorObj.styleSheet.message}</span>
                                </span>
                            }
                        </div>
                    </div>
                </form>

                <ModalUI modalShow={this.state.modalShow} modalHide={this.modalHide} title={<FormattedMessage id="app.inlineEditingAssistan" />} cancelButtonLabel={CLOSE_LABEL}>
                    <span>
                        <FormattedMessage id="app.providesAnExampleOnHowToActivate" /> <strong>style sheet INLINE EDITING </strong><FormattedMessage id="app.forEntandolabels" /> <br /><br />
                        <ol>
                            <li><FormattedMessage id="app.openA" /> <strong>TAG </strong> <FormattedMessage id="app.likeDivPSpan" /></li>
                            <li><FormattedMessage id="app.addTheClass" />  <strong>' editContent '</strong><FormattedMessage id="app.toTheTAGKeepInMindThat" />  <strong>'editContentText'</strong> <FormattedMessage id="app.classCanBeUsedInCaseOfATextArea" />  </li>
                            <li><FormattedMessage id="app.thenAdd" />  <strong>data-content-id="$content.getId()"</strong> </li>
                            <li><FormattedMessage id="app.thenAddTheAttributeIdTitleOfTheDesideredLabelAdding" />  <strong><FormattedMessage id='app.dataAttrIdTitle' /> </strong> <FormattedMessage id="app.andCloseTheTagWith" />  &gt;. <FormattedMessage id="app.pleaseBeCarefulWhenWritingTheAttributeIDasitis" />  <strong><FormattedMessage id="app.caseSensitive" /></strong> <FormattedMessage id="app.andItMustMatchTheLabelAttributeInTheNextStep" /> </li>
                            <li><FormattedMessage id="app.finallyAddTheLabelOfTheDesideredAttributeThatWillBeRenderedOnScreenWriting" /> <strong>$content.TITLE.text"</strong>.</li>
                            <li><FormattedMessage id="app.closeThe" /> <strong>TAG</strong> <FormattedMessage id="app.divPSpanOpenedAtTheVeryBeginning" /></li>
                        </ol>
                        <FormattedMessage id="app.resultShouldLookLikeThis" /> <br /><br /> OPEN TAG class="editContent" data-content-id="$content.getId()" data-attr-id="TITLE"' &gt;<br />$content.TITLE.text" <br /> CLOSE TAG
                    </span>
                </ModalUI>
            </div>
        )
    }
}

export default withRouter(injectIntl(ContentTemplateForm));
