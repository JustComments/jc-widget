const BASE_URL = `${PROTO}://${ENDPOINT}`;

function getUserLocale() {
  try {
    return window.navigator.language;
  } catch (err) {
    return 'en_US';
  }
}

function getUserTimezone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch (err) {
    return 'UTC';
  }
}

export default function saveComment(
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
  const request = new Request(`${BASE_URL}/comments/create?apiKey=${apiKey}`, {
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
  });
  return fetch(request)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText}`);
      }
      return response.json();
    })
    .then((comment) => {
      comment.replyToComment = replyToComment;
      return comment;
    });
}
