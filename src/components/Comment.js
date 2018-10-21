import { h, render, Component } from 'preact';
import { CommentsForm } from './CommentsForm';
import { CommentButton } from './CommentButton';
import { UserPic } from './UserPic';
import { Username } from './Username';
import { ReplyToLink } from './ReplyToLink';
import { CommentDateLink } from './CommentDateLink';
import { CommentContent } from './CommentContent';
import getCommentUrl from '../utils/getCommentUrl';
import ago from '../utils/ago';
import { Conditional } from './Conditional';
import { openPopup } from '../utils/popup';
import { c, m } from '../utils/style';

export class Comment extends Component {
  constructor({ theme }) {
    super();
    this.state = {
      displayReplyForm: false,
      displayShareLinks: false,
      shareUrl: null,
    };
    this.highlightStyle = c(
      `{
      animation: jcHighlightComment 3s;
    }`,
      `@keyframes jcHighlightComment {
      0% {
        background: #ebf7ed;
      }
      100% {
        background: none;
      }
    }`,
    );
  }

  render(props, state) {
    const { comment, highlight, renderReplyForm, disableReply } = props;
    const { displayReplyForm } = state;
    return (
      <div
        className={
          containerStyle +
          ' ' +
          (highlight ? this.highlightStyle : '') +
          ' ' +
          (levelStyles[comment.level] ? levelStyles[comment.level] : '')
        }
        key={comment.commentId}
        id={'jc' + comment.commentId}
      >
        <UserPic
          theme={props.theme}
          href={comment.userUrl}
          src={comment.userPic}
          username={comment.username}
        />
        <div className={bodyStyle}>
          <div className={headerStyle}>
            <Username
              theme={props.theme}
              link={comment.userUrl}
              username={
                comment.hidden
                  ? __('usernameRemoved')
                  : String(comment.username)
              }
            />
            <CommentDateLink
              theme={props.theme}
              onClick={() => {
                this.props.onHighlight(comment.commentId);
              }}
              rawDate={comment.createdAt}
              date={ago(comment.createdAt)}
              link={getCommentUrl(comment)}
            />
            <Conditional
              if={comment.replyToComment}
              do={() => (
                <ReplyToLink
                  theme={props.theme}
                  onClick={() => {
                    this.props.onHighlight(comment.replyToComment.commentId);
                  }}
                  className={linkStyle}
                  link={getCommentUrl(comment.replyToComment)}
                  text={comment.replyToComment.username}
                />
              )}
            />
          </div>
          <Conditional
            if={comment.hidden}
            do={() => (
              <span className={messageHiddenStyle}>
                {__('commentRemovedByModerator')}
              </span>
            )}
          />
          <Conditional
            if={!comment.hidden}
            do={() => (
              <CommentContent
                theme={props.theme}
                content={
                  <div
                    dangerouslySetInnerHTML={{
                      __html: comment.htmlMessage,
                    }}
                  />
                }
              />
            )}
          />
          <div className={footerStyle}>
            <Conditional
              if={!comment.hidden && !disableReply}
              do={() => (
                <CommentButton
                  theme={props.theme}
                  className={buttonStyle}
                  label={__('reply')}
                  onClick={() => {
                    this.setState({
                      displayReplyForm: !this.state.displayReplyForm,
                    });
                  }}
                />
              )}
            />
            <Conditional
              if={!comment.hidden}
              do={() => (
                <CommentButton
                  theme={props.theme}
                  className={buttonStyle}
                  label={__('share')}
                  onClick={() => this.share(getCommentUrl(comment))}
                />
              )}
            />
            <Conditional
              if={this.state.displayShareLinks}
              do={() => <span className={viaStyle}>via</span>}
            />
            <Conditional
              if={this.state.displayShareLinks}
              do={() => (
                <CommentButton
                  theme={props.theme}
                  className={shareButtonStyle}
                  label={'Twitter'}
                  onClick={() =>
                    openPopup(
                      `https://twitter.com/intent/tweet?url=${
                        this.state.shareUrl
                      }`,
                    )
                  }
                />
              )}
            />
            <Conditional
              if={this.state.displayShareLinks}
              do={() => (
                <CommentButton
                  theme={props.theme}
                  className={shareButtonStyle}
                  label={'Facebook'}
                  onClick={() =>
                    openPopup(
                      `http://facebook.com/sharer.php?s=100&p[url]=${
                        this.state.shareUrl
                      }`,
                    )
                  }
                />
              )}
            />
          </div>
          <Conditional
            if={displayReplyForm}
            do={() =>
              renderReplyForm(() =>
                this.setState({
                  displayReplyForm: false,
                }),
              )
            }
          />
        </div>
      </div>
    );
  }

  share(url) {
    this.setState({
      displayShareLinks: !this.state.displayShareLinks,
      shareUrl: encodeURIComponent(url),
    });
  }
}

const linkStyle = c(`{
  padding: 0;
  background-color: initial;
}
:hover {
  padding: 0;
  background-color: initial;
  color: initial;
}`);

const containerStyle = c(`{
  padding-top: 10px;
  padding-bottom: 10px;
  box-sizing: inherit;
  display: flex;
  align-items: flex-start;
}
> * {
  flex-shrink: 0;
}`);

const bodyStyle = c(`{
  width: calc(100% - 64px);
}`);

const headerStyle = c(`{
  position: relative;
  box-sizing: inherit;
  display: flex;
  width: 100%;
  align-items: baseline;
  flex-wrap: wrap;
}
:after {
  content: " ";
  display: block;
  height: 0;
  clear: both;
  box-sizing: inherit;
}
> * {
  margin-right: 15px;
}`);

const buttonStyle = c(`{
  position: relative;
  margin-right: 10px;
  margin-left: 1px;
  margin-bottom: 1px;
}`);

const viaStyle = c(`{
  position: relative;
  margin-right: 5px;
  margin-left: 1px;
  margin-bottom: 1px;
}`);

const shareButtonStyle = c(`{
  position: relative;
  margin-right: 5px;
  margin-left: 1px;
  margin-bottom: 1px;
}`);

const messageHiddenStyle = c(`{
  font-style: italic;
  color: #595959;
}`);

const replyFormStyle = c(`{
  margin-top: 10px;
}`);

const footerStyle = c(`{
  line-height: 1;
}`);

const levelStyles = buildStylesForCommentLevels();

function buildStylesForCommentLevels(argument) {
  const levelStyles = {};
  for (let i = 1; i <= 5; i++) {
    levelStyles[i] = m(`{ margin-left: calc(54px * ${i}); }`, [
      {
        media: `@media (min-width: 320px) and (max-width: 480px)`,
        css: `{ margin-left: calc(10px * ${i}); }`,
      },
      {
        media: `@media (min-width: 1px) and (max-width: 320px)`,
        css: `{ margin-left: calc(5px * ${i}); }`,
      },
    ]);
  }
  return levelStyles;
}
