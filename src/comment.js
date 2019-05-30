import { h, render, Component } from 'preact';

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
import { getCommentDate, getCommentUrl } from './comment-utils';

import Form from './form';

const WrapperComment = (origProps) => (
  <Connect mapToProps={mapToProps} actions={actions}>
    {(props) => <Comment {...props} {...origProps} />}
  </Connect>
);

export default WrapperComment;

const mapToProps = (state, props) => {
  return {
    commentsIndex: state.commentsIndex,
  };
};

import s from './style.css';
import cls from 'classnames';

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

  render({ comment, commentsIndex, first, level }) {
    return (
      <div
        key={comment.commentId}
        className={cls(s.comment, s.fontBody2, {
          [s.first]: first,
          [s.deep]: level >= 5,
        })}
        id={`jc${comment.commentId}`}
      >
        <div className={cls(s.bubble, { [s.active]: comment.active })}>
          <div className={s.userPic}>
            {comment.userPic ? <img src={comment.userPic} /> : <Anonymous />}
          </div>
          <div className={s.title}>
            <div>
              <span className={cls(s.username, s.fontHeading4)}>
                {comment.username}
              </span>
              <br />
              <a
                onClick={this.onCommentLinkClick}
                href={getCommentUrl(comment)}
                className={cls(s.date, s.fontBody3)}
              >
                {getCommentDate(comment)}
              </a>
              {comment.replyTo && commentsIndex && (
                <a
                  className={cls(s.date, s.fontBody3)}
                  onClick={this.onReplyCommentLinkClick}
                  href={getCommentUrl(commentsIndex[comment.replyTo])}
                >
                  <ReplyIcon />
                  {commentsIndex[comment.replyTo].username}
                </a>
              )}
            </div>
            <div className={s.collapse}>
              <button onClick={this.onToggleComment} className={s.btn}>
                {comment.collapsed ? <CollapseIcon /> : <UncollapseIcon />}
              </button>
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
              className={cls(s['link-btn'], s.fontButton2)}
            >
              Reply
            </button>
          </div>
          {/*<div className={s.like}>
            <button onClick={this.onToggleLikeMenu} className={s['link-btn']}>
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
              className={cls(s['link-btn'], s.fontButton2)}
            >
              ⋯
            </button>
            {comment.menuOpened && (
              <div className={s.menu}>
                <div>
                  <button
                    onClick={this.onCopyToClipboard}
                    className={cls(s['menu-button'], s.fontBody3)}
                  >
                    copy link
                  </button>
                </div>
                <div>
                  <button
                    onClick={this.shareOnFb}
                    className={cls(s['menu-button'], s.fontBody3)}
                  >
                    share on <FacebookIcon />
                  </button>
                </div>
                <div>
                  <button
                    onClick={this.shareOnTwitter}
                    className={cls(s['menu-button'], s.fontBody3)}
                  >
                    <span>share on</span> <TwitterIcon />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {comment.formOpened && <Form replyToComment={comment} />}
        {!comment.collapsed &&
          (comment.nested || []).map((c, i) => (
            <WrapperComment level={level + 1} first={i === 0} comment={c} />
          ))}
      </div>
    );
  }
}
