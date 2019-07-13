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
  SadIcon,
  HeartIcon,
} from './icons';
import {
  getCommentTimestamp,
  getHumanReadableCommentTimestamp,
  getCommentUrl,
  getTopReactions,
} from './comment-utils';
import { Avatar } from './avatar';
import Form from './form';
import s from './style.css';
import cls from 'classnames';
import { reactions } from './actions';

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
      !this.props.comment.reactMenuOpened,
    );
  };

  onLike = (reactionId) => {
    this.props.onLike(this.props.comment.commentId, reactionId);
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
    const Reaction = comment.reactionId
      ? reactions.find((r) => r.id === comment.reactionId).icon
      : undefined;
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
          {!Reaction && (
            <div className={s.react}>
              <button
                onClick={this.onToggleLikeMenu}
                className={cls(s.linkBtn, s.fontButton2)}
              >
                {__('react')}
              </button>
              {comment.reactMenuOpened && (
                <div className={cls(s.menu, s.reactMenu, s.horizontal)}>
                  {reactions.map((r) => {
                    return (
                      <button
                        tabindex="0"
                        role="button"
                        className={s.btn}
                        onClick={() => this.onLike(r.id)}
                        type="button"
                      >
                        <r.icon />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
          {Reaction && (
            <div className={cls(s.react, s.reacted)}>
              <Reaction />
            </div>
          )}
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
          {comment.reactions && (
            <div className={cls(s.reactions, s.fontBody2)}>
              <span>
                {getTopReactions(comment).reduce((acc, n) => acc + n.value, 0)}
              </span>
              {getTopReactions(comment).map((r, i) => {
                const reaction = reactions.find((_r) => _r.id === r.id);
                return (
                  <span
                    title={r.value}
                    className={cls(s.reactionContainer, s[`reaction${i}`])}
                  >
                    <reaction.icon />
                  </span>
                );
              })}
            </div>
          )}
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
