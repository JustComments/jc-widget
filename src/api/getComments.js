import commentsInThreads from '../utils/commentsInThreads';
import { sortByStrAttr, revSortByStrAttr, keyBy } from '../utils/_';
import { qs } from './utils/qs';

export default function getComments(
  url,
  apiKey,
  itemId,
  { sort, pageSize } = { sort: 'asc', pageSize: 100 },
  lastKey,
) {
  const request = new Request(
    `${url}?${qs({
      apiKey,
      itemId,
      lastKey: JSON.stringify(lastKey),
      sort,
      pageSize,
      pageUrl: window.location.href,
    })}`,
    { method: 'GET' },
  );
  return fetch(request)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText}`);
      }
      return response.json();
    })
    .then((json) => {
      return {
        lastKey: json.lastKey,
        comments: buldThreads(json, sort),
      };
    })
    .catch((err) => {
      console.error(
        'Failed to load comments. Check that your have enough credits on your account.',
        err,
      );
      throw err;
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
