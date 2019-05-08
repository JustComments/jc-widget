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

  render({ comment, commentsIndex, first }) {
    return (
      <div
        key={comment.commentId}
        className={cls(s.comment, { [s.first]: first })}
        id={`jc${comment.commentId}`}
      >
        <div className={cls(s.bubble, { [s.active]: comment.active })}>
          <div className={s.userPic}>
            {comment.userPic ? <img src={comment.userPic} /> : <Anonymous />}
          </div>
          <div className={s.title}>
            <div>
              <span className={s.username}>{comment.username}</span>
              <br />
              <a
                onClick={this.onCommentLinkClick}
                href={getCommentUrl(comment)}
                className={s.date}
              >
                {getCommentDate(comment)}
              </a>
              {comment.replyTo && commentsIndex && (
                <a
                  className={s.date}
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
              className={s.content}
              dangerouslySetInnerHTML={{ __html: comment.htmlContent }}
            />
          )}
        </div>
        <div className={s.buttons}>
          <div className={s.reply}>
            <button
              onClick={this.onToggleCommentForm}
              className={s['link-btn']}
            >
              Reply
            </button>
          </div>
          <div className={s.like}>
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
          </div>
          <div className={s.more}>
            <button onClick={this.onToggleMenu} className={s['link-btn']}>
              ⋯
            </button>
            {comment.menuOpened && (
              <div className={s.menu}>
                <div>
                  <button
                    onClick={this.onCopyToClipboard}
                    className={s['menu-button']}
                  >
                    copy link
                  </button>
                </div>
                <div>
                  <button onClick={this.shareOnFb} className={s['menu-button']}>
                    share on <FacebookIcon />
                  </button>
                </div>
                <div>
                  <button
                    onClick={this.shareOnTwitter}
                    className={s['menu-button']}
                  >
                    <span>share on</span> <TwitterIcon />
                  </button>
                </div>
                {/*<div>
                  <button className={s.menu-button}>report</button>
                </div>*/}
              </div>
            )}
          </div>
          <div className={s.rating} />
        </div>

        {comment.formOpened && <Form replyToComment={comment} />}
        {!comment.collapsed &&
          (comment.nested || []).map((c, i) => (
            <WrapperComment first={i === 0} comment={c} />
          ))}
      </div>
    );
  }
}
