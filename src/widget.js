import { h, render, Component } from 'preact';

import { Connect } from 'redux-zero/preact';
import { actions } from './actions';

import s from './style.css';
import cls from 'classnames';

import Form from './form';
import Comment from './comment';
import { createGuestJWT } from './utils';

// TODO:
//  - translations
//  - custom empty pic image
//  - elipsis animation
//

export default () => (
  <Connect mapToProps={mapToProps} actions={actions}>
    {(props) => <Widget {...props} />}
  </Connect>
);

function commentCount(comments) {
  return comments.reduce((acc, c) => {
    acc += c.hidden ? 0 : 1;
    if (c.nested) {
      acc += commentCount(c.nested);
    }
    return acc;
  }, 0);
}

const mapToProps = ({
  config,
  session,
  loading,
  cursor,
  jumpToComment,
  comments,
}) => {
  const {
    allowGuests,
    disableSocialLogin,
    disableAnonymousLogin,
    disableLoadMore,
    sort,
    hideAttribution,
    recaptchaSitekey,
    hideCommentHeader,
    hideNoCommentsText,
  } = config;
  const shouldRenderForm = !(disableSocialLogin && disableAnonymousLogin);
  const shouldRenderFormBefore = shouldRenderForm && sort === 'desc';
  const shouldRenderFormAfter = shouldRenderForm && sort === 'asc';
  const hasMore = !!cursor;
  const count = commentCount(comments);
  const countText = count > 0 ? ` (${count}${hasMore ? '+' : ''})` : ``;

  return {
    shouldRenderFormBefore,
    shouldRenderFormAfter,
    loading,
    count,
    comments,
    countText,
    cursor,
    disableLoadMore,
    recaptchaSitekey,
    hideAttribution,
    hideCommentHeader,
    hideNoCommentsText,
  };
};

class Widget extends Component {
  render({
    shouldRenderFormBefore,
    shouldRenderFormAfter,
    loading,
    count,
    comments,
    countText,
    cursor,
    disableLoadMore,
    recaptchaSitekey,
    hideAttribution,
    hideCommentHeader,
    hideNoCommentsText,
  }) {
    return (
      <div className={s.widget}>
        {shouldRenderFormBefore && <Form />}
        {loading && <div className={s.loading}>{__('loadingComments')}</div>}
        {!loading && !hideCommentHeader && (
          <div className={cls(s.header, s.fontHeading1)}>
            <span>
              {__('comments')}
              {countText}
            </span>
          </div>
        )}
        {!loading && count === 0 && !hideNoCommentsText && (
          <p className={cls(s.text, s.fontBody2)}>{__('noComments')}</p>
        )}
        {comments.map((c) => (
          <Comment comment={c} level={0} />
        ))}
        {cursor && !disableLoadMore && (
          <div className={s.loadMore}>
            <button
              onClick={this.loadMore}
              className={cls(s.btn, s.primary, s.large, s.fontButton1)}
            >
              {__('loadMoreButton')}
            </button>
          </div>
        )}
        {recaptchaSitekey && (
          <Recaptcha
            sitekey={recaptchaSitekey}
            ref={(c) => (this.recaptcha = c)}
          />
        )}
        {shouldRenderFormAfter && <Form />}
        {!hideAttribution && <Attribution />}
      </div>
    );
  }

  loadMore = () => {
    this.props.loadComments();
  };

  componentDidMount() {
    this.props.loadComments();
  }

  componentDidUpdate() {
    this.props.tryJumpToComment();
  }
}

const Attribution = () => {
  return (
    <div className={cls(s.attribution, s.fontBody3)}>
      <span>powered by &nbsp;</span>
      <a href="https://just-comments.com" target="_blank">
        just-comments.com
      </a>
    </div>
  );
};
