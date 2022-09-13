import moment from 'moment';
import { Col, Grid, PaginationRow, Row } from 'patternfly-react';
import { Spinner } from 'patternfly-react/dist/js/components/Spinner';
import React, { Component } from 'react';
import { Typeahead } from 'react-bootstrap-typeahead';
import { FormattedMessage, injectIntl } from "react-intl";
import { Link } from 'react-router-dom';
import { filterContentsByName, getAllRecordsByCollectionType, getCollectionTypes, getContents } from '../api/Api';
import { LASTPAGE, NAME, PAGE, PAGECHANGEVALUE, PAGEINPUT, PAGESIZE, PERPAGEOPTIONS, STRAPI_EXCLUDE_KEYS, TOTALITEMS, T_HEADING, UNIVERSAL_DATE_FORMAT } from '../helper/Constant';
import { PAGINATION_MESSAGES, parseData } from '../helper/Helper';
import ContentDetailModal from '../ui/ContentDetailModal';
class MultiContentList extends Component {

  constructor(props) {
    super(props);
    this.state = {
      // PAGINATION STATE
      page: PAGE,
      currPageWillUpdating: PAGE,
      pageSize: PAGESIZE,
      totalItems: TOTALITEMS,
      lastPage: LASTPAGE,
      pageInput: PAGEINPUT,
      pageChangeValue: PAGECHANGEVALUE,
      searchBtnClk: false,

      // MODAL STATE
      show: false,
      activeTabKey: 0,
      contentDetailsOnModal: {},

      // SEARCH STATE
      searchQuery: '',
      setSearchBy: '',
      stowSearchQueryTillSubmit: '',

      // DATA STATE
      collectionType: [],
      selectedCollectionType: [],
      contents: [],
      selectedContent: [],
      contentIdForModal: '',
      tempSelectedCollectionType: [],
      loadingData: false
    }
    this.searchByKey = '';
  }

  componentDidMount = async () => {
    this.populateConfigForm();
    await this.setCollectionTypeState();
    this.shouldShowEtSaveBtn('hidden');
    this.getContentByHighestId();
  }

  getContentByHighestId = async () => {
    const getContentIds = this.props.contentIdAndTemplateId && parseData(decodeURI(this.props.contentIdAndTemplateId));
    let contents = [];
    if (getContentIds) {
      const highestContentId = getContentIds.map(el => el.contentId).sort(function (a, b) { return a - b; }).reverse()[0];
      contents = await getAllRecordsByCollectionType(this.props.selectedContentName, highestContentId);
    }
    const parsedSelectedContent = this.props.selectedContentList.length ? parseData(this.props.selectedContentList) : ''
    if (parsedSelectedContent.length) {
      const filteredCont = parsedSelectedContent.map(cont => contents.results.find(el => el.id === cont.id))
      filteredCont.map(el => {
        getContentIds.find(cont => {
          if (el.id === +cont.contentId) {
            el.templateId = +cont.templateId;
          }
        })
      });
      this.setState({ selectedContent: filteredCont, loadingData: false })
    }
  }

  componentDidUpdate = async (prevProps, prevState) => {
    if ((prevState.pageSize !== this.state.pageSize || prevState.page !== this.state.page) && !this.state.searchBtnClk) {
      this.setState({ loadingData: true });
      if (this.props.colLabel && this.state.searchQuery) {
        const searchResult = await filterContentsByName(
          this.state.selectedCollectionType[0].value ? this.state.selectedCollectionType[0].value : this.props.selectedCollectionTypeValue.value,
          this.state.searchQuery ? this.state.searchQuery : this.props.searchText, this.props.colLabel, this.state.page, this.state.pageSize
        );
        this.stateUpdateOnFilterContentsByName(searchResult);
      } else {
        await this.getContentsByCollectionType(this.state.selectedCollectionType[0].value, this.state.page, this.state.pageSize);
      }
      return;
    }
    if (prevProps.selectedCollectionType !== this.props.selectedCollectionType ||
      prevState.pageSize !== this.state.pageSize && !this.state.searchBtnClk) {
      this.setState({ page: PAGE, pageInput: PAGE, currPageWillUpdating: PAGE },
        async () => {
          await this.getContentsByCollectionType(this.state.selectedCollectionType[0].value, this.state.page, this.state.pageSize);
        }
      )
    }
  }

  componentWillUnmount = () => {
    this.shouldShowEtSaveBtn('visible');
  }

  populateConfigForm = async () => {
    if (this.props.selectedCollectionTypeValue.value && this.props.selectedCollectionTypeValue.label) {
      this.setState({ selectedCollectionType: [this.props.selectedCollectionTypeValue] })
      if (this.props.searchText && this.props.colLabel) {
        this.searchByKey = this.props.colLabel;
        this.setState({ searchQuery: this.props.searchText, stowSearchQueryTillSubmit: this.props.searchText })
        const searchResult = await filterContentsByName(
          this.props.selectedCollectionTypeValue.value,
          this.props.searchText, this.props.colLabel, PAGE, PAGESIZE
        );
        this.stateUpdateOnFilterContentsByName(searchResult);
      } else {
        await this.getContentsByCollectionType(this.props.selectedCollectionTypeValue.value)
      }
    }
    if (this.props.selectedContentList.length) {
      this.setState({ selectedContent: parseData(this.props.selectedContentList) })
    }
  }

  shouldShowEtSaveBtn = (btnVisibility) => {
    for (let el of document.getElementsByClassName('pull-right save btn btn-primary')) {
      el.style.visibility = btnVisibility;
    }
  }

  stateUpdateOnFilterContentsByName(searchResult) {
    this.setState({
      contents: searchResult.results,
      lastPage: searchResult.pagination.pageCount ? searchResult.pagination.pageCount : 1,
      page: searchResult.results.length ? searchResult.pagination.page : 1,
      currPageWillUpdating: searchResult.results.length ? searchResult.pagination.page : 1,
      pageSize: searchResult.pagination.pageSize,
      totalItems: searchResult.pagination.total,
      searchBtnClk: (this.props.searchText && this.searchByKey) ? true : false,
      loadingData: false
    });
  }

  async setCollectionTypeState() {
    const { data: collectionTypeData } = await getCollectionTypes();
    const collectionTypeApiData = this.filterUidByApiPrefix(collectionTypeData);
    this.setState({ collectionType: collectionTypeApiData.map(el => ({ label: el.info.displayName, value: el.info.singularName })) });
  }

  filterUidByApiPrefix = (collectionTypeData) => {
    return collectionTypeData.filter(el => el.uid.startsWith('api::'))
  }

  open = async (content) => {
    this.setState({ show: true, contentDetailsOnModal: content, contentIdForModal: content && content.id, activeTabKey: 0 })
  }

  close = () => {
    this.setState({ show: false })
  }

  setActiveTabKey = (value) => {
    this.setState({ activeTabKey: value })
  }

  handleCollectionTypeChange = async (collectionType) => {
    this.searchByKey = '';
    this.props.setFieldSearchBy('');
    this.setState({ contents: [], selectedContent: [] });
    const collType = collectionType[0]
    this.setState({ selectedCollectionType: collectionType, searchQuery: '', stowSearchQueryTillSubmit: '' })
    if (collType && collType.value) {
      await this.getContentsByCollectionType(collType.value)
    }
    this.setState({ contentIdForModal: undefined });
  }

  getContentsByCollectionType = async (collectionType, page, pageSize) => {
    this.setState({
      loadingData: true,
    });
    const contentData = await getContents(collectionType, page, pageSize);
    this.setState({
      contents: contentData.results,
      lastPage: contentData.pagination.pageCount ? contentData.pagination.pageCount : 1,
      page: contentData.results.length ? contentData.pagination.page : 1,
      currPageWillUpdating: contentData.results.length ? contentData.pagination.page : 1,
      pageSize: contentData.pagination.pageSize,
      totalItems: contentData.pagination.total,
      setSearchBy: contentData && contentData.results.length && Object.keys(contentData.results[0])[1],
      loadingData: false,
    });
  }

  /**
   * Renders Button on Typehead.
   * @returns Button element
   */
  renderToggleButton = ({ isMenuShown, onClick }) => (
    <button
      type="button"
      className="render-toggle-btn"
      onClick={(e) => {
        e.preventDefault();
        onClick(e);
      }}
    ><span className="fa fa-angle-down"></span></button>
  );

  changePage(page) {
    this.setState({ page: page, currPageWillUpdating: page })
  }

  setPage = value => {
    const page = Number(value);
    if (
      !Number.isNaN(value) &&
      value !== '' &&
      page > 0 &&
      page <= this.totalPages()
    ) {
      let newPaginationState = Object.assign({}, this.state.pagination);
      newPaginationState.page = page;
      this.setState({ pagination: newPaginationState, pageChangeValue: page });
    }
  }

  onContentSearch = async (e) => {
    e.preventDefault();
    this.setState({ searchQuery: this.state.stowSearchQueryTillSubmit }, async () => {
      this.props.setFieldSearchBy(this.searchByKey);
      if (this.state.searchQuery) {
        this.setState({ loadingData: true });
        const searchResult = await filterContentsByName(
          this.state.selectedCollectionType[0].value,
          this.state.searchQuery, this.searchByKey, PAGE, PAGESIZE
        );
        this.stateUpdateOnFilterContentsByName(searchResult);
      } else {
        this.getContentsByCollectionType(this.state.selectedCollectionType[0].value)
      }
    })
  }

  handleQueryChange = (e) => {
    e.preventDefault();
    this.setState({ stowSearchQueryTillSubmit: e.target.value })
  }

  onPerPageSelect = (pageSize) => {
    this.setState({ searchBtnClk: false });
    this.setState({ pageSize })
  }

  onPageInput = e => {
    this.setState({ currPageWillUpdating: e.target.value, searchBtnClk: false })
  }

  onSubmit = () => {
    if (+this.state.currPageWillUpdating && this.state.currPageWillUpdating <= this.state.lastPage) {
      this.setState({ page: +this.state.currPageWillUpdating })
    }
  };

  onContentSelect(content) {
    if (!this.state.selectedContent.find(contentItem => (contentItem.id === content.id))) {
      this.setState({ selectedContent: [content, ...this.state.selectedContent] })
    } else {
      const removedUnselectedContentId = this.state.selectedContent.filter(contentItem => contentItem.id !== content.id);
      this.setState({ selectedContent: removedUnselectedContentId })
    }
  }

  onContentListSaveHandler = () => {
    //Empty String Co'z we are ending up with encoding the value;
    if (!this.state.selectedContent.length) this.props.SaveQueryHandler("");
    this.props.setQueryTerm(this.state.searchQuery);
    this.props.setContentTemplate(this.state.selectedContent.map((el) => ({ ...el, contentId: el.id, templateId: null })))
    this.props.setSelectedContentName(this.state.selectedCollectionType[0].value, this.state.selectedCollectionType[0].label, this.state.searchQuery)
  }

  checkIfSelected = (content) => {
    if (this.state.selectedContent.length) {
      const selectedItem = this.state.selectedContent.find(el => { return (el.id === content.id); })
      if (selectedItem) {
        return true;
      }
    }
    return false;
  }

  /**
   * Value to show under Name colum in the table.
   * Checks if name or title key is present, if yes, fetches its value or fetches any other key's value by excluding some specific keys.
   * @param {*} content
   * @returns
   */
  fetchTitleOrName = (content) => {
    if (content) {
      const keys = Object.keys(content);
      let index = keys.findIndex(item => 'title' === item.toLowerCase());
      if (index > -1) {
        this.searchByKey = Object.keys(content)[index];
        return content[Object.keys(content)[index]];
      } else {
        index = keys.findIndex(item => 'name' === item.toLowerCase());
        if (index > -1) {
          this.searchByKey = Object.keys(content)[index];
          return content[Object.keys(content)[index]];
        } else {
          const allowedKeys = keys.filter(item => !STRAPI_EXCLUDE_KEYS.includes(item));
          if (allowedKeys && allowedKeys.length) {
            this.searchByKey = allowedKeys[0];
            return content[allowedKeys[0]];
          }
        }
      }
    }
    this.searchByKey = '';
    return '-';
  }

  isToEnableSaveQueryBtn() {
    return !(this.state.selectedContent.length === 0 && this.state.contents && this.state.contents.length);
  }

  editMode = (key) => {
    if (this.props.isEditable === 'edit' &&
      Object.keys(this.props.selectedCollectionTypeValue).length
      && this.props.selectedCollectionTypeValue.label
      && this.props.selectedCollectionTypeValue.value
    ) {  // keep in constant file
      return this.props.selectedCollectionTypeValue[key]
    }
    return null
  }

  cancelHandler = () => {
    this.props.setSelectedContentName(this.editMode('value'), this.editMode('label'))
    if (this.props.isEditable === 'edit' && this.state.selectedContent.length) {
      this.setState({ searchQuery: '' });
      this.props.setQueryTerm('');
      return
    }
    if (this.props.isEditable === 'edit' && !this.props.searchText) {
      this.setState({ searchQuery: '' });
      this.props.setQueryTerm('');
      return
    }
  }

  render() {
    const pagination = {
      page: this.state.page,
      perPage: this.state.pageSize,
      perPageOptions: PERPAGEOPTIONS,
    };
    const itemsStart = this.state.totalItems === 0 ? 0 : ((this.state.page - 1) * this.state.pageSize) + 1;
    const itemsEnd = Math.min(this.state.page * this.state.pageSize, this.state.totalItems);
    return (
      <Grid>
        <Row className="mt-2">
          <Col lg={12}>
            <legend>
              <FormattedMessage id="app.contentList" />
            </legend>
          </Col>
        </Row>
        <Row className="mt-2">
          <Col lg={3}>
            <h6><b><FormattedMessage id="app.selectCollectionType" /></b></h6>
          </Col>
        </Row>
        <Row>
          <Col lg={3}>
            <Typeahead
              id="collectionTypeDropdown"
              placeholder={this.props.intl.formatMessage({ id: "app.selectCollection" })}
              emptyLabel={this.props.intl.formatMessage({ id: "app.noMatchesFound" })}
              options={this.state.collectionType}
              onChange={this.handleCollectionTypeChange}
              selected={this.state.selectedCollectionType}
            >
              {({ isMenuShown, toggleMenu }) => (
                this.renderToggleButton({ isMenuShown, onClick: toggleMenu })
              )}
            </Typeahead>
          </Col>
        </Row>
        {
          Object.keys(this.state.selectedCollectionType).length > 0 &&
          <>
            <Row className="mt-2">
              <Col lg={3}>
                <h5 className="collectiontype-heading"><strong>{this.state.selectedCollectionType && this.state.selectedCollectionType[0] && this.state.selectedCollectionType[0].label}</strong></h5>
              </Col>
            </Row>
            <Row>
              <Col lg={12}>
                <div
                  className="lcw-ContentsFilter well form-main-div"
                  role="button"
                  tabIndex={0}
                >
                  <form >
                    <div className="form-div">
                      <button id="dropdown-example" role="button" aria-haspopup="true" aria-expanded="false" type="button" className="dropdown-toggle btn btn-default">{NAME}</button>
                      <input
                        type="search"
                        name="name"
                        // value={this.state.searchQuery ? this.state.searchQuery : this.state.stowSearchQueryTillSubmit}
                        value={this.state.stowSearchQueryTillSubmit}
                        // this.stowSearchQueryTillSubmit
                        onChange={this.handleQueryChange}
                        role="combobox"
                        className="rbt-input-main form-control rbt-input"
                        placeholder={this.props.intl.formatMessage({ id: "app.searchContentByName" })}
                      />
                    </div>
                    <div className="pull-right mbt10 search-btn-div" >
                      <button className="btn btn-primary" onClick={this.onContentSearch}><FormattedMessage id='app.search' /></button>
                    </div>
                  </form>
                </div>
              </Col>
            </Row>
            <Row className="mt-2">
              <Col lg={12}>
                {this.state.loadingData &&
                  <Spinner
                    loading={this.state.loadingData}
                    className=""
                    size="md"
                  ></Spinner>}
                {!this.state.loadingData && <>
                  <table className="table dataTable table-striped table-bordered table-hover">
                    <thead>
                      <tr>
                        {Object.keys(T_HEADING).map(el => <th key={el}>{T_HEADING[el]}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {this.state.contents.map(content => {
                        return (
                          <tr key={content.id}>
                            <td width="5%" align="center">
                              <input onChange={() => {
                                this.onContentSelect(content); if (!this.state.selectedContent.length) {
                                  this.props.setQueryTerm('')
                                }
                              }}
                                type="checkbox" checked={this.checkIfSelected(content)} id={content + content.id} name="content" value={content.id}
                              />
                            </td>
                            <td role="button" onClick={() => this.open(content)}>{this.fetchTitleOrName(content)}</td>
                            <td role="button" onClick={() => this.open(content)}>{`${content.createdBy.firstname} ${content.createdBy.lastname}`}</td>
                            <td role="button" onClick={() => this.open(content)}>{moment(new Date(content.updatedAt)).format(UNIVERSAL_DATE_FORMAT)}</td>
                            <td role="button" onClick={() => this.open(content)}>{moment(new Date(content.publishedAt)).format(UNIVERSAL_DATE_FORMAT)}</td>
                          </tr>)
                      })}
                    </tbody>
                  </table>
                  <div className="custom-page"></div>
                  <PaginationRow
                    itemCount={this.state.totalItems}
                    itemsStart={itemsStart}
                    itemsEnd={itemsEnd}
                    viewType="table"
                    pagination={pagination}
                    amountOfPages={this.state.lastPage}
                    pageInputValue={this.state.currPageWillUpdating}
                    onPageSet={this.changePage}
                    onPerPageSelect={this.onPerPageSelect}
                    onFirstPage={() => { this.setState({ searchBtnClk: false }); this.changePage(1) }}
                    onPreviousPage={() => { this.setState({ searchBtnClk: false }); this.changePage(this.state.page - 1) }}
                    onPageInput={this.onPageInput}
                    onNextPage={() => { this.setState({ searchBtnClk: false }); this.changePage(this.state.page + 1) }}
                    onLastPage={() => { this.setState({ searchBtnClk: false }); this.changePage(this.state.lastPage) }}
                    onSubmit={this.onSubmit}
                    messages={PAGINATION_MESSAGES(this.props)}
                  />
                </>
                }
              </Col>
            </Row>
            {
              <>
                <Row className="mt-2" >
                  <Col sm={12}>
                    <h6><b><FormattedMessage id='app.widgetConfiguration' /></b></h6>
                  </Col>
                </Row>
                <Row className="mt-2" >
                  <Col sm={2}>
                    <FormattedMessage id='app.queryFilter' />
                  </Col>
                  <Col sm={10} className="queryBg">
                    <code>
                      <span className="queryfilter-label"><b>Collection Type =  </b> {this.state.selectedCollectionType[0].label} </span>
                      <span className="queryfilter-label">
                        {
                          // (this.state.searchQuery.length || this.props.searchText.length) > 0 && (<><b>WHERE Name = </b> %{this.state.searchQuery || this.props.searchText}% </>)
                          (this.state.searchQuery.length > 0) && (<><b>WHERE Name = </b> %{this.state.searchQuery}% </>)
                        }
                        <b>ORDER BY</b> creation date <b>DESC</b>
                      </span>
                    </code>
                  </Col>
                </Row>
              </>
            }
            {this.state.selectedContent.length > 0 && this.state.selectedContent.map(content => {
              return (
                <Row className="mt-2 table-row-border" key={content.id}>
                  <Col sm={2} className="table-col-border">
                    {this.fetchTitleOrName(content)}
                  </Col>
                  <Col sm={8}>
                    {this.state.selectedCollectionType && this.state.selectedCollectionType[0].label}
                  </Col>
                  <Col sm={2} className={"lcw-SingleContentConfigFormBody__addButtons"}>
                    <button className="btn" onClick={() => this.onContentSelect(content)}><FormattedMessage id='app.remove' /></button>
                  </Col>
                </Row>
              )
            })}
            <Row className="SingleContentConfigFormBody__actionBar row">
              <Col sm={6}>
              </Col>
              <Col sm={6} className="lcw-SingleContentConfigFormBody__addButtons">
                <Link to="/">

                  <button className="btn-default btn"
                    onClick={() => this.cancelHandler()}>
                    <FormattedMessage id='app.cancel' />
                  </button>

                  <button className="btn-primary btn lcw-AddContentTypeFormBody__save--btn"
                    onClick={() => this.onContentListSaveHandler()}
                    disabled={this.isToEnableSaveQueryBtn()}>
                    <FormattedMessage id='app.saveAsQuery' />
                  </button>

                  <button className="btn-primary btn lcw-AddContentTypeFormBody__save--btn"
                    onClick={() => this.onContentListSaveHandler()}
                    disabled={!this.state.selectedContent.length}>
                    <FormattedMessage id='app.saveAsListOfContents' />
                  </button>

                </Link>
              </Col>
            </Row>
          </>
        }
        <ContentDetailModal show={this.state.show} onHide={this.close} contentDetailsOnModal={this.state.contentDetailsOnModal} contentId={this.state.contentIdForModal}
          collectionType={this.state.selectedCollectionType && this.state.selectedCollectionType.length && this.state.selectedCollectionType[0].value}
          fetchTitleOrName={this.fetchTitleOrName} activeTabKey={this.state.activeTabKey} setActiveTabKey={this.setActiveTabKey} />
      </Grid>
    )
  }
}

export default injectIntl(MultiContentList);                                 