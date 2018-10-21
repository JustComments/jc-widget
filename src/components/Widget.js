import { h, render, Component } from 'preact';
import extractDataFromURL from '../utils/extractDataFromURL';
import createGuestJWT from '../utils/createGuestJWT';
import commentsInThreads from '../utils/commentsInThreads';
import { CommentsForm } from './CommentsForm';
import { LoadMoreButton } from './LoadMoreButton';
import { Comment } from './Comment';
import { Attribution } from './Attribution';
import { Recaptcha } from './Recaptcha';
import jwtDecode from 'jwt-decode';
import { c, sync } from '../utils/style';
import { Conditional } from './Conditional';
import { setJWT } from '../utils/session';

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
    primaryColor: 'hsla(0, 0%, 100%, .8)',
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

export class Widget extends Component {
  constructor(props) {
    super(props);
    this.state = {
      count: 0,
      loading: true,
      comments: [],
      lastKey: null,
      jumpToComment: props.jumpToComment,
      jumped: false,
      session: props.session,
    };
    this.theme = props.theme === 'dark' ? darkTheme : defaultTheme;
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
    const { session, loading, comments, lastKey, jumpToComment } = state;
    const shouldRenderForm =
      session.isAuthenticated() || (!session.isAuthenticated() && allowGuests);

    const count = comments.filter(
      (c) =>
        !c.hidden ||
        (c.hidden &&
          c.nestedCommentsContent.filter((nc) => !nc.hidden).length > 0),
    ).length;

    const shouldRenderFormBefore = shouldRenderForm && sort === 'desc';
    const shouldRenderFormAfter = shouldRenderForm && sort === 'asc';
    return (
      <div className={this.commentsStyle}>
        <CommentsHeader count={count} hasMore={!!lastKey} />
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
                {comments.map(this.renderComment.bind(this))}
                <Conditional
                  if={count == 0}
                  do={() => <p>{__('noComments')}</p>}
                />
                <Conditional
                  if={lastKey && !disableLoadMore}
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
    const jumpToComment = this.state.jumpToComment;
    const allowGuests = this.props.allowGuests;
    if (
      comment.hidden &&
      (comment.nestedCommentsContent || []).every(
        (nested) => nested.hidden === true,
      )
    ) {
      return null;
    }
    return (
      <Comment
        key={comment.commentId}
        comment={comment}
        theme={this.theme}
        highlight={jumpToComment === comment.commentId}
        onHighlight={(jumpToComment) =>
          this.setState({ jumpToComment, jumped: false })
        }
        disableReply={!allowGuests && !session.isAuthenticated()}
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
        />
      </div>
    );
  }

  componentDidMount() {
    const { getComments } = this.props;
    getComments(this.state.lastKey).then((json) => {
      this.setState({
        loading: false,
        comments: json.comments,
        lastKey: json.lastKey,
      });
    });
    sync();
  }

  loadMore() {
    const { getComments } = this.props;
    getComments(this.state.lastKey).then((json) => {
      this.setState({
        loading: false,
        comments: this.state.comments.concat(json.comments),
        lastKey: json.lastKey,
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

    return saveComment(session.get('jwt'), {
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
    })
      .then((comment) => {
        this.setState({
          comments: commentsInThreads(
            [...this.state.comments, comment],
            this.props.sort,
          ),
          jumpToComment: comment.commentId,
          jumped: false,
        });
      })
      .catch((err) => {
        if (err.message.startsWith('403')) {
          this.setState({
            isAuthorized: false,
            jwt: undefined,
          });
        }
        throw err;
      });
  }

  onLoadMore() {
    this.loadMore();
  }
}

class CommentsHeader extends Component {
  render({ count, hasMore }) {
    const text = __('comments');
    const countText = count > 0 ? ` (${count}${hasMore ? '+' : ''})` : ``;
    return (
      <div className={`${headerStyle} jcCommentsHeader`}>
        <h3 className={headerH3Style}>
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

const headerStyle = c(`{
  font-size: inherit;
  box-sizing: inherit;
}`);

const headerH3Style = c(`{
  font-size: 22px;
  box-sizing: inherit;
  line-height: 1.4;
  margin: .5em 0;
  font-weight: bold;
}`);

const formStyle = c(`{
  padding-top: 15px;
  max-width: 780px;
  box-sizing: inherit;
  margin-bottom: 35px;
}`);
