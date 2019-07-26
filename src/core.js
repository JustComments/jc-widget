import { Provider } from 'redux-zero/preact';
import createStore from 'redux-zero';
import { h, render, Component } from 'preact';

import './auth';
import { getSession, checkJWTValidity, setJWT } from './utils';
import {
  getPageData,
  isBot,
  onReady,
  findWidgetElement,
  onceVisible,
} from './bootstrap';
import Widget from './widget';
import { API } from './api';
import { bootstrapRecaptcha } from './recaptcha';
import { LocalStorage } from './storage';
import { createForm } from './actions';

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

  if (data.recaptchaSitekey) {
    bootstrapRecaptcha();
  }

  const itemId = data.itemId;
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

  const initialState = {
    api,
    comments: [],
    cursor: null,
    jumped: false,
    jumpToComment: data.jumpToComment,
    loading: false,
    session,
    subscription: null,
    forms: [createForm(session), createForm(session)],
    config: {
      ...data,
      localStorageSupported: LocalStorage.supported(),
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
  const d = widget.dataset;
  return {
    apiKey: d.apikey,
    defaultUserPicUrl: d.defaultuserpicurl,
    disableAnonymousLogin: bstr(d.disableanonymouslogin),
    disableLoadMore: bstr(d.disableloadmore),
    disableProfilePictures: bstr(d.disableprofilepictures),
    disablePushNotifications: bstr(d.disablepushnotifications),
    disableReactions: bstr(d.disablereactions),
    disableShareButton: bstr(d.disablesharebutton),
    disableSocialLogin: bstr(d.disablesociallogin),
    enableEmailNotifications: bstr(d.enableemailnotifications),
    enableWebsite: bstr(d.enablewebsite),
    hideAttribution: bstr(d.hideattribution),
    hideCommentHeader: bstr(d.hidecommentheader),
    hideNoCommentsText: bstr(d.hidenocommentstext),
    jwt: d.jwt,
    pageId: d.pageid,
    pageSize: validate(d.pagesize, toInt, invalidPageSize, 100),
    recaptchaSitekey: bstr(d.recaptcha) && RECAPTCHA_KEY,
    sort: validate(d.sort, (v) => v, invalidSort, 'asc'),
    ...getPageData(bstr(d.usequery)),
  };
}

function invalidPageSize(v) {
  return v <= 0 || v > 100;
}

function invalidSort(v) {
  return ['asc', 'desc', 'top'].indexOf(v) === -1;
}

function toInt(v) {
  return parseInt(v, 10);
}

function bstr(val) {
  return val === 'true';
}

function validate(v, conv, valid, defaultValue) {
  if (!v) {
    return defaultValue;
  }
  const result = conv(v);
  if (valid(result)) {
    return defaultValue;
  }
  return result;
}

function initWidget() {
  const widget = findWidgetElement();
  if (!widget) {
    return;
  }
  if (isBot()) {
    // if it's a SE bot and not disabled via config
    // render immediately
    renderWidget(widget, {
      fetchData: !bstr(widget.dataset.disableseo),
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
