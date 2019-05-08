import { Base64 } from 'js-base64';
import scrollparent from 'scrollparent';
import jwtDecode from 'jwt-decode';

export function buildURL(itemId, commentId) {
  return `//${itemId}#jc${commentId}`;
}

export function createGuestJWT(username, email, apiKey) {
  var data = {
    apiKey,
    userId: 'guest',
    userPic: null,
    userUrl: null,
    userEmail: email,
    username,
  };
  return `jcGuest123===${Base64.encode(JSON.stringify(data))}`;
}

function rewritePath(path) {
  if (path.trim() === '') {
    return '';
  }
  if (path === '/') {
    return '';
  }
  return path;
}

function removeCommonParams(urlPart) {
  urlPart = removeURLParameter(urlPart, 'ref');
  urlPart = removeURLParameter(urlPart, 'utm_source');
  urlPart = removeURLParameter(urlPart, 'utm_medium');
  urlPart = removeURLParameter(urlPart, 'utm_campaign');
  urlPart = removeURLParameter(urlPart, 'utm_term');
  urlPart = removeURLParameter(urlPart, 'utm_content');
  return urlPart;
}

function removeURLParameter(url, parameter) {
  //prefer to use l.search if you have a location/link object
  var urlparts = url.split('?');
  if (urlparts.length >= 2) {
    var prefix = encodeURIComponent(parameter) + '=';
    var pars = urlparts[1].split(/[&;]/g);

    //reverse iteration as may be destructive
    for (var i = pars.length; i-- > 0; ) {
      //idiom for string.startsWith
      if (pars[i].lastIndexOf(prefix, 0) !== -1) {
        pars.splice(i, 1);
      }
    }

    url = urlparts[0] + (pars.length > 0 ? '?' + pars.join('&') : '');
    return url;
  } else {
    return url;
  }
}

function getJumpToComment() {
  const hash = window.location.hash;
  const hasHashSign = hash.trim() !== '';
  if (hasHashSign) {
    const isCommentPointer = hash.startsWith('#jc');
    if (isCommentPointer) {
      return hash.substring(3);
    }
  }
  return null;
}

export function extractDataFromURL(ignoreQuery) {
  const href = window.location.href;
  const pathname = window.location.pathname;
  const hostname = window.location.hostname;
  const search = window.location.search;
  const itemPort = window.location.port;
  const itemProtocol = window.location.protocol;
  const rewrittenPath = rewritePath(pathname);
  const itemId = `${hostname}${rewrittenPath}${
    ignoreQuery ? '' : removeCommonParams(search)
  }`;
  const jumpToComment = getJumpToComment();

  return {
    itemId,
    itemProtocol,
    itemPort,
    jumpToComment,
  };
}

export function supportsServiceWorkers() {
  return 'serviceWorker' in navigator;
}

export function findWidgetElement() {
  const widgets = document.getElementsByClassName('just-comments');
  if (widgets.length === 0) {
    console.log(
      'JustComments warning: no elements with className just-comments found.',
    );
    return;
  }
  if (widgets.length > 1) {
    console.log(
      'JustComments warning: more than one element with className just-comments found.',
    );
  }
  return widgets[0];
}

export function handleBootstrapParams() {
  if (!LocalStorage.supported()) {
    return;
  }
  if (LocalStorage.get('jcAuth')) {
    LocalStorage.delete('jcAuth');
    LocalStorage.set('jcOauthToken', getUrlParameter('oauth_token'));
    LocalStorage.set(
      'jcOauthTokenSecret',
      getUrlParameter('oauth_token_secret'),
    );
    LocalStorage.set('jcOauthTokenVerifier', getUrlParameter('oauth_verifier'));
    window.close();
  }
  if (LocalStorage.get('jcPush')) {
    LocalStorage.delete('jcPush');
    LocalStorage.set(
      'jcPushSubscription',
      getUrlParameter('jcPushSubscription'),
    );
    window.close();
  }
}

function getUrlParameter(name) {
  name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
  var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
  var results = regex.exec(location.search);
  return results === null
    ? ''
    : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

export function isBot() {
  return /bot|google|baidu|bing|msn|duckduckgo|teoma|slurp|yandex/i.test(
    navigator.userAgent || '',
  );
}

export function isInViewport(elem) {
  const bounding = elem.getBoundingClientRect();
  return (
    bounding.top >= 0 &&
    bounding.left >= 0 &&
    Math.floor(bounding.bottom) <=
      (window.innerHeight || document.documentElement.clientHeight) &&
    Math.floor(bounding.right) <=
      (window.innerWidth || document.documentElement.clientWidth)
  );
}

let _cache = null;

export class LocalStorage {
  static supported() {
    if (_cache === null) {
      _cache = storageAvailable('localStorage');
    }
    return _cache;
  }

  static get(key) {
    return window.localStorage.getItem(key);
  }

  static set(key, value) {
    window.localStorage.setItem(key, value);
  }

  static delete(key) {
    window.localStorage.removeItem(key);
  }
}

function storageAvailable(type) {
  try {
    var storage = window[type],
      x = '__storage_test__';
    storage.setItem(x, x);
    storage.removeItem(x);
    return true;
  } catch (e) {
    return (
      e instanceof DOMException &&
      // everything except Firefox
      (e.code === 22 ||
        // Firefox
        e.code === 1014 ||
        // test name field too, because code might not be present
        // everything except Firefox
        e.name === 'QuotaExceededError' ||
        // Firefox
        e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
      // acknowledge QuotaExceededError only if there's something already stored
      storage.length !== 0
    );
  }
}

export function onReady(fn) {
  if (
    document.readyState === 'complete' ||
    document.readyState === 'loaded' ||
    document.readyState === 'interactive'
  ) {
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', function(event) {
      fn();
    });
  }
}

export function openPopup(url) {
  open(
    url,
    'share',
    'height=380,width=660,resizable=0,toolbar=0,menubar=0,status=0,location=0,scrollbars=0',
  );
}

export function scrollIntoView(element) {
  try {
    element.scrollIntoView();
  } catch (err) {
    console.log('JustComments warning: ScrollIntoView is not supported', err);
  }
}

export function onceVisible(el, fn) {
  if (isInViewport(el)) {
    fn();
    return;
  }
  const scrollable = scrollparent(el);
  const scrollContainers = !scrollable.parentElement
    ? [window]
    : [window, scrollable];
  const handler = () => {
    if (isInViewport(el)) {
      scrollContainers.forEach((container) => {
        container.removeEventListener('scroll', handler, false);
      });
      fn();
    }
  };
  scrollContainers.forEach((container) => {
    container.addEventListener('scroll', handler, false);
  });
}

export class Session {
  constructor(sessionStorage) {
    this.sessionStorage = sessionStorage;
    this.sessionKey = 'jcSession';
    this.allowedAttributes = [
      'username',
      'userEmail',
      'userId',
      'userPic',
      'userUrl',
      'jwt',
      'loginProvider',
      'website',
      'subscription',
      'notifications',
      'emailNotifications',
    ];
    this.loadSessionData();
  }

  loadSessionData() {
    try {
      const rawData = sessionStorage.getItem(this.sessionKey);
      const data = rawData ? JSON.parse(rawData) : {};
      this.data = Object.keys(data).reduce((acc, key) => {
        if (this.isAllowedAttribute(key)) {
          acc[key] = data[key];
        }
        return acc;
      }, {});
    } catch (err) {
      console.log(
        'JustComments error: error during reading session storage',
        err,
      );
      this.data = {};
    }
  }

  isAllowedAttribute(key) {
    return this.allowedAttributes.indexOf(key) !== -1;
  }

  set(attr, val) {
    if (!this.isAllowedAttribute(attr)) {
      throw new Error(
        'JustComments error: Trying to set unsupported attribute',
      );
    }
    this.data[attr] = val;
    this.saveSessionData();
  }

  setIfMissing(attr, val) {
    if (!this.data[attr]) {
      this.set(attr, val);
    }
  }

  get(attr, defaultValue = '') {
    if (!this.isAllowedAttribute(attr)) {
      throw new Error(
        'JustComments error: trying to get unsupported attribute',
      );
    }
    return this.data[attr] || defaultValue;
  }

  clear() {
    this.data = {};
    this.saveSessionData();
  }

  saveSessionData() {
    try {
      this.sessionStorage.setItem(this.sessionKey, JSON.stringify(this.data));
    } catch (err) {
      console.log(
        'JustComments error: error during writing session storage',
        err,
      );
    }
  }

  clone() {
    return new Session(this.sessionStorage);
  }

  isAuthenticated() {
    return !!this.get('jwt', false);
  }
}

export function getSession() {
  return new Session(window.sessionStorage);
}

export function checkJWTValidity(session) {
  const jwt = session.get('jwt');
  if (jwt) {
    const { exp } = jwtDecode(jwt);
    if (!exp) {
      session.set('jwt', '');
      session.set('loginProvider', '');
      return;
    }
    const now = Math.floor(new Date().getTime() / 1000);
    console.log('JustComments info: jwt is valid for', exp - now, 'seconds');
    if (exp - now < 3600) {
      session.set('jwt', '');
      session.set('loginProvider', '');
      return;
    }
  }
}

export function setJWT(session, jwt, loginProvider) {
  const { userId, userPic, username, userUrl, userEmail } = jwtDecode(jwt);
  session.set('userId', userId);
  session.set('userPic', userPic);
  session.set('username', username);
  session.set('userUrl', userUrl);
  session.set('userEmail', userEmail);
  session.set('jwt', jwt);
  session.setIfMissing('loginProvider', loginProvider);
}

export function substitute(str, keys) {
  return str.replace('%{name}', keys.name);
}

export const copyToClipboard = (str) => {
  const el = document.createElement('textarea');
  el.value = str;
  document.body.appendChild(el);
  el.select();
  document.execCommand('copy');
  document.body.removeChild(el);
};
