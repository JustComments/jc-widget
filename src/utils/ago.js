import timeago_en from 'timeago.js/locales/en';
import TIMEAGO_LOCALE from 'TIMEAGO_LOCALE';
import timeago from 'timeago.js';

timeago.register('TIMEAGO_LOCALE', TIMEAGO_LOCALE);

const origFormat = timeago().format;

export default function format(date) {
  return String(origFormat(date, 'TIMEAGO_LOCALE'));
}
