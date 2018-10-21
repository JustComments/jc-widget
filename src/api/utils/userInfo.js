export function getUserLocale() {
  try {
    return window.navigator.language;
  } catch (err) {
    return 'en_US';
  }
}

export function getUserTimezone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch (err) {
    return 'UTC';
  }
}
