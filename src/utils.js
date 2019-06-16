import { Base64 } from 'js-base64';
import jwtDecode from 'jwt-decode';
import { LocalStorage } from './storage';

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

export function supportsServiceWorkers() {
  return 'serviceWorker' in navigator;
}

export function openPopup(url) {
  open(
    url,
    'share',
    'height=380,width=660,resizable=0,toolbar=0,menubar=0,status=0,location=0,scrollbars=0',
  );
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
  Object.keys(keys).forEach((key) => {
    str = str.replace(`%{${key}}`, keys[key]);
  });
  return str;
}

export const copyToClipboard = (str) => {
  const el = document.createElement('textarea');
  el.value = str;
  document.body.appendChild(el);
  el.select();
  document.execCommand('copy');
  document.body.removeChild(el);
};
