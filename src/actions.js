import { createGuestJWT, setJWT, copyToClipboard } from './utils';
import { getCommentUrl } from './comment-utils';
import * as md5 from 'md5';
import { __ } from './i18n';
import { LikeIcon, HappyIcon, InLoveIcon, SadIcon, HeartIcon } from './icons';
import { LocalStorage } from './storage';

export const actions = (store) => ({
  tryJumpToComment: (state) => {
    const { jumpToComment, jumped, lastKey, comments } = state;
    if (!jumped && jumpToComment && comments.length > 0) {
      setTimeout(() => {
        if (!document.getElementById('jc' + jumpToComment)) {
          console.log(
            'Could not scroll: ' + '#jc' + jumpToComment + ' not found',
          );
          if (lastKey) {
            this.loadMore();
          }
          return;
        }
        document.getElementById('jc' + jumpToComment).scrollIntoView({
          // behavior: 'smooth',
          // block: 'center',
          // inline: 'center',
        });
        store.setState({
          jumped: true,
        });
      }, 200);
    }
  },

  loadComments: (state) => {
    store.setState({
      loading: true,
    });

    const { jumpToComment } = state;

    state.api
      .getComments(state.cursor)
      .then(({ comments: newComments, cursor }) => {
        store.setState({
          loading: false,
          ...withComments([...state.comments, ...newComments], (comments) =>
            mapComment(
              updateById(comments, jumpToComment, (c) => ({
                ...c,
                active: true,
              })),
              (c) => {
                return {
                  ...c,
                  reactionId:
                    LocalStorage.get(`jcReacted${c.commentId}`) || undefined,
                };
              },
            ),
          ),
          cursor,
        });
      });
  },

  previewComment: (state) => {
    if (!state.form.text) {
      return;
    }

    const { session, config } = state;
    const jwt = session.get('jwt')
      ? session.get('jwt')
      : createGuestJWT(state.form.username, state.form.email, config.apiKey);

    store.setState({
      form: {
        ...state.form,
        previewLoading: true,
      },
    });

    return state.api
      .previewComment(jwt, {
        message: state.form.text,
      })
      .then(({ htmlMessage }) => {
        store.setState({
          form: {
            ...state.form,
            preview: htmlMessage,
            previewLoading: false,
          },
        });
      })
      .catch((err) => {
        store.setState({
          form: {
            ...state.form,
            previewLoading: false,
          },
        });
        throw err;
      });
  },

  hideCommentPreview: (state) => {
    store.setState({
      form: {
        ...state.form,
        preview: undefined,
      },
    });
  },

  setRecaptchaRef: (state, recaptchaRef) => {
    store.setState({
      recaptchaRef,
    });
  },

  sendComment: (state, formRef, replyToComment) => {
    const valid = formRef.checkValidity();

    if (!valid) {
      store.setState({
        form: {
          ...state.form,
          blocked: false,
          dirty: true,
        },
      });
      return;
    }

    store.setState({
      form: {
        ...state.form,
        dirty: false,
        blocked: true,
      },
    });

    const data = {
      ...state.form,
      replyToComment,
      parentId: replyToComment
        ? replyToComment.parentId || replyToComment.commentId
        : undefined,
    };

    return checkCaptcha(state.recaptchaRef)
      .then((captchaResult) =>
        createComment(state.api, state.session, state.config, {
          ...data,
          captchaResult,
        }),
      )
      .then((comment) => {
        window.location.hash = `#jc${comment.commentId}`;
        return store.setState({
          ...(comment.replyTo
            ? withComments([...state.comments], (comments) => {
                comments = updateById(comments, comment.replyTo, (c) => ({
                  ...c,
                  formOpened: false,
                  nested: addCommentInOrder(
                    c.nested,
                    comment,
                    state.config.sort,
                  ),
                }));
                return updateByIdWithReset(
                  comments,
                  comment.commentId,
                  (c) => ({
                    ...c,
                    active: true,
                  }),
                  (c) => ({
                    ...c,
                    active: false,
                  }),
                );
              })
            : withComments(
                addCommentInOrder(state.comments, comment, state.config.sort),
                (comments) =>
                  updateByIdWithReset(
                    comments,
                    comment.commentId,
                    (c) => ({
                      ...c,
                      active: true,
                    }),
                    (c) => ({
                      ...c,
                      active: false,
                    }),
                  ),
              )),
          jumpToComment: comment.commentId,
          jumped: false,
          form: {
            ...state.form,
            blocked: false,
            text: '',
            preview: undefined,
            previewLoading: false,
          },
        });
      })
      .catch((err) => {
        console.log(err);
        return store.setState({
          form: {
            ...state.form,
            blocked: false,
            errors: {
              form: __('networkError'),
            },
          },
        });
      });
  },

  onPushToggle: (state, e) => {
    e.preventDefault();

    const val = !state.form.pushNotifications;

    store.setState({
      form: {
        ...state.form,
        pushNotifications: val,
      },
    });

    const { session, api } = state;
    if (!session.get('subscription')) {
      return api.pushPopup().then((sub) => {
        session.set('subscription', sub);
        session.set('notifications', val);
        store.setState({
          session: session.clone(),
        });
      });
    }
  },

  onEmailToggle: (state, e) => {
    e.preventDefault();

    const val = !state.form.emailNotifications;

    store.setState({
      form: {
        ...state.form,
        emailNotifications: val,
      },
    });
  },
  onFacebookLogin: (state) => {
    const { api, session } = state;

    api.authFbPopup(api.facebookRedirect(window.location.href)).then((jwt) => {
      setJWT(session, jwt, 'fb');
      store.setState({
        session: session.clone(),
        form: {
          errors: {},
          dirty: false,
          pushNotifications: !!session.get('subscription'),
          userPic: session.get('userPic'),
          loginProvider: session.get('loginProvider'),
        },
      });
    });
  },

  onTwitterLogin: (state) => {
    const { api, session } = state;

    api.authPopup(api.twitterRedirect(window.location.href)).then((jwt) => {
      setJWT(session, jwt, 'twitter');

      store.setState({
        session: session.clone(),
        form: {
          errors: {},
          dirty: false,
          pushNotifications: !!session.get('subscription'),
          userPic: session.get('userPic'),
          loginProvider: session.get('loginProvider'),
        },
      });
    });
  },

  onLogout: (state, e) => {
    e.preventDefault();
    const { session } = state;
    session.clear();
    store.setState({
      session: session.clone(),
      form: {
        errors: {},
        dirty: false,
        pushNotifications: !!session.get('subscription'),
        userPic: session.get('userPic'),
        loginProvider: session.get('loginProvider'),
      },
    });
  },

  onUsernameInput: (state, e) => ({
    form: {
      ...state.form,
      username: e.target.value,
    },
  }),

  onEmailInput: (state, e) => ({
    form: {
      ...state.form,
      email: e.target.value,
    },
  }),

  onEmailBlur: (state) => {
    const { email } = state.form;
    if (email) {
      return {
        form: {
          ...state.form,
          userPic: getUserPic(email),
        },
      };
    }
  },

  onWebsiteInput: (state, e) => ({
    form: {
      ...state.form,
      website: e.target.value,
    },
  }),

  onTextInput: (state, e) => {
    const element = e.target;
    element.style.height = 'inherit';
    const newHeight =
      element.scrollHeight > 150
        ? element.scrollHeight + 25
        : element.scrollHeight;
    element.style.height = newHeight + 'px';
    return {
      form: {
        ...state.form,
        text: e.target.value,
      },
    };
  },

  onToggleComment: (state, commentId, collapsed) => ({
    ...withComments(state.comments, (comments) =>
      updateById(comments, commentId, (c) => ({
        ...c,
        collapsed,
      })),
    ),
  }),

  onToggleCommentForm: (state, commentId, formOpened) => ({
    form: {
      ...state.form,
      text: formOpened ? '' : state.form.text,
    },
    ...withComments(state.comments, (comments) =>
      updateByIdWithReset(
        comments,
        commentId,
        (c) => ({
          ...c,
          formOpened,
          menuOpened: false,
          reactMenuOpened: false,
        }),
        (c) => ({
          ...c,
          reactMenuOpened: false,
          formOpened: false,
          menuOpened: false,
        }),
      ),
    ),
  }),

  onToggleCommentMenu: (state, commentId, menuOpened) => ({
    ...withComments(state.comments, (comments) =>
      updateByIdWithReset(
        comments,
        commentId,
        (c) => ({
          ...c,
          menuOpened,
          reactMenuOpened: false,
          formOpened: false,
        }),
        (c) => ({
          ...c,
          reactMenuOpened: false,
          formOpened: false,
          menuOpened: false,
        }),
      ),
    ),
  }),

  onToggleLikeMenu: (state, commentId, reactMenuOpened) => ({
    ...withComments(state.comments, (comments) =>
      updateByIdWithReset(
        comments,
        commentId,
        (c) => ({
          ...c,
          reactMenuOpened,
          formOpened: false,
          menuOpened: false,
        }),
        (c) => ({
          ...c,
          reactMenuOpened: false,
          formOpened: false,
          menuOpened: false,
        }),
      ),
    ),
  }),

  jumpToComment: (state, commentId) => {
    window.location.hash = 'jc' + commentId;
    return {
      ...withComments(state.comments, (comments) =>
        updateByIdWithReset(
          comments,
          commentId,
          (c) => ({
            ...c,
            active: true,
          }),
          (c) => ({
            ...c,
            active: false,
          }),
        ),
      ),
      jumpToComment: commentId,
      jumped: false,
    };
  },

  copyToClipboard: (state, commentId) => {
    copyToClipboard(getCommentUrl(findById(state.commentsIndex, commentId)));
    return hideMenuForComment(state, commentId);
  },

  shareOnFb: (state, commentId) => {
    const comment = findById(state.commentsIndex, commentId);
    openSharePopup(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        getCommentUrl(comment),
      )}`,
    );
    return hideMenuForComment(state, commentId);
  },

  shareOnTwitter: (state, commentId) => {
    const comment = findById(state.commentsIndex, commentId);
    openSharePopup(
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(
        getCommentUrl(comment),
      )}`,
    );
    return hideMenuForComment(state, commentId);
  },

  onFormImageError: (state) => {
    store.setState({
      form: {
        ...state.form,
        userPic: undefined,
      },
    });
  },

  onCommentImageError: (state, commentId) => ({
    ...withComments(state.comments, (comments) =>
      updateById(comments, commentId, (c) => ({
        ...c,
        userPic: undefined,
      })),
    ),
  }),

  onLike: (state, commentId, reactionId) => {
    LocalStorage.set(`jcReacted${commentId}`, reactionId);
    return {
      ...withComments(state.comments, (comments) =>
        updateById(comments, commentId, (c) => ({
          ...c,
          reactionId: reactionId,
          reactions: c.reactions
            ? {
                ...c.reactions,
                [reactionId]: c.reactions[reactionId] + 1,
              }
            : {
                [reactionId]: 1,
              },
        })),
      ),
    };
  },
});

function addCommentInOrder(comments, comment, sort) {
  if (sort === 'asc') {
    return addCommentInAscOrder(comments, comment);
  }
  return addCommentInDescOrder(comments, comment);
}

function addCommentInAscOrder(comments, comment) {
  return [...comments, comment];
}

function addCommentInDescOrder(comments, comment) {
  return [comment, ...comments];
}

function openSharePopup(url) {
  open(
    url,
    'share',
    'height=380,width=660,resizable=0,toolbar=0,menubar=0,status=0,location=0,scrollbars=0',
  );
}

function hideMenuForComment(state, commentId) {
  return withComments(state.comments, (comments) =>
    updateById(comments, commentId, (c) => ({
      ...c,
      menuOpened: false,
    })),
  );
}

function withComments(comments, ...fns) {
  comments = fns.reduce((comments, fn) => fn(comments), comments);
  return {
    comments,
    commentsIndex: buildIndex(comments),
  };
}

function buildIndex(comments, idx = {}) {
  return comments.reduce((idx, comment) => {
    idx[comment.commentId] = comment;
    return buildIndex(comment.nested || [], idx);
  }, idx);
}

function findById(commentsIndex, commentId) {
  return commentsIndex[commentId];
}

function updateById(comments, commentId, fn) {
  return comments.map((c) => {
    if (c.commentId === commentId) {
      return fn(c);
    }
    c.nested = updateById(c.nested || [], commentId, fn);
    return c;
  });
}

function mapComment(comments, fn) {
  return comments.map((c) => {
    c.nested = mapComment(c.nested || [], fn);
    return fn(c);
  });
}

function updateByIdWithReset(comments, commentId, fn, resetFn) {
  return comments.map((c) => {
    c.nested = updateByIdWithReset(c.nested || [], commentId, fn, resetFn);
    if (c.commentId === commentId) {
      return fn(c);
    }
    return resetFn(c);
  });
}

function createComment(
  api,
  session,
  config,
  {
    text,
    username,
    website,
    email,
    replyToComment,
    parentId,
    captchaResult,
    pushNotifications,
    emailNotifications,
  },
) {
  const { itemProtocol, itemPort } = config;

  if (!session.isAuthenticated()) {
    session.set('username', username);
    session.set('userEmail', email);
    session.set('userUrl', website);
  }

  session.set('pushNotifications', pushNotifications);
  session.set('emailNotifications', emailNotifications);

  const jwt = session.get('jwt')
    ? session.get('jwt')
    : createGuestJWT(username, email, config.apiKey, config.defaultUserPicUrl);

  const subscription =
    pushNotifications && session.get('subscription')
      ? session.get('subscription')
      : null;

  const loginProvider = session.get('loginProvider');

  return api.saveComment(jwt, {
    itemProtocol,
    itemPort,
    message: text,
    website,
    replyToComment,
    parentId,
    captchaResult,
    subscription,
    emailNotifications,
    loginProvider,
  });
}

function checkCaptcha(recaptcha) {
  if (!recaptcha) {
    return Promise.resolve();
  }
  return recaptcha.check();
}

export function getUserPic(email) {
  return `https://www.gravatar.com/avatar/${md5(email)}`;
}

export const reactions = [
  {
    icon: LikeIcon,
    id: 'like',
  },
  {
    icon: InLoveIcon,
    id: 'inlove',
  },
  {
    icon: SadIcon,
    id: 'sad',
  },
  {
    icon: HappyIcon,
    id: 'happy',
  },
  {
    icon: HeartIcon,
    id: 'heart',
  },
];
