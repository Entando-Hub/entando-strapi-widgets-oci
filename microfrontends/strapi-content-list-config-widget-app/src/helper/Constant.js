import { locale } from "moment";
import {  FormattedMessage } from "react-intl";

/*********************
 * PAGINATION ********
 *********************/


export const PERPAGEOPTIONS = [5, 10, 15, 25, 50];
export const PAGE = 1;
export const PAGESIZE = 5;
export const TOTALITEMS = 20;
export const LASTPAGE = 4;
export const PAGEINPUT = 1;
export const PAGECHANGEVALUE = 1;

/*********************
 * UI CONSTANT *******
 *********************/
export const SEARCH_CONTENT_BY_NAME = "Search Content By Name...";
export const SELECT_COLLECTION_TYPE = "Select Collection Type"; 

/*********************
 * UI LABEL **********
 *********************/
export const SELECT = <FormattedMessage id='app.select' />
export const NAME = <FormattedMessage id='app.name' />
export const CREATEDBY = <FormattedMessage id='app.created' />
export const LASTEDITED = <FormattedMessage id='app.lastEdited' />
export const CREATEDDATE = <FormattedMessage id='app.createdDate' />
export const T_HEADING = {
    SELECT: SELECT,
    NAME: NAME,
    CREATEDBY: CREATEDBY,
    LASTEDITED: LASTEDITED,
    CREATEDDATE: CREATEDDATE
}

export const BTN_ADD_NEW_CONTENT = <FormattedMessage id='app.addNewContent' />;

/*********************
 * For Strapi API ****
 *********************/
export const KC_TOKEN_PREFIX = 'EntKcToken';

/*********************
 * For Strapi API ****
 *********************/
export const UNIVERSAL_DATE_FORMAT = "YYYY-MM-DD HH:mm:ss"

/*********************
 * For Strapi Images ****
 *********************/

export const STRAPI_IMAGE_EXTENSIONS = ['.JPEG', '.JPG', '.PNG', '.GIF', '.SVG', '.TIFF', '.ICO', '.DVU'];
export const STRAPI_IMAGE_URL_KEY = 'url';
export const STRAPI_IMAGE_HEIGHT = '50px';
export const STRAPI_IMAGE_WIDTH = '50px';
export const STRAPI_EXCLUDE_KEYS =  ["createdAt", "updatedAt", "publishedAt", "createdBy", "updatedBy", "id", "localizations", "locale"];
export const ACCORDION_FONT_SIZE = "13px";
export const NO_DATA_AVAILABLE_MSG = <FormattedMessage id='app.noDataAvailable' />

export const STRAPI_BASE_URL_KEY = 'STRAPI_CONFIG';
export const STRAPI_CONFIG_NOT_AVAIL = 'Strapi configuration not available';
export const STRAPI_CONTENT_MANAGER_URI = '/admin/content-manager';
export const BTN_RELOAD_PAGE = 'Reload Page';
export const STRAPI_CONFIG_WARNING_MSG = "Strapi can't be reached. Please use Strapi Config Widget and configure a correct URL";