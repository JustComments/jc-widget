import { LocalStorage } from './storage';

const BASE_URL = API_ENDPOINT;

export class API {
  /**
    apiKey: string
    effectiveItemId: string
    itemId: string
    pageSize: number
    sort: 'asc' | 'desc'
    fetchData: boolean
  */
  constructor(opts) {
    this.opts = opts;
  }

  twitterRedirect(callbackUrl) {
    return `${TWITTER_URL}#${qs({
      apiKey: this.opts.apiKey,
      callbackUrl: callbackUrl,
      itemId: this.opts.effectiveItemId,
    })}`;
  }

  facebookRedirect(callbackUrl) {
    return `${FB_URL}#${qs({
      apiKey: this.opts.apiKey,
      callbackUrl: callbackUrl,
      itemId: this.opts.effectiveItemId,
    })}`;
  }

  authPopup(redirectUrl) {
    const { promise, resolve } = openPopup(redirectUrl);
    LocalStorage.set('jcAuth', true);
    listenFor('jcOauthToken', (jwt) => resolve(jwt));
    return promise;
  }

  pushPopup() {
    const { promise, resolve } = openPopup(
      `${PUSH_URL}#${enc(window.location.href)}`,
    );
    LocalStorage.set('jcPush', true);
    listenFor('jcPushSubscription', (jcPushSubscription) => {
      LocalStorage.delete('jcPushSubscription');
      return resolve(jcPushSubscription);
    });
    return promise;
  }

  getComments(cursor, sort) {
    return fetch(
      `/v2/comments?${qs({
        lastKey: cursor,
        pageUrl: window.location.href,
        apiKey: this.opts.apiKey,
        pageId: this.opts.effectiveItemId,
        sort: sort,
        pageSize: this.opts.pageSize,
      })}`,
      { method: 'GET' },
    ).then((json) => ({
      comments: json.comments,
      cursor: json.lastKey,
    }));
  }

  saveComment(jwt, c) {
    return fetch(`/comments/create?apiKey=${this.opts.apiKey}`, {
      method: 'POST',
      mode: 'cors',
      headers: headers({
        Authorization: ['Bearer', jwt].join(' '),
        'x-api-key': this.opts.apiKey,
      }),
      body: toJson({
        itemId: this.opts.effectiveItemId,
        originalItemId: this.opts.itemId,
        itemProtocol: c.itemProtocol,
        itemPort: c.itemPort,
        parentId: defaults(c.parentId, undefined),
        replyTo: defaults(
          c.replyToComment && c.replyToComment.commentId,
          undefined,
        ),
        captchaResult: defaults(c.captchaResult, undefined),
        subscription: defaults(c.subscription, undefined),
        website: defaults(c.website, undefined),
        message: c.message,
        pageUrl: defaults(window.location.href, ''),
        pageTitle: defaults(document.title, ''),
        emailNotifications: defaults(c.emailNotifications, false),
        locale: getUserLocale(),
        timezone: getUserTimezone(),
        loginProvider: c.loginProvider,
      }),
    }).then((comment) => ({
      ...comment,
      htmlContent: comment.htmlMessage,
    }));
  }

  previewComment(jwt, comment) {
    return fetch(`/comments/preview?apiKey=${this.opts.apiKey}`, {
      method: 'POST',
      mode: 'cors',
      headers: headers({
        Authorization: ['Bearer', jwt].join(' '),
        'x-api-key': this.opts.apiKey,
      }),
      body: toJson({
        message: comment.message,
      }),
    }).then((c) => ({
      ...c,
      htmlContent: c.htmlMessage,
    }));
  }

  createReaction(commentId, reactionId, captchaResult) {
    return fetch(`/reactions?apiKey=${this.opts.apiKey}`, {
      method: 'POST',
      mode: 'cors',
      headers: headers({}),
      body: toJson({
        commentId,
        reactionId,
        itemId: this.opts.effectiveItemId,
        captchaResult: defaults(captchaResult, undefined),
      }),
    });
  }
}

function defaults(val, defaultVal) {
  if (val) {
    return val;
  }
  return defaultVal;
}

function headers(values) {
  return new Headers({
    ...values,
    'Content-Type': 'application/json',
  });
}

function toJson(obj) {
  return JSON.stringify(obj);
}

function qs(p) {
  return Object.keys(p)
    .map((k) => `${enc(k)}=${enc(p[k])}`)
    .join('&');
}

function fetch(url, params) {
  const request = new Request(BASE_URL + url, params);
  return window
    .fetch(request)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText}`);
      }
      return response.json();
    })
    .catch((err) => {
      console.error(
        'Failed to perform a network request. Check that your have enough credits on your account.',
        err,
      );
      throw err;
    });
}

function enc(uri) {
  return encodeURIComponent(uri);
}

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

function openPopup(url) {
  const popup = window.open(
    '',
    '_blank',
    'location=yes,height=600,width=800,scrollbars=yes,status=yes',
  );
  let resolve;
  const promise = new Promise((r) => {
    resolve = r;
  });
  popup.location.href = url;
  popup.focus();
  return { promise, resolve };
}

function listenFor(key, cb) {
  const handler = (e) => {
    if (e.key === key && e.newValue) {
      window.removeEventListener('storage', handler);
      cb(e.newValue);
    }
  };
  window.addEventListener('storage', handler);
}
