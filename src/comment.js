import { h, render, Component } from 'preact';
import { __, substitute } from './i18n';
import { Connect } from 'redux-zero/preact';
import { actions } from './actions';
import {
  Anonymous,
  CollapseIcon,
  UncollapseIcon,
  FacebookIcon,
  TwitterIcon,
  LikeIcon,
  HappyIcon,
  InLoveIcon,
  ReplyIcon,
} from './icons';
import {
  getCommentTimestamp,
  getHumanReadableCommentTimestamp,
  getCommentUrl,
} from './comment-utils';
import { Avatar } from './avatar';
import Form from './form';
import s from './style.css';
import cls from 'classnames';

const WrapperComment = (origProps) => (
  <Connect mapToProps={mapToProps} actions={actions}>
    {(props) => <Comment {...props} {...origProps} />}
  </Connect>
);

export default WrapperComment;

const mapToProps = (state) => ({
  commentsIndex: state.commentsIndex,
  disableProfilePictures: state.config.disableProfilePictures,
  disableShareButton: state.config.disableShareButton,
});

function commentCount(comments) {
  return comments.reduce((acc, c) => {
    acc += c.hidden ? 0 : 1;
    if (c.nested) {
      acc += commentCount(c.nested);
    }
    return acc;
  }, 0);
}

class Comment extends Component {
  onToggleComment = () => {
    this.props.onToggleComment(
      this.props.comment.commentId,
      !this.props.comment.collapsed,
    );
  };

  onToggleCommentForm = () => {
    this.props.onToggleCommentForm(
      this.props.comment.commentId,
      !this.props.comment.formOpened,
    );
  };

  onToggleMenu = () => {
    this.props.onToggleCommentMenu(
      this.props.comment.commentId,
      !this.props.comment.menuOpened,
    );
  };

  onCommentLinkClick = (e) => {
    e.preventDefault();
    this.props.jumpToComment(this.props.comment.commentId);
  };

  onReplyCommentLinkClick = (e) => {
    e.preventDefault();
    const { comment } = this.props;
    this.props.jumpToComment(comment.replyTo);
  };

  onToggleLikeMenu = () => {
    this.props.onToggleLikeMenu(
      this.props.comment.commentId,
      !this.props.comment.likeMenuOpened,
    );
  };

  onCopyToClipboard = () => {
    this.props.copyToClipboard(this.props.comment.commentId);
  };

  shareOnFb = () => {
    this.props.shareOnFb(this.props.comment.commentId);
  };

  shareOnTwitter = () => {
    this.props.shareOnTwitter(this.props.comment.commentId);
  };

  onImageError = () => {
    this.props.onCommentImageError(this.props.comment.commentId);
  };

  render({
    comment,
    commentsIndex,
    first,
    level,
    disableProfilePictures,
    disableShareButton,
  }) {
    return (
      <div
        key={comment.commentId}
        className={cls(s.comment, s.fontBody2, {
          [s.first]: first,
          [s.deep]: level >= 5,
          [s.noUserPic]: disableProfilePictures,
        })}
        id={`jc${comment.commentId}`}
      >
        <div className={cls(s.bubble, { [s.active]: comment.active })}>
          <div>
            {!disableProfilePictures && (
              <Avatar
                userUrl={comment.userUrl}
                userPic={comment.userPic}
                loginProvider={comment.loginProvider}
                onImageError={this.onImageError}
              />
            )}
            <div className={s.title}>
              <div className={s.metadata}>
                <div>
                  {comment.userUrl ? (
                    <a
                      target="_blank"
                      href={comment.userUrl}
                      className={cls(s.username, s.fontHeading2)}
                    >
                      {comment.username}
                    </a>
                  ) : (
                    <span className={cls(s.username, s.fontHeading2)}>
                      {comment.username}
                    </span>
                  )}
                </div>
                <div>
                  <a
                    onClick={this.onCommentLinkClick}
                    href={getCommentUrl(comment)}
                    className={cls(s.date, s.fontBody3)}
                    title={getCommentTimestamp(comment)}
                  >
                    {getHumanReadableCommentTimestamp(comment)}
                  </a>
                  {comment.replyTo && commentsIndex && (
                    <a
                      className={cls(s.date, s.fontBody3)}
                      onClick={this.onReplyCommentLinkClick}
                      href={getCommentUrl(commentsIndex[comment.replyTo])}
                    >
                      <ReplyIcon />
                      <span>{commentsIndex[comment.replyTo].username}</span>
                    </a>
                  )}
                </div>
              </div>
              <div className={s.collapse}>
                {comment.collapsed && (
                  <span className={cls(s.fontBody3)}>
                    {substitute(__('collapsedComments'), {
                      n: commentCount([comment]),
                    })}
                  </span>
                )}
                <button
                  title={comment.collapsed ? __('uncollapse') : __('collapse')}
                  aria-label={
                    comment.collapsed ? __('uncollapse') : __('collapse')
                  }
                  onClick={this.onToggleComment}
                  className={s.btn}
                >
                  {comment.collapsed ? <CollapseIcon /> : <UncollapseIcon />}
                </button>
              </div>
            </div>
          </div>
          {!comment.collapsed && (
            <div
              className={cls(s.content, s.fontBody2)}
              dangerouslySetInnerHTML={{ __html: comment.htmlContent }}
            />
          )}
        </div>
        <div className={s.buttons}>
          <div className={s.reply}>
            <button
              onClick={this.onToggleCommentForm}
              className={cls(s.linkBtn, s.fontButton2)}
            >
              {__('reply')}
            </button>
          </div>
          {/*<div className={s.like}>
            <button onClick={this.onToggleLikeMenu} className={s.linkBtn}>
              Like
            </button>
            {comment.likeMenuOpened && (
              <div className={cls(s.menu, s.horizontal)}>
                <button
                  tabindex="0"
                  role="button"
                  className={s.btn}
                  type="button"
                >
                  <LikeIcon />
                </button>
                <button
                  tabindex="0"
                  role="button"
                  className={s.btn}
                  type="button"
                >
                  <HappyIcon />
                </button>
                <button
                  tabindex="0"
                  role="button"
                  className={s.btn}
                  type="button"
                >
                  <InLoveIcon />
                </button>
              </div>
            )}
          </div>*/}
          <div className={s.more}>
            <button
              onClick={this.onToggleMenu}
              className={cls(s.linkBtn, s.fontButton2)}
            >
              ⋯
            </button>
            {comment.menuOpened && (
              <div className={s.menu}>
                <div>
                  <button
                    onClick={this.onCopyToClipboard}
                    className={cls(s.menuBtn, s.fontBody3)}
                  >
                    {__('copyLink')}
                  </button>
                </div>
                {!disableShareButton && (
                  <div>
                    <button
                      onClick={this.shareOnFb}
                      className={cls(s.menuBtn, s.fontBody3)}
                    >
                      {__('share')} <FacebookIcon />
                    </button>
                  </div>
                )}
                {!disableShareButton && (
                  <div>
                    <button
                      onClick={this.shareOnTwitter}
                      className={cls(s.menuBtn, s.fontBody3)}
                    >
                      <span>{__('share')}</span> <TwitterIcon />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {comment.formOpened && <Form replyToComment={comment} />}
        {!comment.collapsed &&
          (comment.nested || [])
            .filter((c) => !c.hidden)
            .map((c, i) => (
              <WrapperComment level={level + 1} first={i === 0} comment={c} />
            ))}
      </div>
    );
  }
}
