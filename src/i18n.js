import timeagoLocale from 'TIMEAGO_LOCALE_MODULE';
import bundleLocale from 'BUNDLE_LOCALE_MODULE';

import timeago from 'timeago.js';

timeago.register('locale', timeagoLocale);
const ago = timeago();

export function formatDate(date) {
  return ago.format(date, 'locale');
}

export function __(key, customLocale) {
  if (customLocale && key in customLocale) {
    return customLocale[key];
  }
  return bundleLocale[key] || key;
}

export function substitute(str, keys) {
  Object.keys(keys).forEach((key) => {
    str = str.replace(`%{${key}}`, keys[key]);
  });
  return str;
}
