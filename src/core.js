import './auth';

import { h, render, Component } from 'preact';
import extractDataFromURL from './utils/extractDataFromURL';
import { Widget } from './components/Widget';
import { getComments } from './api/getComments';
import { saveComment } from './api/saveComment';
import { twitterCallback } from './api/twitterCallback';
import { twitterRedirect } from './api/twitterRedirect';
import scrollparent from 'scrollparent';
import isBot from './utils/isBot';
import { get as getSession, checkJWTValidity, setJWT } from './utils/session';
import isInViewport from './utils/isInViewport';
import { onReady } from './utils/onReady';
import { findWidgetElement } from './utils/findWidgetElement';
import { bootstrapRecaptcha } from './components/Recaptcha';
import { onceVisible } from './utils/scroll';

const BASE_URL = API_ENDPOINT;

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
    data.ignoreQuery,
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
  } else {
    if (session.get('jwt')) {
      checkJWTValidity(session);
    } else {
      session.setIfMissing('userId', 'guest');
      session.setIfMissing('userPic', null);
      session.setIfMissing('username', '');
      session.setIfMissing('userUrl', '');
      session.setIfMissing('userEmail', '');
      session.setIfMissing('website', '');
    }
  }

  const api = buildApi(
    data.apiKey,
    effectiveItemId,
    itemId,
    data.pageSize,
    data.sort,
    fetchData,
  );
  const subscription = null;

  return render(
    h(Widget, {
      getComments: api.getComments,
      saveComment: api.saveComment,
      twitterCallback: api.twitterCallback,
      twitterRedirect: api.twitterRedirect,
      subscription,
      jumpToComment,
      session,
      itemProtocol: itemProtocol,
      itemPort: itemPort,
      recaptchaSitekey: data.recaptchaSitekey,
      allowGuests: data.allowGuests,
      disableSocialLogin: data.disableSocialLogin,
      disableLoadMore: data.disableLoadMore,
      sort: data.sort,
      hideAttribution: data.hideAttribution,
      enableWebsite: data.enableWebsite,
      enableEmailNotifications: data.enableEmailNotifications,
      theme: data.theme,
      apiKey: data.apiKey,
      disableProfilePictures: data.disableProfilePictures,
    }),
    widget,
  );
}

function buildApi(
  apiKey,
  effectiveItemId,
  originalItemId,
  pageSize,
  sort,
  fetchData,
) {
  const boundGetComments = fetchData
    ? getComments.bind(
        null,
        `${BASE_URL}/comments/find`,
        apiKey,
        effectiveItemId,
        {
          pageSize: pageSize,
          sort: sort,
        },
      )
    : () => Promise.resolve({ comments: [] });
  const boundSaveComment = saveComment.bind(
    null,
    `${BASE_URL}/comments/create`,
    apiKey,
    effectiveItemId,
    originalItemId,
  );
  const boundTwitterCallback = twitterCallback.bind(
    null,
    `${BASE_URL}/auth/twitter/callback`,
    apiKey,
    effectiveItemId,
  );
  const boundTwitterRedirect = twitterRedirect.bind(
    null,
    TWITTER_URL,
    apiKey,
    effectiveItemId,
  );

  return {
    getComments: boundGetComments,
    saveComment: boundSaveComment,
    twitterCallback: boundTwitterCallback,
    twitterRedirect: boundTwitterRedirect,
  };
}

function readWidgetData(widget) {
  const jwt = widget.dataset.jwt;
  const apiKey = widget.dataset.apikey;
  const allowGuests = widget.dataset.allowguests !== 'false';
  const disableSocialLogin = widget.dataset.disablesociallogin === 'true';
  const disableLoadMore = widget.dataset.disableloadmore === 'true';
  const disableProfilePictures =
    widget.dataset.disableprofilepictures === 'true';
  const ignoreQuery = widget.dataset.ignorequery === 'true';
  const hideAttribution = widget.dataset.hideattribution === 'true';
  const enableWebsite = widget.dataset.enablewebsite === 'true';
  const enableEmailNotifications =
    widget.dataset.enableemailnotifications === 'true';
  const recaptchaSitekey =
    widget.dataset.recaptcha === 'true'
      ? '6Lc9nTEUAAAAABlX72vOhEVdBUX_ULUY88e7Chkl'
      : undefined;
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
  const theme = widget.dataset.theme || 'default';
  return {
    jwt,
    apiKey,
    allowGuests,
    disableSocialLogin,
    disableLoadMore,
    ignoreQuery,
    hideAttribution,
    enableWebsite,
    enableEmailNotifications,
    pageSize,
    sort,
    pageId,
    recaptchaSitekey,
    theme,
    disableProfilePictures,
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
