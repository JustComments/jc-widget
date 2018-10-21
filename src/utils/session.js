import { LocalStorage } from './localStorage';
import jwtDecode from 'jwt-decode';
import createGuestJWT from './createGuestJWT';

let _cache = null;

const attrs = [
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

class Session {
  load() {
    if (LocalStorage.supported()) {
      attrs.forEach((attr) => {
        this[attr] = LocalStorage.get(`jc_${attr}`);
        if (this[attr] === 'false') {
          this[attr] = false;
        }
        if (this[attr] === 'true') {
          this[attr] = true;
        }
      });
      this.checkJWTValidity();
      this.checkUserPic();
    }
  }

  checkJWTValidity() {
    if (this.jwt) {
      const { exp } = jwtDecode(this.jwt);
      if (!exp) {
        this.set('jwt', '');
        this.set('loginProvider', '');
        return;
      }
      const now = Math.floor(new Date().getTime() / 1000);
      console.log('jwt is valid for', exp - now, 'seconds');
      if (exp - now < 3600) {
        this.set('jwt', '');
        this.set('loginProvider', '');
        return;
      }
    }
  }

  checkUserPic() {
    if (this.userPic) {
      if (!!!this.userPic) {
        this.userPic = null;
      }
      if (this.userPic === 'https://just-comments.com/widget/no-pic.png') {
        this.userPic = null;
      }
    }
  }

  clear() {
    attrs.forEach((attr) => {
      this.set(attr, '');
    });
  }

  set(attr, val) {
    this[attr] = val;
    LocalStorage.set('jc_' + attr, val);
  }

  setIfMissing(attr, val) {
    if (!this[attr]) {
      this[attr] = val;
      LocalStorage.set('jc_' + attr, val);
    }
  }

  get(attr, defaultValue = '') {
    return this[attr] || defaultValue;
  }

  isAuthorized() {
    return !!this.jwt;
  }

  setJWT(jwt, loginProvider) {
    const { userId, userPic, username, userUrl, userEmail } = jwtDecode(jwt);
    this.set('userId', userId);
    this.set('userPic', userPic);
    this.set('username', username);
    this.set('userUrl', userUrl);
    this.set('userEmail', userEmail);
    this.set('jwt', jwt);
    this.set('loginProvider', loginProvider);
  }

  getJWT() {
    if (!this.jwt) {
      return createGuestJWT(this.username, this.userEmail, this.apiKey);
    } else {
      return this.jwt;
    }
  }

  static get() {
    if (!_cache) {
      _cache = new Session();
      _cache.load();
    }
    return _cache;
  }

  clone() {
    const t = new Session();
    attrs.forEach((attr) => {
      t[attr] = this[attr];
    });
    return t;
  }
}

export default Session;
