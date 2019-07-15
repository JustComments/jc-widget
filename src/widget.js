import cls from 'classnames';
import Comment from './comment';
import Form from './form';
import s from './style.css';
import { actions } from './actions';
import { Connect } from 'redux-zero/preact';
import { h, render, Component } from 'preact';
import { Recaptcha } from './recaptcha';
import { __ } from './i18n';

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

const mapToProps = ({ config, loading, cursor, comments }) => {
  const {
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
  const hasMore = !!cursor;
  const count = commentCount(comments);
  const countText = count > 0 ? ` (${count}${hasMore ? '+' : ''})` : ``;

  return {
    comments,
    count,
    countText,
    cursor,
    disableLoadMore,
    hideAttribution,
    hideCommentHeader,
    hideNoCommentsText,
    loading,
    recaptchaSitekey,
    shouldRenderForm,
    sort,
  };
};

class Widget extends Component {
  render({
    comments,
    count,
    countText,
    cursor,
    disableLoadMore,
    hideAttribution,
    hideCommentHeader,
    hideNoCommentsText,
    loading,
    onSortChange,
    recaptchaSitekey,
    setRecaptchaRef,
    shouldRenderForm,
    sort,
  }) {
    return (
      <div className={s.widget}>
        {shouldRenderForm && <Form />}
        {!hideCommentHeader && (
          <div className={cls(s.header)}>
            <span className={cls(s.fontHeading1)}>
              {__('comments')}
              {countText}
            </span>
            <span className={cls(s.fontBody2)}>
              Show:{' '}
              <select
                onChange={onSortChange}
                className={cls(s.select, s.fontBody2)}
              >
                <option value="desc" selected={sort === 'desc'}>
                  {__('newestFirst')}
                </option>
                <option value="asc" selected={sort === 'asc'}>
                  {__('oldestFirst')}
                </option>
                <option value="top" selected={sort === 'top'}>
                  {__('topFirst')}
                </option>
              </select>
            </span>
          </div>
        )}
        {loading && <div className={s.loading}>{__('loadingComments')}</div>}
        {!loading && count === 0 && !hideNoCommentsText && (
          <p className={cls(s.text, s.fontBody2)}>{__('noComments')}</p>
        )}
        {comments
          .filter((c) => !c.hidden)
          .map((c) => (
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
            ref={(c) => setRecaptchaRef(c)}
          />
        )}
        {shouldRenderForm && comments.length > 10 && <Form last={true} />}
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

const Attribution = () => (
  <div className={cls(s.attribution, s.fontBody3)}>
    <span>powered by &nbsp;</span>
    <a href="https://just-comments.com" target="_blank">
      just-comments.com
    </a>
  </div>
);
