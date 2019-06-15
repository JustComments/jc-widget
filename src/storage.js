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
