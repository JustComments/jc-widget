import { fetch } from './utils/fetch';
import { getUserLocale, getUserTimezone } from './utils/userInfo';

export function saveComment(
  url,
  apiKey,
  itemId,
  originalItemId,
  jwt,
  {
    message,
    website,
    replyToComment,
    parentId,
    captchaResult,
    itemProtocol,
    itemPort,
    subscription,
    emailNotifications,
  }, // comment data
) {
  return fetch(`${url}?apiKey=${apiKey}`, {
    method: 'POST',
    mode: 'cors',
    redirect: 'follow',
    headers: new Headers({
      'Content-Type': 'application/json',
      Authorization: ['Bearer', jwt].join(' '),
      'x-api-key': apiKey,
    }),
    body: JSON.stringify({
      itemId,
      originalItemId,
      itemProtocol,
      itemPort,
      parentId: parentId ? parentId : undefined,
      replyTo: replyToComment ? replyToComment.commentId : undefined,
      captchaResult: captchaResult ? captchaResult : undefined,
      subscription: subscription ? subscription : undefined,
      website: website ? website : undefined,
      message,
      pageUrl: window.location.href || '',
      pageTitle: document.title || '',
      emailNotifications: emailNotifications || false,
      locale: getUserLocale(),
      timezone: getUserTimezone(),
    }),
  }).then((comment) => {
    comment.replyToComment = replyToComment;
    return comment;
  });
}
