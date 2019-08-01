import { createGuestJWT, setJWT, copyToClipboard } from './utils';
import { getCommentUrl } from './comment-utils';
import * as md5 from 'md5';
import { __ } from './i18n';
import { LikeIcon, HappyIcon, InLoveIcon, SadIcon, HeartIcon } from './icons';
import { LocalStorage } from './storage';

export const actions = (store) => ({
  tryJumpToComment: (state) => {
    const { jumpToComment, jumped, cursor, comments } = state;
    if (!jumped && jumpToComment && comments.length > 0) {
      setTimeout(() => {
        if (!document.getElementById('jc' + jumpToComment)) {
          console.log(
            'Could not scroll: ' + '#jc' + jumpToComment + ' not found',
          );
          if (cursor) {
            loadComments(store, state.api, {
              jumpToComment: jumpToComment,
              existingComments: comments,
              cursor: cursor,
              sort: state.config.sort,
            });
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
    return loadComments(store, state.api, {
      jumpToComment: state.jumpToComment,
      existingComments: state.comments,
      cursor: state.cursor,
      sort: state.config.sort,
    });
  },

  previewComment: (state, formIdx) => {
    const { forms, session, config } = state;
    const form = forms[formIdx];

    if (!form.text) {
      return;
    }

    const jwt = session.get('jwt')
      ? session.get('jwt')
      : createGuestJWT(form.username, form.email, config.apiKey);

    store.setState({
      forms: updateFormByIdx(state.forms, formIdx, {
        previewLoading: true,
      }),
    });

    return state.api
      .previewComment(jwt, {
        message: form.text,
      })
      .then(({ htmlMessage }) => {
        store.setState({
          forms: updateFormByIdx(state.forms, formIdx, {
            preview: htmlMessage,
            previewLoading: false,
          }),
        });
      })
      .catch((err) => {
        store.setState({
          forms: updateFormByIdx(state.forms, formIdx, {
            previewLoading: false,
          }),
        });
        throw err;
      });
  },

  hideCommentPreview: (state, formIdx) => {
    return {
      forms: updateFormByIdx(state.forms, formIdx, {
        preview: undefined,
      }),
    };
  },

  setRecaptchaRef: (state, recaptchaRef) => {
    return {
      recaptchaRef,
    };
  },

  sendComment: (state, formRef, replyToComment, formIdx) => {
    const valid = formRef.checkValidity();

    if (!valid) {
      return {
        forms: updateFormByIdx(state.forms, formIdx, {
          blocked: false,
          dirty: true,
        }),
      };
    }

    store.setState({
      forms: updateFormByIdx(state.forms, formIdx, {
        dirty: false,
        blocked: true,
      }),
    });

    const data = {
      ...state.forms[formIdx],
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
          forms: updateFormByIdx(state.forms, formIdx, {
            blocked: false,
            text: '',
            preview: undefined,
            previewLoading: false,
          }).map((f) => {
            return updateForm(f, createForm(state.session));
          }),
        });
      })
      .catch((err) => {
        console.log(err);
        return store.setState({
          forms: updateFormByIdx(state.forms, formIdx, {
            blocked: false,
            errors: {
              form: __('networkError'),
            },
          }),
        });
      });
  },

  onPushToggle: (state, e, formIdx) => {
    e.preventDefault();

    const val = !state.forms[formIdx].pushNotifications;

    store.setState({
      forms: updateFormByIdx(state.forms, formIdx, {
        pushNotifications: val,
      }),
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
    } else {
      session.set('notifications', val);
    }
  },

  onEmailToggle: (state, e, formIdx) => {
    e.preventDefault();
    return {
      forms: updateFormByIdx(state.forms, formIdx, {
        emailNotifications: !state.forms[formIdx].emailNotifications,
      }),
    };
  },

  onFacebookLogin: (state) => {
    authPopup(
      store,
      state,
      state.api.facebookRedirect(window.location.href),
      'fb',
    );
  },

  onTwitterLogin: (state) => {
    authPopup(
      store,
      state,
      state.api.twitterRedirect(window.location.href),
      'twitter',
    );
  },

  onLogout: (state, e) => {
    e.preventDefault();
    const { session } = state;
    session.clear();
    store.setState({
      session: session.clone(),
      forms: state.forms.map((f) => {
        return updateFormWithSession(f, session);
      }),
    });
  },

  onUsernameInput: (state, e, formIdx) => ({
    forms: updateFormByIdx(state.forms, formIdx, {
      username: e.target.value,
    }),
  }),

  onEmailInput: (state, e, formIdx) => ({
    forms: updateFormByIdx(state.forms, formIdx, {
      email: e.target.value,
    }),
  }),

  onEmailBlur: (state, formIdx) => {
    const { email } = state.forms[formIdx];
    if (email) {
      return {
        forms: updateFormByIdx(state.forms, formIdx, {
          userPic: getUserPic(email),
        }),
      };
    }
  },

  onWebsiteInput: (state, e, formIdx) => ({
    forms: updateFormByIdx(state.forms, formIdx, {
      website: e.target.value,
    }),
  }),

  onTextInput: (state, e, formIdx) => {
    const element = e.target;
    element.style.height = 'inherit';
    const newHeight =
      element.scrollHeight > 150
        ? element.scrollHeight + 25
        : element.scrollHeight;
    element.style.height = newHeight + 'px';

    return {
      forms: updateFormByIdx(state.forms, formIdx, {
        text: e.target.value,
      }),
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

  onToggleCommentForm: (state, commentId, formOpened, formIdx) => {
    const { session, forms } = state;
    const newForms = [...forms];
    if (formOpened && !formIdx) {
      newForms.push(createForm(session));
      formIdx = newForms.length - 1;
    }

    return {
      forms: newForms,
      ...withComments(state.comments, (comments) =>
        updateByIdWithReset(
          comments,
          commentId,
          (c) => ({
            ...c,
            formOpened,
            formIdx,
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
    };
  },

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

  onFormImageError: (state, formIdx) => {
    return {
      forms: updateFormByIdx(state.forms, formIdx, {
        userPic: undefined,
      }),
    };
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
    return checkCaptcha(state.recaptchaRef).then((captchaResult) => {
      state.api.createReaction(commentId, reactionId, captchaResult);
      storeReactionLocally(commentId, reactionId);
      store.setState({
        ...withComments(state.comments, (comments) =>
          updateById(comments, commentId, (c) => ({
            ...c,
            reactionId: reactionId,
            reactions: c.reactions
              ? {
                  ...c.reactions,
                  [reactionId]:
                    (c.reactions[reactionId] ? c.reactions[reactionId] : 0) + 1,
                }
              : {
                  [reactionId]: 1,
                },
          })),
        ),
      });
    });
  },

  onSortChange(state, e) {
    store.setState({
      cursor: null,
      comments: [],
      config: {
        ...state.config,
        sort: e.target.value,
      },
    });

    return loadComments(store, state.api, {
      jumpToComment: null,
      existingComments: [],
      cursor: null,
      sort: e.target.value,
    });
  },
});

const jcReacted = 'jcReacted';

function storeReactionLocally(commentId, reactionId) {
  let list = LocalStorage.get(jcReacted)
    ? JSON.parse(LocalStorage.get(jcReacted))
    : [];
  list.push({ cid: commentId, rid: reactionId });
  if (list.length >= 5000) {
    list = list.slice(-4000);
  }
  LocalStorage.set(jcReacted, JSON.stringify(list));
}

function getLocalReacted() {
  let list = LocalStorage.get(jcReacted)
    ? JSON.parse(LocalStorage.get(jcReacted))
    : [];

  return list.reduce((acc, item) => {
    acc[item.cid] = item.rid;
    return acc;
  }, {});
}

function addCommentInOrder(comments, comment, sort) {
  if (sort === 'asc' || sort === 'top') {
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

function updateFormByIdx(forms, idx, update) {
  return [...forms].map((f, i) => {
    if (i === idx) {
      return updateForm(f, update);
    }
    return f;
  });
}

function updateForm(form, update) {
  return {
    ...form,
    ...update,
  };
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

function loadComments(
  store,
  api,
  { sort, jumpToComment, cursor, existingComments },
) {
  store.setState({
    loading: true,
  });

  const reacted = getLocalReacted();

  return api
    .getComments(cursor, sort)
    .then(({ comments: newComments, cursor }) => {
      store.setState({
        loading: false,
        ...withComments([...existingComments, ...newComments], (comments) =>
          mapComment(
            updateById(comments, jumpToComment, (c) => ({
              ...c,
              active: true,
            })),
            (c) => {
              return {
                ...c,
                reactionId: reacted[c.commentId],
              };
            },
          ),
        ),
        cursor,
      });
    });
}

export function getUserPic(email) {
  return `https://www.gravatar.com/avatar/${md5(email)}`;
}

export const reactions = [
  {
    icon: LikeIcon,
    id: 'like',
    name: 'Like',
  },
  {
    icon: InLoveIcon,
    id: 'inlove',
    name: 'Love',
  },
  {
    icon: SadIcon,
    id: 'sad',
    name: 'Sad',
  },
  {
    icon: HappyIcon,
    id: 'happy',
    name: 'Happy',
  },
  {
    icon: HeartIcon,
    id: 'heart',
    name: 'Heart',
  },
];

export function createForm(session) {
  const email = session.get('userEmail');
  return {
    dirty: false,
    email: email,
    errors: {},
    loginProvider: session.get('loginProvider'),
    previewLoading: false,
    pushNotifications: !!session.get('notifications'),
    username: session.get('username'),
    userPic: session.get('userPic') || (email && getUserPic(email)),
    userUrl: session.get('userUrl'),
    website: session.get('userUrl'),
    isLoggedIn: session.isAuthenticated(),
  };
}

function updateFormWithSession(form, session) {
  return updateForm(form, {
    errors: {},
    dirty: false,
    pushNotifications: !!session.get('subscription'),
    userPic: session.get('userPic'),
    loginProvider: session.get('loginProvider'),
    isLoggedIn: session.isAuthenticated(),
  });
}

function authPopup(store, state, url, provider = 'fb') {
  const { api, session } = state;
  api.authPopup(url).then((jwt) => {
    setJWT(session, jwt, provider);
    store.setState({
      session: session.clone(),
      forms: state.forms.map((f) => {
        return updateFormWithSession(f, session);
      }),
    });
  });
}
