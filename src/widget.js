import { h, render, Component } from 'preact';

import { Connect } from 'redux-zero/preact';
import { actions } from './actions';

import s from './style.css';

import Form from './form';
import Comment from './comment';
import { createGuestJWT } from './utils';

// TODO:

//  X share button
//  X copy link button
//  X save comment nested
//  X replyTo indication
//  X find nested comment
//  X insert in the right position
//  X attribution style
//  X base-font variables
//  X mobile styles
//  - post CSS and styles
//  - active state for the comment
//  - facebook login

export default () => (
  <Connect mapToProps={mapToProps} actions={actions}>
    {(props) => <Widget {...props} />}
  </Connect>
);

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
    disableLoadMore,
    sort,
    hideAttribution,
    recaptchaSitekey,
  } = config;
  const shouldRenderForm =
    session.isAuthenticated() || (!session.isAuthenticated() && allowGuests);
  const shouldRenderFormBefore = shouldRenderForm && sort === 'desc';
  const shouldRenderFormAfter = shouldRenderForm && sort === 'asc';
  const hasMore = !!cursor;
  const count = comments.length; // TODO
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
  }) {
    return (
      <div className={s.widget}>
        {shouldRenderFormBefore && <Form />}
        {loading && <div>loading</div>}
        {!loading && (
          <div className={s.header}>
            <span>
              {__('comments')}
              {countText}
            </span>
          </div>
        )}
        {!loading && count === 0 && <p>{__('noComments')}</p>}
        {comments.map((c) => (
          <Comment comment={c} />
        ))}
        {cursor && !disableLoadMore && <div>more button</div>}
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

  componentDidMount() {
    this.props.loadComments();
  }

  loadMore() {
    this.props.loadComments();
  }

  componentDidUpdate() {
    this.props.tryJumpToComment();
  }
}

const Attribution = () => {
  return (
    <div className={s.attribution}>
      <span>powered by &nbsp;</span>
      <a href="https://just-comments.com" target="_blank">
        just-comments.com
      </a>
    </div>
  );
};
