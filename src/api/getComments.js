import { qs } from './utils/qs';
import { fetch } from './utils/fetch';
import { CommentCollection } from '../models/CommentCollection';
import { Comment } from '../models/Comment';

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
    const comments = json.comments
      .concat(json.nestedComments)
      .map((raw) => new Comment(raw));
    return new CommentCollection(comments, json.lastKey, sort);
  });
}
