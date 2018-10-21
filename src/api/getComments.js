import commentsInThreads from '../utils/commentsInThreads';
import { sortByStrAttr, revSortByStrAttr, keyBy } from '../utils/_';
import { qs } from './utils/qs';
import { fetch } from './utils/fetch';

export function getComments(
  url,
  apiKey,
  itemId,
  { sort, pageSize } = { sort: 'asc', pageSize: 100 },
  lastKey,
) {
  return fetch(
    `${url}?${qs({
      apiKey,
      itemId,
      lastKey: JSON.stringify(lastKey),
      sort,
      pageSize,
      pageUrl: window.location.href,
    })}`,
    { method: 'GET' },
  ).then((json) => {
    return {
      lastKey: json.lastKey,
      comments: buldThreads(json, sort),
    };
  });
}

function buldThreads(json, sort) {
  const comments = json.comments.concat(json.nestedComments);
  return commentsInThreads(buildNestedComments(comments, sort), sort);
}

function buildNestedComments(comments, sort) {
  const sortKey = 'createdAt';
  const sortedComments =
    sort === 'asc'
      ? sortByStrAttr(comments, sortKey)
      : revSortByStrAttr(comments, sortKey);
  const byId = keyBy(sortedComments, 'commentId');
  return sortedComments.map((c) => {
    if (c.replyTo) {
      c.replyToComment = byId[c.replyTo];
    }
    if (c.nestedComments) {
      c.nestedCommentsContent = c.nestedComments.map((id) => byId[id]);
    }
    return c;
  });
}
