import {
  Col, Grid, PaginationRow, Row
} from 'patternfly-react';
import React, { Component } from 'react';
import { Typeahead } from 'react-bootstrap-typeahead';
import { Link } from 'react-router-dom';
import moment from 'moment';
import { filterContentsByName, getCollectionTypes, getContents } from '../api/Api';
import { LASTPAGE, NAME, PAGE, PAGECHANGEVALUE, PAGEINPUT, PAGESIZE, PERPAGEOPTIONS, SEARCH_CONTENT_BY_NAME, SELECT_COLLECTION_TYPE, STRAPI_EXCLUDE_KEYS, TOTALITEMS, T_HEADING, UNIVERSAL_DATE_FORMAT } from '../helper/Constant';
import ContentDetailModal from '../ui/ContentDetailModal';
import {  FormattedMessage,injectIntl } from "react-intl";
import { PAGINATION_MESSAGES, parseData } from '../helper/Helper';
import { Spinner } from 'patternfly-react/dist/js/components/Spinner';

class SingleContentList extends Component {

  constructor(props) {
    super(props);
    this.state = {
      page: PAGE,
      currPageWillUpdating: PAGE,
      pageSize: PAGESIZE,
      totalItems: TOTALITEMS,
      lastPage: LASTPAGE,
      pageInput: PAGEINPUT,
      pageChangeValue: PAGECHANGEVALUE,
      // Modal State
      show: false,
      activeTabKey: 0,

      contentDetailsOnModal: {},
      searchQuery: '',
      setSearchBy: '',
      searchBtnClk: false,
      // DATA STATE
      collectionType: [],
      selectedCollectionType: [],
      contents: [],
      selectedContent: {},
      contentIdForModal: '',
      loadingData: false
    }
    this.searchByKey = ''
  }

  componentDidMount = async () => await this.initSingleContentListPage();

  componentWillUnmount = () => this.shouldShowEtSaveBtn('visible');

  componentDidUpdate = async (prevProps, prevState) => {
    if (prevProps.selectedCollectionType !== this.props.selectedCollectionType ||
      prevState.pageSize !== this.state.pageSize && !this.state.searchBtnClk) {
        this.setState({loadingData: true});
      this.setState({ page: PAGE, pageInput: PAGE, currPageWillUpdating: PAGE },
        async () => {
          await this.doContentSearch();
        }
      )
    }
    if (prevState.page !== this.state.page && !this.state.searchBtnClk) {
      await this.doContentSearch();
    }
  }

  async initSingleContentListPage() {
    await this.setCollectionTypeState();
    this.shouldShowEtSaveBtn('hidden');
    const parsedData = parseData(this.props.collType);
    if (parsedData) {
      this.setState({ selectedCollectionType: parsedData });
      await this.getContentsByCollectionType(parsedData[0].value, this.state.page, this.state.pageSize);
    }
  }

  shouldShowEtSaveBtn = (btnVisibility) => {
    for (let el of document.getElementsByClassName('pull-right save btn btn-primary')) {
      el.style.visibility = btnVisibility;
    }
  }

  async doContentSearch() {
    if (this.searchByKey && this.state.searchQuery) {
      const searchResult = await filterContentsByName(
        this.state.selectedCollectionType[0].value,
        this.state.searchQuery, this.searchByKey, this.state.page, this.state.pageSize
      );
      this.handleStateOnTermSearch(searchResult);
    } else {
      await this.getContentsByCollectionType(this.state.selectedCollectionType[0].value, !this.state.page ? PAGE : this.state.page, this.state.pageSize);
    }
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
      this.setState({ show: true, contentDetailsOnModal: content,  contentIdForModal: content && content.id, activeTabKey: 0 })
  }

  close = () => {
    this.setState({ show: false })
  }

  setActiveTabKey = (value) => {
    this.setState({activeTabKey: value})
  }

  handleCollectionTypeChange = async (collectionType) => {
    this.searchByKey = '';
    this.setState({ contents: [], selectedContent: {} });
    const collType = collectionType[0]
    this.setState({ selectedCollectionType: collectionType })
    if (collType && collType.value) {
      await this.getContentsByCollectionType(collType.value)
      this.props.setSelectedContentName(collType.value)
    } else {
      this.props.setSelectedContentName(null);
    }
    this.setState({ contentIdForModal: undefined, currPageWillUpdating: PAGE });
  }

  getContentsByCollectionType = async (collectionType, page, pageSize) => {
    this.setState({ loadingData: true });
    const contentData = await getContents(collectionType, page, pageSize);
    if (this.props.collType && parseData(this.props.collType)[0].value === this.props.selectedContentName) {
      const seletedContentData = (contentData && contentData.results) && contentData.results.find(content => {
        if (+content.id === +this.props.selectedContentId) return content
      });
      if (this.props.selectedContentId) {
        this.setState({selectedContent: seletedContentData})
      }
    }
    this.setState({
      contents: contentData.results,
      lastPage: contentData.pagination.pageCount ? contentData.pagination.pageCount : 1,
      page: contentData.results.length ? contentData.pagination.page : 1,
      currPageWillUpdating: contentData.results.length ? contentData.pagination.page : 1,
      pageSize: contentData.pagination.pageSize,
      totalItems: contentData.pagination.total,
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
      className="toggle-button"
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
    if (this.state.searchQuery) {
      this.setState({ loadingData: true });
      const searchResult = await filterContentsByName(
        this.state.selectedCollectionType[0].value,
        this.state.searchQuery, this.searchByKey, PAGE, PAGESIZE
      );
      this.handleStateOnTermSearch(searchResult);
    } else {
      this.getContentsByCollectionType(this.state.selectedCollectionType[0].value)
    }
  }

  handleQueryChange = (e) => {
    e.preventDefault();
    this.setState({ searchQuery: e.target.value })
  }

  onPerPageSelect = (pageSize) => {
    this.setState({ searchBtnClk: false });
    this.setState({pageSize})
  }

  onPageInput = e => {
    this.setState({ currPageWillUpdating: e.target.value, searchBtnClk: false })
  }

  onSubmit = () => {
    if (+this.state.currPageWillUpdating && this.state.currPageWillUpdating <= this.state.lastPage) {
      this.setState({ page: +this.state.currPageWillUpdating })
    }
  };

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

  radioButton = (content) => {
    if (this.state.selectedContent && this.state.selectedContent.id) {
      if (this.props.collType.length) {
        return (<input onChange={() => {
          this.setState({ selectedContent: content })
        }}
          type="radio" id={content.id} name="content" value={content.id}
          defaultChecked={this.state.selectedContent.id === content.id && parseData(this.props.collType)[0].value === this.props.selectedContentName}
        />)
      }
      return (<input onChange={() => {
        this.setState({ selectedContent: content })
      }}
        type="radio" id={content.id} name="content" value={content.id}
        defaultChecked={this.state.selectedContent.id === content.id}
      />)
    } else {
      return (<input onChange={() => {
        this.setState({ selectedContent: content })
      }}
        type="radio" id={content + content.id} name="content" value={content.id}
      />)
    }
  };

  onPageNavigation = changePageValue => {this.setState({ searchBtnClk: false }); this.changePage(changePageValue)}

  handleStateOnTermSearch(searchResult) {
    this.setState({
      contents: searchResult.results,
      lastPage: searchResult.pagination.pageCount ? searchResult.pagination.pageCount : 1,
      page: searchResult.results.length ? searchResult.pagination.page : 1,
      currPageWillUpdating: searchResult.results.length ? searchResult.pagination.page : 1,
      pageSize: searchResult.pagination.pageSize,
      totalItems: searchResult.pagination.total,
      searchBtnClk: true,
      loadingData: false
    });
  }

  saveHandler = () => {
    this.props.setContent([this.state.selectedContent]);
    this.props.setCollectionType(this.state.selectedCollectionType);
    this.props.setTemplateId('default');
  }

  cancelHandler = () => {this.props.collType.length && this.props.setSelectedContentName(parseData(this.props.collType)[0].value)}

  render() {
    const pagination = {
      page: this.state.page,
      perPage: this.state.pageSize,
      perPageOptions: PERPAGEOPTIONS,
    };
    const itemsStart = this.state.totalItems === 0 ? 0 : ((this.state.page - 1) * this.state.pageSize) + 1;
    const itemsEnd = Math.min(this.state.page * this.state.pageSize, this.state.totalItems);
    let saveConfigBtn = true;
    if (this.state.selectedContent && Object.keys(this.state.selectedContent).length) {
      saveConfigBtn = false;
    } else if (this.props.collType && parseData(this.props.collType)[0].value === this.props.selectedContentName) {
      saveConfigBtn = false;
    }
    return (
      <Grid>
        <Row className="mt-2">
          <Col lg={12}>
            <legend>
            <FormattedMessage id="app.selectContent" />
            </legend>
          </Col>
        </Row>
        <Row className="mt-2">
          <Col lg={3}>
            <h6><b>{SELECT_COLLECTION_TYPE}</b></h6>
          </Col>
        </Row>
        <Row>
          <Col lg={3}>
            <Typeahead
              id="collectionTypeDropdown"
              placeholder={this.props.intl.formatMessage({ id: "app.chooseAnOption" })}
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
                <h5 style={{ marginBottom: "0px" }}><strong>{this.state.selectedCollectionType && this.state.selectedCollectionType[0] && this.state.selectedCollectionType[0].label}</strong></h5>
              </Col>
            </Row>
            <Row>
              <Col lg={12}>
                <div
                  className="scw-ContentsFilter well"
                  role="button"
                  tabIndex={0}
                  style={{ margin: '1rem 0rem' }}
                >
                  <form>
                    <div className="form">
                      <button
                        id="dropdown-example"
                        role="button"
                        aria-haspopup="true"
                        aria-expanded="false"
                        type="button"
                        className="dropdown-toggle btn btn-default">{NAME}</button>
                      <input
                        type="search"
                        name="name"
                        onChange={this.handleQueryChange}
                        role="combobox"
                        className="rbt-input-main form-control rbt-input"
                       placeholder={this.props.intl.formatMessage({ id: "app.result" })}
                      />
                    </div>
                    <div className="pull-right mbt10" style={{ margin: "0 0 10px 0" }} >
                      <button className="btn btn-primary" onClick={this.onContentSearch}><FormattedMessage id="app.search" /></button>
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
                              {this.radioButton(content)}
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
                    onFirstPage={() => { this.setState({ searchBtnClk: false }); this.onPageNavigation(1) }}
                    onPreviousPage={() => { this.setState({ searchBtnClk: false }); this.onPageNavigation(this.state.page - 1) }}
                    onPageInput={this.onPageInput}
                    onNextPage={() => { this.setState({ searchBtnClk: false }); this.onPageNavigation(this.state.page + 1) }}
                    onLastPage={() => { this.setState({ searchBtnClk: false }); this.onPageNavigation(this.state.lastPage) }}
                    onSubmit={this.onSubmit}
                    messages={PAGINATION_MESSAGES(this.props)}
                  />
                </>}
              </Col>
            </Row>
            <Row className="scw-SingleContentConfigFormBody__addButtons row">
              <Col sm={9}>
              </Col>
              <Col sm={3} className="scw-SingleContentConfigFormBody__addButtons">
                <Link to="/">
                  <button className="btn-default btn" onClick={this.cancelHandler}><FormattedMessage id="app.cancel" /></button>
                  <button className="btn-primary btn scw-AddContentTypeFormBody__save--btn" onClick={this.saveHandler} disabled={saveConfigBtn}><FormattedMessage id="app.save" /></button>
                </Link>
              </Col>
            </Row>
          </>
        }
        <ContentDetailModal show={this.state.show} onHide={this.close} contentDetailsOnModal={this.state.contentDetailsOnModal} contentId={this.state.contentIdForModal} 
          collectionType={this.state.selectedCollectionType && this.state.selectedCollectionType.length && this.state.selectedCollectionType[0].value}
          fetchTitleOrName={this.fetchTitleOrName} activeTabKey={this.state.activeTabKey} setActiveTabKey={this.setActiveTabKey}/>
      </Grid>
    )
  }
}

export default injectIntl(SingleContentList);   