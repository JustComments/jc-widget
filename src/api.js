import { LocalStorage } from './utils';

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
    return `${TWITTER_URL}#apiKey=${encodeURIComponent(
      this.opts.apiKey,
    )}&callbackUrl=${encodeURIComponent(
      callbackUrl,
    )}&itemId=${encodeURIComponent(this.opts.effectiveItemId)}`;
  }

  facebookRedirect(callbackUrl) {
    return `${FB_URL}#apiKey=${encodeURIComponent(
      this.opts.apiKey,
    )}&callbackUrl=${encodeURIComponent(
      callbackUrl,
    )}&itemId=${encodeURIComponent(this.opts.effectiveItemId)}`;
  }

  authPopup(redirectUrl) {
    const popup = window.open(
      '',
      '_blank',
      'location=yes,height=600,width=800,scrollbars=yes,status=yes',
    );
    let resolve = undefined;
    const promise = new Promise((r) => {
      resolve = r;
    });

    LocalStorage.set('jcAuth', true);
    const handler = (e) => {
      if (e.key === 'jcOauthTokenVerifier' && e.newValue) {
        const tokenVerifier = e.newValue;
        window.removeEventListener('storage', handler);
        const token = LocalStorage.get('jcOauthToken');
        const tokenSecret = LocalStorage.get('jcOauthTokenSecret');
        this.twitterCallback({
          token,
          tokenSecret,
          tokenVerifier,
        }).then(({ jwt }) => {
          resolve(jwt);
        });
      }
    };
    window.addEventListener('storage', handler);
    popup.location.href = redirectUrl;
    popup.focus();
    return promise;
  }

  authFbPopup(redirectUrl) {
    const popup = window.open(
      '',
      '_blank',
      'location=yes,height=600,width=800,scrollbars=yes,status=yes',
    );
    let resolve = undefined;
    const promise = new Promise((r) => {
      resolve = r;
    });

    LocalStorage.set('jcAuth', true);
    const handler = (e) => {
      if (e.key === 'jcOauthToken' && e.newValue) {
        const tokenVerifier = e.newValue;
        window.removeEventListener('storage', handler);
        const jwt = LocalStorage.get('jcOauthToken');
        resolve(jwt);
      }
    };
    window.addEventListener('storage', handler);
    popup.location.href = redirectUrl;
    popup.focus();
    return promise;
  }

  pushPopup() {
    const popup = window.open(
      '',
      '_blank',
      'location=yes,height=600,width=800,scrollbars=yes,status=yes',
    );
    let resolve = undefined;
    const promise = new Promise((r) => {
      resolve = r;
    });

    LocalStorage.set('jcPush', true);
    const handler = (e) => {
      if (e.key === 'jcPushSubscription' && e.newValue) {
        const jcPushSubscription = e.newValue;
        window.removeEventListener('storage', handler);
        LocalStorage.delete('jcPushSubscription');
        return resolve(jcPushSubscription);
      }
    };
    window.addEventListener('storage', handler);
    popup.location.href = `${PUSH_URL}#${encodeURIComponent(
      window.location.href,
    )}`;
    popup.focus();

    return promise;
  }

  twitterCallback(data) {
    return fetch(
      `${BASE_URL}/auth/twitter/callback?apiKey=${this.opts.apiKey}`,
      {
        method: 'POST',
        mode: 'cors',
        redirect: 'follow',
        headers: new Headers({
          'Content-Type': 'application/json',
          'x-api-key': this.opts.apiKey,
        }),
        body: JSON.stringify({
          itemId: this.opts.effectiveItemId,
          ...data,
        }),
      },
    ).then((json) => {
      const { jwt } = json;
      return {
        jwt,
      };
    });
  }

  getComments(cursor) {
    return fetch(
      `${BASE_URL}/v2/comments?${qs({
        lastKey: cursor,
        pageUrl: window.location.href,
        apiKey: this.opts.apiKey,
        pageId: this.opts.effectiveItemId,
        sort: this.opts.sort,
        pageSize: this.opts.pageSize,
      })}`,
      { method: 'GET' },
    ).then((json) => {
      return {
        comments: json.comments,
        cursor: json.lastKey,
      };
    });
  }

  saveComment(jwt, comment) {
    return fetch(`${BASE_URL}/comments/create?apiKey=${this.opts.apiKey}`, {
      method: 'POST',
      mode: 'cors',
      headers: new Headers({
        'Content-Type': 'application/json',
        Authorization: ['Bearer', jwt].join(' '),
        'x-api-key': this.opts.apiKey,
      }),
      body: JSON.stringify({
        itemId: this.opts.effectiveItemId,
        originalItemId: this.opts.itemId,
        itemProtocol: comment.itemProtocol,
        itemPort: comment.itemPort,
        parentId: comment.parentId ? comment.parentId : undefined,
        replyTo: comment.replyToComment
          ? comment.replyToComment.commentId
          : undefined,
        captchaResult: comment.captchaResult
          ? comment.captchaResult
          : undefined,
        subscription: comment.subscription ? comment.subscription : undefined,
        website: comment.website ? comment.website : undefined,
        message: comment.message,
        pageUrl: window.location.href || '',
        pageTitle: document.title || '',
        emailNotifications: comment.emailNotifications || false,
        locale: getUserLocale(),
        timezone: getUserTimezone(),
      }),
    }).then((c) => {
      return {
        ...c,
        htmlContent: c.htmlMessage,
      };
    });
  }
}

function qs(p) {
  return Object.keys(p)
    .map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(p[k])}`)
    .join('&');
}

function fetch(url, params) {
  const request = new Request(url, params);
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
        'Failed to fetch data. Check that your have enough credits on your account.',
        err,
      );
      throw err;
    });
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
