import { h, render, Component } from 'preact';
import { c } from '../utils/style';
import { TwitterSignIn } from './TwitterSignIn';
import { supportsServiceWorkers } from '../utils/featureDetection';
import { LocalStorage } from '../utils/localStorage';
import { Toggle } from './Toggle';
import { Conditional } from './Conditional';
import { UserPic } from './UserPic';
import { Center } from './Center';

import substitute from '../utils/substitute';

import bellIcon from './icons/bellIcon';
import envelopeIcon from './icons/envelopeIcon';
import twitterIcon from './icons/twitter';

export class CommentsForm extends Component {
  constructor(props, ...args) {
    super(props, ...args);
    this.state.text = '';
    this.state.website = props.website;
    this.state.email = props.email;
    this.state.username = props.username;
    this.state.notifications = props.notifications;
    this.state.emailNotifications = props.emailNotifications;
    this.state.errors = null;
    this.state.blocked = false;
    this.state.dirty = false;

    this.sendStyle = c(`{
      display: inline-block;
      padding: 3px 9px;
      line-height: 1.8;
      box-shadow: none;
      border-radius: 0;

      color: ${props.theme.buttons.primaryColor};
      background-color: ${props.theme.buttons.primaryBgColor};
      text-shadow: -1px 1px ${props.theme.buttons.primaryBgColor};
      border: none;

      font-family: inherit;
      font-size: 15px;
      box-sizing: border-box;

      min-width: 100px;
      height: 33px;
    }
    :hover {
      background-color: ${props.theme.buttons.primaryColorAlt};
      text-shadow: -1px 1px ${props.theme.buttons.primaryColorAlt};
      cursor: pointer;
    }
    :active {
      background-color: ${props.theme.buttons.primaryColorAlt};
      text-shadow: -1px 1px ${props.theme.buttons.primaryColorAlt};
    }
    :focus {
      outline: ${props.theme.outlineStyle};
    }`);

    this.textareaContainerStyle = c(`{
      border: 1px solid ${props.theme.borderColor};
      border-radius: 2px;
      padding: 10px;
      position: relative;
      background-color: ${props.theme.backgroundColor};
      box-sizing: border-box;
    }`);

    this.jcTextInputStyle = c(`{
      display: block;
      width: 100%;
      resize: vertical;
      margin: 0;
      border: 1px solid ${props.theme.borderColor};
      border-radius: 2px;
      padding: 5px 10px;
      line-height: 22px;
      box-sizing: border-box;
      font-family: inherit;
      font-size: 15px;
      position: relative;
      color: ${props.theme.text.primaryColor};
      background-color: ${props.theme.backgroundColor};
    }
    :invalid {
      box-shadow: none;
    }`);

    this.textareaStyle = c(`{
      display: block;
      border: none;
      outline: none;
      width: 100%;
      margin: 0;
      padding: 0;
      line-height: 22px;
      box-sizing: border-box;
      font-family: inherit;
      font-size: 15px;
      overflow: hidden;
      resize: none;
      min-height: 120px;
      color: ${props.theme.text.primaryColor};
      background-color: ${props.theme.backgroundColor};
    }
    :invalid {
      box-shadow: none;
    }`);

    this.dirtyStyle = c(`:invalid {
      border: 1px solid red;
    }`);
  }

  callbackTwitter(data) {
    const { twitterCallback } = this.props;
    twitterCallback(data).then(({ jwt }) => {
      this.props.onLogin(jwt, 'twitter');
    });
  }

  onTwitter() {
    const { twitterRedirect } = this.props;
    const popup = window.open(
      '',
      '_blank',
      'location=yes,height=600,width=800,scrollbars=yes,status=yes',
    );
    LocalStorage.set('jcAuth', true);
    const handler = (e) => {
      if (e.key === 'jcOauthTokenVerifier' && e.newValue) {
        const tokenVerifier = e.newValue;
        window.removeEventListener('storage', handler);
        const token = LocalStorage.get('jcOauthToken');
        const tokenSecret = LocalStorage.get('jcOauthTokenSecret');
        this.callbackTwitter({
          token,
          tokenSecret,
          tokenVerifier,
        });
      }
    };
    window.addEventListener('storage', handler);
    popup.location.href = twitterRedirect(window.location.href);
    popup.focus();
  }

  onPushNotifications(checked) {
    this.setState({
      notifications: checked,
    });

    if (!this.props.hasSubscription) {
      if (checked) {
        const popup = window.open(
          '',
          '_blank',
          'location=yes,height=600,width=800,scrollbars=yes,status=yes',
        );
        LocalStorage.set('jcPush', true);
        const handler = (e) => {
          if (e.key === 'jcPushSubscription' && e.newValue) {
            const jcPushSubscription = e.newValue;
            window.removeEventListener('storage', handler);
            this.props.onSubscription(jcPushSubscription);
          }
          LocalStorage.delete('jcPushSubscription');
        };
        window.addEventListener('storage', handler);
        popup.location.href = `${PUSH_URL}#${encodeURIComponent(
          window.location.href,
        )}`;
        popup.focus();
      }
    }
  }

  onEmailNotifications(checked) {
    this.setState({
      emailNotifications: checked,
    });
  }

  render(props, state) {
    const {
      userPic,
      guestForm,
      replyToComment,
      parentId,
      disableSocialLogin,
      loginProvider,
      enableWebsite,
      enableEmailNotifications,
      disableProfilePictures,
      theme,
    } = props;
    const { errors, dirty } = state;
    return (
      <div className={containerStyle}>
        {!disableProfilePictures ? (
          <div className={leftColumnStyle}>
            <UserPic theme={theme} src={userPic} alt="your picture" />
            <button
              className={loginViaStyle}
              title={'clear'}
              onClick={() => this.props.onLogout()}
            >
              {this.renderLoginProvider(loginProvider)}
            </button>
          </div>
        ) : null}
        <form
          className={rightColumnStyle + ' ' + formStyle}
          ref={(ref) => {
            this.form = ref;
          }}
        >
          <Conditional
            if={guestForm}
            do={() => (
              <div className={formRowStyle}>
                <input
                  placeholder={__('name')}
                  aria-label={__('name')}
                  value={state.username}
                  className={`${this.jcTextInputStyle} ${
                    dirty ? this.dirtyStyle : ''
                  } jcTextInput`}
                  required={true}
                  max={255}
                  onInput={(e) => this.setState({ username: e.target.value })}
                />
                <Conditional
                  if={LocalStorage.supported() && !disableSocialLogin}
                  do={() => (
                    <TwitterSignIn
                      title="Sign your comment with Twitter"
                      theme={theme}
                      onClick={() => this.onTwitter()}
                    />
                  )}
                />
              </div>
            )}
          />
          <Conditional
            if={guestForm}
            do={() => (
              <div className={formRowStyle}>
                <input
                  placeholder={__('email')}
                  aria-label={__('email')}
                  value={state.email}
                  type={'email'}
                  className={`${this.jcTextInputStyle} ${
                    dirty ? this.dirtyStyle : ''
                  } jcTextInput`}
                  max={255}
                  onInput={(e) => this.setState({ email: e.target.value })}
                />
              </div>
            )}
          />
          <Conditional
            if={guestForm && enableWebsite}
            do={() => (
              <div className={formRowStyle}>
                <input
                  placeholder={__('website')}
                  aria-label={__('website')}
                  type={'url'}
                  value={state.website}
                  className={`${this.jcTextInputStyle} ${
                    dirty ? this.dirtyStyle : ''
                  } jcTextInput`}
                  onInput={(e) => this.setState({ website: e.target.value })}
                />
              </div>
            )}
          />
          <div className={this.textareaContainerStyle + ' jcTextareaContainer'}>
            <textarea
              placeholder={
                (replyToComment
                  ? substitute(__('replyTo'), {
                      name: replyToComment.username,
                    })
                  : __('writeAComment')) +
                ' (' +
                __('ctrlEnterToSend') +
                ')'
              }
              aria-label={
                (replyToComment
                  ? substitute(__('replyTo'), {
                      name: replyToComment.username,
                    })
                  : __('writeAComment')) +
                ' (' +
                __('ctrlEnterToSend') +
                ')'
              }
              value={state.text}
              required={true}
              className={`${this.textareaStyle} jcTextInput`}
              onInput={(e) => this.setState({ text: e.target.value })}
              onKeyUp={(e) => {
                const element = e.target;
                element.style.height = '5px';
                element.style.height = element.scrollHeight + 'px';
              }}
              onKeyDown={(e) => {
                if (e.ctrlKey && e.keyCode == 13) {
                  this.onSendClick(e);
                } else if (e.metaKey && e.keyCode == 13) {
                  this.onSendClick(e);
                }
              }}
            />
            {errors ? (
              <div className={errorMsgStyle}>
                {Object.keys(errors).map((errorKey) => {
                  return h('p', {}, [errors[errorKey]]);
                })}
              </div>
            ) : null}
            <div className={panelStyle}>
              <button
                tabindex={0}
                role={'button'}
                className={`${this.sendStyle} jcSendCommentButton`}
                onClick={this.onSendClick.bind(this)}
                disabled={this.state.blocked ? 'disabled' : ''}
              >
                {this.state.blocked ? __('sending') : __('send')}
              </button>
              <div className={toggleContainerStyle}>
                <Conditional
                  if={enableEmailNotifications}
                  do={() => (
                    <Toggle
                      theme={theme}
                      svg={envelopeIcon}
                      title={__('toggleNotificationsEmail')}
                      checked={this.state.emailNotifications}
                      onChange={(checked) => {
                        this.onEmailNotifications(checked);
                      }}
                    />
                  )}
                />

                <Conditional
                  if={supportsServiceWorkers()}
                  do={() => (
                    <Toggle
                      theme={theme}
                      svg={bellIcon}
                      title={__('toggleNotificationsPush')}
                      checked={this.state.notifications}
                      onChange={(checked) => {
                        this.onPushNotifications(checked);
                      }}
                    />
                  )}
                />
              </div>
            </div>
          </div>
        </form>
      </div>
    );
  }

  onSendClick(e) {
    e.preventDefault();
    this.setState({
      dirty: true,
      blocked: true,
    });
    const valid = this.form.checkValidity();
    if (!valid) {
      this.setState({
        blocked: false,
      });
      return false;
    }

    this.props.checkCaptcha().then((captchaResult) => {
      this.props
        .onSend({
          ...this.state,
          replyToComment: this.props.replyToComment,
          parentId: this.props.parentId,
          captchaResult,
        })
        .then(() => {
          this.setState({
            blocked: false,
            text: '',
            errors: null,
          });
        })
        .catch((error) => {
          console.log(error);
          this.setState({
            blocked: false,
            errors: {
              form: __('networkError'),
            },
          });
        });
    });
    return false;
  }

  renderLoginProvider(provider) {
    switch (provider) {
      case 'twitter':
        return twitterIcon;
      default:
        return null;
    }
  }
}

const containerStyle = c(`{
  padding-top: 10px;
  padding-bottom: 10px;
  box-sizing: border-box;
  display: flex;
  align-items: flex-start;
  align-content: center;
}
> * {
  flex-shrink: 0;
}`);

const leftColumnStyle = c(`{
  width: 64px;
  box-sizing: border-box;
}`);

const rightColumnStyle = c(`{
  width: calc(100% - 64px);
}`);

const loginViaStyle = c(`{
  background: none;
  color: inherit;
  border: none;
  padding: 0;
  font: inherit;
  cursor: pointer;
  outline: inherit;
  display: block;
  width: 25px;
  height: 25px;
  margin: 0 auto;
  margin-top: 5px;
}`);

const formStyle = c(`{
  margin: 0;
  padding: 0;
}`);

const panelStyle = c(`{
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  flex-wrap: wrap;
  box-sizing: border-box;
}`);

const formRowStyle = c(`{
  position: relative;
  margin-bottom: 7px;
}`);

const toggleContainerStyle = c(`{
  height: 33px;
  display: flex;
  align-items: center;
  box-sizing: border-box;
}
> * {
  padding: 5px;
}`);

const errorMsgStyle = c(`p {
  margin: 0;
  padding: 0;
  font-size: 15px;
}`);
