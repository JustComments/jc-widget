export default function getCommentUrl(comment) {
  const currentHostname = window.location.hostname;
  const currentPathname = window.location.pathname;
  const currentSearch = window.location.currentSearch;

  const commentUrl = comment.commentUrl;
  if (
    commentUrl.indexOf(currentHostname) !== -1 &&
    commentUrl.indexOf(currentPathname) !== -1 &&
    commentUrl.indexOf(currentSearch ? currentSearch : '') !== -1
  ) {
    return commentUrl;
  }

  var url = document.createElement('a');
  url.href = window.location.toString();
  url.hash = '#jc' + comment.commentId;
  return url.toString();
}
