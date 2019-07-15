import { formatDate } from './i18n';
import { reactions } from './actions';

export function getHumanReadableCommentTimestamp(comment) {
  return formatDate(comment.createdAt);
}

export function getCommentTimestamp(comment) {
  return new Date(comment.createdAt).toLocaleString();
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

export function getTopReactions(comment) {
  if (!comment.reactions) {
    return [];
  }

  const reactions = Object.keys(comment.reactions).map((id) => ({
    id: id,
    value: comment.reactions[id],
  }));

  reactions.sort((a, b) => {
    return b.value - a.value;
  });

  return reactions.slice(0, 3);
}
