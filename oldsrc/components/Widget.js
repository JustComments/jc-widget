import { h, render, Component } from 'preact';
import extractDataFromURL from '../utils/extractDataFromURL';
import createGuestJWT from '../utils/createGuestJWT';
import commentsInThreads from '../utils/commentsInThreads';
import { CommentsForm } from './CommentsForm';
import { Comment } from './Comment';
import { LoadMoreButton } from './LoadMoreButton';
import { Attribution } from './Attribution';
import { Recaptcha } from './Recaptcha';
import jwtDecode from 'jwt-decode';
import { c, sync } from '../utils/style';
import { Conditional } from './Conditional';
import { setJWT } from '../utils/session';
import { CommentCollection } from '../models/CommentCollection';
import { Comment as CommentModel } from '../models/Comment';

const defaultTheme = {
  buttons: {
    primaryColor: 'white',
    primaryBgColor: '#2f5984',
    primaryColorAlt: '#21405e',
    secondaryColor: '#595959',
    secondaryBgColor: '#333',
    secondaryColorAlt: '#135784',
    disabledBgColor: '#D3D3D3',
  },
  text: {
    primaryColor: '#333',
    primaryColorAlt: '#135784',
    secondaryColor: '#595959',
    secondaryColorAlt: '#135784',
  },
  borderColor: '#dedede',
  backgroundColor: 'white',
  outlineStyle: '2px dotted #595959',
  avatar: {
    borderRadius: '50%',
    backgroundColor: '#D3D3D3',
    color: 'grey',
  },
};

const darkTheme = {
  buttons: {
    primaryColor: 'white',
    primaryBgColor: 'rgba(0,0,0,.4)',
    primaryColorAlt: 'rgba(0,0,0,.6)',
    secondaryColor: 'hsla(0, 0%, 100%, .6)',
    secondaryBgColor: 'transparent',
    secondaryColorAlt: 'hsla(0, 0%, 100%, .3)',
    disabledBgColor: 'grey',
  },
  text: {
    primaryColor: 'hsla(0, 0%, 100%, 1)',
    primaryColorAlt: 'hsla(0, 0%, 100%, .4)',
    secondaryColor: 'hsla(0, 0%, 100%, .6)',
    secondaryColorAlt: 'hsla(0, 0%, 100%, .3)',
  },
  borderColor: '#2c2c57',
  backgroundColor: '#2c2c57',
  outlineStyle: '2px dotted #595959',
  avatar: {
    borderRadius: '50%',
    backgroundColor: '#D3D3D3',
    color: 'grey',
  },
};

const themes = {
  default: defaultTheme,
  dark: darkTheme,
};

export class Widget extends Component {
  constructor(props) {
    super(props);
    this.state = {
      session: props.session,
      jumpToComment: props.jumpToComment,
      commentCollection: new CommentCollection([], null, 'asc'),
      loading: true,
      jumped: false,
    };
    this.theme = themes[props.theme] || window[props.theme];
    this.commentsStyle = c(`{
      margin: 0 auto;
      font-size: 1rem;
      line-height: 1.6;
      box-sizing: border-box;
      color: ${this.theme.text.primaryColor};
    }`);
  }

  checkCaptcha() {
    if (!this.recaptcha) {
      return Promise.resolve();
    }
    return this.recaptcha.check();
  }

  render(props, state) {
    const { allowGuests, disableSocialLogin, disableLoadMore, sort } = props;
    const { session, loading, commentCollection, jumpToComment } = state;
    const shouldRenderForm =
      session.isAuthenticated() || (!session.isAuthenticated() && allowGuests);
    const shouldRenderFormBefore = shouldRenderForm && sort === 'desc';
    const shouldRenderFormAfter = shouldRenderForm && sort === 'asc';
    const count = commentCollection.count();
    return (
      <div className={this.commentsStyle}>
        <CommentsHeader
          theme={this.theme}
          count={count}
          hasMore={commentCollection.hasMore()}
        />
        <Conditional
          if={shouldRenderFormBefore}
          do={() => this.renderCommentsForm({ session })}
        />
        <Conditional if={loading} do={() => <Loading />} />
        <Conditional
          if={!loading}
          do={() => {
            return (
              <div key="content" className={contentStyle}>
                {commentCollection.map(this.renderComment.bind(this))}
                <Conditional
                  if={count == 0}
                  do={() => <p>{__('noComments')}</p>}
                />
                <Conditional
                  if={commentCollection.hasMore() && !disableLoadMore}
                  do={() => (
                    <LoadMoreButton
                      theme={this.theme}
                      onClick={(...args) => this.onLoadMore(...args)}
                    />
                  )}
                />
              </div>
            );
          }}
        />
        <Conditional
          if={this.props.recaptchaSitekey}
          do={() => (
            <Recaptcha
              sitekey={this.props.recaptchaSitekey}
              ref={(c) => (this.recaptcha = c)}
            />
          )}
        />
        <Conditional
          if={shouldRenderFormAfter}
          do={() => this.renderCommentsForm({ session })}
        />
        <Conditional
          if={!this.props.hideAttribution}
          do={() => <Attribution theme={this.theme} />}
        />
      </div>
    );
  }

  renderComment(comment) {
    const { jumpToComment, session } = this.state;
    const {
      allowGuests,
      disableProfilePictures,
      disableShareButton,
    } = this.props;
    if (comment.isThreadHidden()) {
      return null;
    }
    return (
      <Comment
        key={comment.commentId}
        comment={comment}
        theme={this.theme}
        disableProfilePictures={disableProfilePictures}
        highlight={jumpToComment === comment.commentId}
        onHighlight={(jumpToComment) =>
          this.setState({ jumpToComment, jumped: false })
        }
        disableReply={!allowGuests && !session.isAuthenticated()}
        disableShareButton={disableShareButton}
        renderReplyForm={(onClose) => {
          return this.renderCommentsForm({
            onClose,
            replyToComment: comment,
            parentId: comment.parentId || comment.commentId,
            session: this.state.session,
          });
        }}
      />
    );
  }

  renderCommentsForm({ replyToComment, parentId, onClose, session }) {
    const {
      allowGuests,
      disableSocialLogin,
      enableWebsite,
      enableEmailNotifications,
      disableProfilePictures,
    } = this.props;
    return (
      <div className={formStyle}>
        <CommentsForm
          theme={this.theme}
          twitterCallback={this.props.twitterCallback}
          twitterRedirect={this.props.twitterRedirect}
          getTwitterRedirectUrl={this.props.getTwitterRedirectUrl}
          disableSocialLogin={disableSocialLogin}
          loginProvider={session.get('loginProvider')}
          userPic={session.get('userPic')}
          guestForm={allowGuests && !session.isAuthenticated()}
          replyToComment={replyToComment}
          username={session.get('username')}
          email={session.get('userEmail')}
          website={session.get('website')}
          notifications={
            session.get('notifications') && !!session.get('subscription')
          }
          emailNotifications={session.get('emailNotifications')}
          enableEmailNotifications={enableEmailNotifications}
          hasSubscription={!!session.get('subscription')}
          parentId={parentId}
          enableWebsite={enableWebsite}
          onSend={(...args) => {
            return this.createComment(...args).then(() => {
              if (onClose) {
                return onClose();
              }
              return Promise.resolve();
            });
          }}
          onLogin={(newJwt) => {
            setJWT(session, newJwt, 'twitter');
            this.setState({
              session: session.clone(),
            });
          }}
          onLogout={() => {
            session.clear();
            this.setState({
              session: session.clone(),
            });
          }}
          onSubscription={(newSubscription) => {
            session.set('subscription', newSubscription);
            this.setState({
              session: session.clone(),
            });
          }}
          checkCaptcha={this.checkCaptcha.bind(this)}
          disableProfilePictures={disableProfilePictures}
        />
      </div>
    );
  }

  componentDidMount() {
    const { getComments } = this.props;
    const { commentCollection } = this.state;
    getComments(commentCollection.getCursor()).then((commentCollection) => {
      this.setState({
        loading: false,
        commentCollection,
      });
    });
    sync();
  }

  loadMore() {
    const { getComments } = this.props;
    const { commentCollection } = this.state;
    getComments(commentCollection.getCursor()).then((loadedComments) => {
      this.setState({
        loading: false,
        commentCollection: commentCollection.merge(loadedComments),
      });
    });
  }

  componentDidUpdate() {
    const { jumpToComment, jumped, lastKey } = this.state;
    if (!jumped && jumpToComment) {
      setTimeout(() => {
        if (!document.getElementById('jc' + jumpToComment)) {
          console.log(
            'Could not scroll: ' + '#jc' + jumpToComment + ' not found',
          );
          if (lastKey) {
            this.loadMore();
          }
          return;
        }
        document.getElementById('jc' + jumpToComment).scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'center',
        });
        this.setState({
          jumped: true,
        });
      }, 50);
    }
    sync();
  }

  createComment({
    text,
    username,
    website,
    email,
    replyToComment,
    parentId,
    captchaResult,
    notifications,
    emailNotifications,
  }) {
    const { saveComment, itemProtocol, itemPort, allowGuests } = this.props;
    const { session } = this.state;

    if (!session.isAuthenticated() && allowGuests) {
      session.set('username', username);
      session.set('userEmail', email);
      session.set('website', website);
    }

    session.set('notifications', notifications);
    session.set('emailNotifications', emailNotifications);

    const jwt = session.get('jwt')
      ? session.get('jwt')
      : createGuestJWT(username, email, this.props.apiKey);
    console.log(jwt);
    return saveComment(jwt, {
      itemProtocol,
      itemPort,
      message: text,
      website,
      replyToComment,
      parentId,
      captchaResult,
      subscription:
        notifications && session.get('subscription')
          ? session.get('subscription')
          : null,
      emailNotifications,
    }).then((comment) => {
      this.setState({
        commentCollection: this.state.commentCollection.addComment(
          new CommentModel({
            ...comment,
          }),
        ),
        jumpToComment: comment.commentId,
        jumped: false,
      });
    });
  }

  onLoadMore() {
    this.loadMore();
  }
}

class CommentsHeader extends Component {
  constructor(props, ...args) {
    super(props, ...args);
    const { theme } = props;
    this.headerStyle = c(`{
      font-size: inherit;
      box-sizing: inherit;
      color: ${theme.text.primaryColor};
    }`);
    this.headerH3Style = c(`{
      font-size: 22px;
      box-sizing: inherit;
      line-height: 1.4;
      margin: .5em 0;
      font-weight: bold;
      color: ${theme.text.primaryColor};
    }`);
  }

  render({ count, hasMore }) {
    const text = __('comments');
    const countText = count > 0 ? ` (${count}${hasMore ? '+' : ''})` : ``;
    return (
      <div className={`${this.headerStyle} jcCommentsHeader`}>
        <h3 className={this.headerH3Style}>
          {text}
          {countText}
        </h3>
      </div>
    );
  }
}

class Loading extends Component {
  render() {
    return <div className={loadingStyle}>{__('loadingComments')}</div>;
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

const contentStyle = c(`{
  font-size: inherit;
  box-sizing: inherit;
  font-size: 15px;
}`);

const loadingStyle = c(
  `{
  font-size: 15px;
}
:after {
  overflow: hidden;
  display: inline-block;
  vertical-align: bottom;
  -webkit-animation: ellipsis steps(4,end) 900ms infinite;
  animation: ellipsis steps(4,end) 900ms infinite;
  content: "\\2026"; /* ascii code for the ellipsis character */
  width: 0px;
  box-sizing: inherit;
}`,
  `@keyframes ellipsis {
  to {
    width: 1.25em;
  }
}

@-webkit-keyframes ellipsis {
  to {
    width: 1.25em;
  }
}`,
);

const formStyle = c(`{
  padding-top: 15px;
  max-width: 780px;
  box-sizing: inherit;
  margin-bottom: 35px;
}`);
