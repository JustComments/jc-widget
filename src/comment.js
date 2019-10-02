import cls from 'classnames';
import { Connect } from 'redux-zero/preact';
import { h, render, Component } from 'preact';

import { __, substitute } from './i18n';
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
  commentCount,
  getReactionsCount,
} from './comment-utils';
import { Avatar } from './avatar';
import Form from './form';
import { reactions } from './actions';
import { Btn, LinkBtn, MenuBtn } from './ui';

import s from './style.css';

const mapToProps = (state) => {
  const cfg = state.config;
  return {
    forms: state.forms,
    showReply: !(
      (cfg.disableSocialLogin && cfg.disableAnonymousLogin) ||
      cfg.disableReply
    ),
    commentsIndex: state.commentsIndex,
    disableProfilePictures: cfg.disableProfilePictures,
    disableShareButton: cfg.disableShareButton,
    disableReactions: cfg.disableReactions,
    customLocale: cfg.customLocale,
  };
};

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
      this.props.comment.formIdx,
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

  shouldComponentUpdate(nextProps) {
    const prevForm = this.props.forms[this.props.comment.formIdx];
    const nextForm = nextProps.forms[nextProps.comment.formId];
    const attrs = [
      'comment',
      'commentsIndex',
      'disableProfilePictures',
      'disableReactions',
      'disableShareButton',
      'first',
      'level',
      'showReply',
    ];
    return (
      prevForm !== nextForm ||
      attrs.some((key) => this.props[key] !== nextProps[key])
    );
  }

  render({
    comment,
    commentsIndex,
    disableProfilePictures,
    disableReactions,
    disableShareButton,
    first,
    level,
    showReply,
    forms,
  }) {
    const topReactions = getTopReactions(comment);
    const reactionsCount = getReactionsCount(comment);
    const Reaction = comment.reactionId
      ? reactions.find((r) => r.id === comment.reactionId)
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
                customLocale={this.props.customLocale}
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
                    {substitute(
                      __('collapsedComments', this.props.customLocale),
                      {
                        n: commentCount([comment]),
                      },
                    )}
                  </span>
                )}
                <Btn
                  title={
                    comment.collapsed
                      ? __('uncollapse', this.props.customLocale)
                      : __('collapse', this.props.customLocale)
                  }
                  onClick={this.onToggleComment}
                >
                  {comment.collapsed ? <CollapseIcon /> : <UncollapseIcon />}
                </Btn>
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
          {showReply && (
            <div className={s.reply}>
              <LinkBtn onClick={this.onToggleCommentForm}>
                {__('reply', this.props.customLocale)}
              </LinkBtn>
            </div>
          )}
          {!disableReactions && !Reaction && (
            <div className={s.react}>
              <LinkBtn onClick={this.onToggleLikeMenu}>
                {(__('react'), this.props.customLocale)}
              </LinkBtn>
              {comment.reactMenuOpened && (
                <div className={cls(s.menu, s.reactMenu, s.horizontal)}>
                  {reactions.map((r) => {
                    return (
                      <Btn onClick={() => this.onLike(r.id)} title={r.name}>
                        <r.icon />
                      </Btn>
                    );
                  })}
                </div>
              )}
            </div>
          )}
          {Reaction && (
            <div title={Reaction.name} className={cls(s.react, s.reacted)}>
              <Reaction.icon />
            </div>
          )}
          <div className={s.more}>
            <LinkBtn onClick={this.onToggleMenu}>⋯</LinkBtn>
            {comment.menuOpened && (
              <div className={s.menu}>
                <div>
                  <MenuBtn onClick={this.onCopyToClipboard}>
                    {__('copyLink', this.props.customLocale)}
                  </MenuBtn>
                </div>
                {!disableShareButton && (
                  <div>
                    <MenuBtn onClick={this.shareOnFb}>
                      {__('share', this.props.customLocale)} <FacebookIcon />
                    </MenuBtn>
                  </div>
                )}
                {!disableShareButton && (
                  <div>
                    <MenuBtn onClick={this.shareOnTwitter}>
                      <span>{__('share', this.props.customLocale)}</span>{' '}
                      <TwitterIcon />
                    </MenuBtn>
                  </div>
                )}
              </div>
            )}
          </div>
          {comment.reactions && (
            <span className={cls(s.reactionsCount, s.fontBody2)}>
              {reactionsCount}
            </span>
          )}
          {comment.reactions && (
            <div
              className={cls(
                s.reactions,
                s[`reactions${topReactions.length}`],
                s.fontBody2,
              )}
            >
              {topReactions.map((r, i) => {
                const _Reaction = reactions.find((_r) => _r.id === r.id);
                const n = i + (3 - topReactions.length);
                return (
                  <span
                    title={`${_Reaction.name}: ${r.value}`}
                    className={cls(s.reactionContainer, s[`reaction${n}`])}
                  >
                    <_Reaction.icon />
                  </span>
                );
              })}
            </div>
          )}
        </div>

        {comment.formOpened && (
          <Form
            form={forms[comment.formIdx]}
            formIdx={comment.formIdx}
            replyToComment={comment}
          />
        )}
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

const WrapperComment = (origProps) => (
  <Connect mapToProps={mapToProps} actions={actions}>
    {(props) => <Comment {...props} {...origProps} />}
  </Connect>
);

export default WrapperComment;
