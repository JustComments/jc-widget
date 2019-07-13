import './auth';

import { Provider } from 'redux-zero/preact';
import createStore from 'redux-zero';
import { h, render, Component } from 'preact';

import { getSession, checkJWTValidity, setJWT } from './utils';
import {
  extractDataFromURL,
  isBot,
  onReady,
  findWidgetElement,
  onceVisible,
} from './bootstrap';
import Widget from './widget';
import { API } from './api';
import { bootstrapRecaptcha } from './recaptcha';
import { LocalStorage } from './storage';
import { getUserPic } from './actions';

export function renderWidget(
  widget,
  { fetchData } = {
    fetchData: true,
  },
) {
  if (widget.dataset.rendered === 'true') {
    return;
  }
  widget.dataset.rendered = 'true';

  const data = readWidgetData(widget);

  const { itemId, jumpToComment, itemProtocol, itemPort } = extractDataFromURL(
    data.usequery,
  );

  if (data.recaptchaSitekey) {
    bootstrapRecaptcha();
  }

  const effectiveItemId = data.pageId ? data.pageId : itemId;

  console.log('JustComments info: pageId that will be used', effectiveItemId);
  console.log('JustComments info: original pageId', itemId);

  const session = getSession();

  if (data.jwt) {
    setJWT(session, data.jwt);
  } else if (session.get('jwt')) {
    checkJWTValidity(session);
  }

  const api = new API({
    apiKey: data.apiKey,
    pageSize: data.pageSize,
    sort: data.sort,
    effectiveItemId,
    itemId,
    fetchData,
  });

  const email = session.get('userEmail');

  const initialState = {
    api,
    comments: [],
    cursor: null,
    jumped: false,
    jumpToComment,
    loading: false,
    session,
    subscription: null,
    form: {
      dirty: false,
      email,
      errors: {},
      loginProvider: session.get('loginProvider'),
      previewLoading: false,
      pushNotifications: !!session.get('subscription'),
      username: session.get('username'),
      userPic: session.get('userPic') || (email && getUserPic(email)),
      userUrl: session.get('userUrl'),
      website: session.get('userUrl'),
    },
    config: {
      apiKey: data.apiKey,
      defaultUserPicUrl: data.defaultUserPicUrl,
      disableAnonymousLogin: data.disableAnonymousLogin,
      disableLoadMore: data.disableLoadMore,
      disableProfilePictures: data.disableProfilePictures,
      disableShareButton: data.disableShareButton,
      disableSocialLogin: data.disableSocialLogin,
      disablePushNotifications: data.disablePushNotifications,
      enableEmailNotifications: data.enableEmailNotifications,
      enableWebsite: data.enableWebsite,
      hideAttribution: data.hideAttribution,
      hideCommentHeader: data.hideCommentHeader,
      hideNoCommentsText: data.hideNoCommentsText,
      itemPort,
      itemProtocol,
      localStorageSupported: LocalStorage.supported(),
      recaptchaSitekey: data.recaptchaSitekey,
      sort: data.sort,
    },
  };

  const store = createStore(initialState);

  return render(
    <Provider store={store}>
      <Widget />
    </Provider>,
    widget,
  );
}

function readWidgetData(widget) {
  const jwt = widget.dataset.jwt;
  const apiKey = widget.dataset.apikey;
  const disableAnonymousLogin = widget.dataset.disableanonymouslogin === 'true';
  const disableSocialLogin = widget.dataset.disablesociallogin === 'true';
  const disableLoadMore = widget.dataset.disableloadmore === 'true';
  const disableProfilePictures =
    widget.dataset.disableprofilepictures === 'true';
  const disableShareButton = widget.dataset.disablesharebutton === 'true';
  const usequery = widget.dataset.usequery === 'true';
  const hideAttribution = widget.dataset.hideattribution === 'true';
  const enableWebsite = widget.dataset.enablewebsite === 'true';
  const hideCommentHeader = widget.dataset.hidecommentheader === 'true';
  const hideNoCommentsText = widget.dataset.hidenocommentstext === 'true';
  const enableEmailNotifications =
    widget.dataset.enableemailnotifications === 'true';
  const disablePushNotifications =
    widget.dataset.disablepushnotifications === 'true';
  const recaptchaSitekey =
    widget.dataset.recaptcha === 'true'
      ? '6Lc9nTEUAAAAABlX72vOhEVdBUX_ULUY88e7Chkl'
      : undefined;
  const defaultUserPicUrl = widget.dataset.defaultuserpicurl;
  let pageSize = widget.dataset.pagesize
    ? parseInt(widget.dataset.pagesize, 10)
    : 100;

  if (pageSize <= 0 || pageSize > 100) {
    pageSize = 100;
  }

  let sort = widget.dataset.sort ? widget.dataset.sort : 'asc';

  if (sort !== 'asc' && sort !== 'desc') {
    sort = 'asc';
  }

  const pageId = widget.dataset.pageid;
  return {
    apiKey,
    defaultUserPicUrl,
    disableAnonymousLogin,
    disableLoadMore,
    disableProfilePictures,
    disablePushNotifications,
    disableShareButton,
    disableSocialLogin,
    enableEmailNotifications,
    enableWebsite,
    hideAttribution,
    hideCommentHeader,
    hideNoCommentsText,
    jwt,
    pageId,
    pageSize,
    recaptchaSitekey,
    sort,
    usequery,
  };
}

function initWidget() {
  const widget = findWidgetElement();
  if (!widget) {
    return;
  }

  const disableseo = widget.dataset.disableseo === 'true';
  if (isBot()) {
    // if it's a SE bot and not disabled via config
    // render immediately
    renderWidget(widget, {
      fetchData: !disableseo,
    });
  } else {
    onceVisible(widget, () => {
      renderWidget(widget, {
        fetchData: true,
      });
    });
  }
}

onReady(() => initWidget());
