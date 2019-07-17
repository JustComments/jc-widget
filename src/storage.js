export class LocalStorage {
  static supported() {
    return 'localStorage' in window;
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
