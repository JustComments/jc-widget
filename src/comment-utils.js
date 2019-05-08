import locale from 'TIMEAGO_LOCALE';
import timeago from 'timeago.js';

timeago.register('locale', locale);

const ago = timeago();

export function getCommentDate(comment) {
  return ago.format(comment.createdAt, 'locale');
}

export function getCommentUrl(comment) {
  const currentHostname = window.location.hostname;
  const currentPathname = window.location.pathname;
  const currentSearch = window.location.currentSearch || '';

  const commentUrl = comment.commentUrl;
  if (
    commentUrl.indexOf(currentHostname) !== -1 &&
    commentUrl.indexOf(currentPathname) !== -1 &&
    commentUrl.indexOf(currentSearch) !== -1
  ) {
    return commentUrl;
  }

  const url = document.createElement('a');
  url.href = window.location.toString();
  url.hash = '#jc' + comment.commentId;
  return url.toString();
}
