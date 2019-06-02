import { h, Component } from 'preact';

import { Connect } from 'redux-zero/preact';
import { actions } from './actions';

import {
  Anonymous,
  ReplyIcon,
  PushIcon,
  EmailIcon,
  TwitterIcon,
  FacebookIcon,
} from './icons';
import { LocalStorage, supportsServiceWorkers, substitute } from './utils';

export default (inlineProps) => (
  <Connect mapToProps={mapToProps} actions={actions}>
    {(props) => <Form {...props} {...inlineProps} />}
  </Connect>
);

const mapToProps = ({ config, session, form }) => {
  const {
    allowGuests,
    disableSocialLogin,
    enableWebsite,
    enableEmailNotifications,
    disableProfilePictures,
  } = config;
  const {
    userPic,
    loginProvider, // TODO
  } = form;
  const showSocial = LocalStorage.supported() && !disableSocialLogin;

  const guestForm = allowGuests && !session.isAuthenticated();

  return {
    userPic,
    guestForm,
    disableSocialLogin,
    loginProvider,
    enableWebsite,
    enableEmailNotifications,
    disableProfilePictures,
    showSocial,
    form,
  };
};

import s from './style.css';
import cls from 'classnames';

class Form extends Component {
  saveRef = (ref) => {
    this.form = ref;
  };

  onSend = (e) => {
    e.preventDefault();
    return this.props.sendComment(this.form, this.props.replyToComment);
  };

  render({
    userPic,
    guestForm,
    replyToComment,
    disableSocialLogin,
    loginProvider,
    enableWebsite,
    enableEmailNotifications,
    disableProfilePictures,
    showSocial,
    form,
    sendComment,
    onPushToggle,
    onEmailToggle,
    onFacebookLogin,
    onTwitterLogin,
    onUsernameInput,
    onEmailInput,
    onWebsiteInput,
    onTextInput,
    onLogout,
  }) {
    const textareaPlaceholder = replyToComment
      ? substitute(__('replyTo'), {
          name: replyToComment.username,
        })
      : `${__('writeAComment')} (${__('ctrlEnterToSend')})`;
    return (
      <div
        className={cls(s.form, {
          [s.noProfilePic]: disableProfilePictures,
          [s.noSocial]: !showSocial,
          [s.noUserPic]: disableProfilePictures,
        })}
      >
        <form ref={this.saveRef}>
          {guestForm && (
            <div className={s.row}>
              <div className={s.left}>
                <div className={s.inputGroup}>
                  <div className={s.formPicContainer}>
                    {!disableProfilePictures && (
                      <UserPic
                        userPic={userPic}
                        loginProvider={loginProvider}
                        onLogout={onLogout}
                      />
                    )}
                    <label className={cls(s.fontBody1)}>
                      {__('anonymousCommentHeader')}
                    </label>
                  </div>
                  <input
                    placeholder={__('name')}
                    aria-label={__('name')}
                    value={form.username}
                    required={true}
                    max={255}
                    onInput={onUsernameInput}
                    className={cls(s.inpt, s.fontBody2, {
                      [s.dirty]: form.dirty,
                    })}
                  />
                  <input
                    type="email"
                    placeholder={__('email')}
                    aria-label={__('email')}
                    value={form.email}
                    className={cls(s.inpt, s.fontBody2, {
                      [s.dirty]: form.dirty,
                    })}
                    max={255}
                    onInput={onEmailInput}
                  />
                  {enableWebsite && (
                    <input
                      placeholder={__('website')}
                      aria-label={__('website')}
                      type="url"
                      value={form.website}
                      className={cls(s.inpt, s.fontBody2, {
                        [s.dirty]: form.dirty,
                      })}
                      onInput={onWebsiteInput}
                    />
                  )}
                </div>
              </div>
              {showSocial && (
                <div className={s.separator}>
                  <div className={s.line} />
                  <div className={cls(s.word, s.fontBody1)}>or</div>
                  <div className={s.line} />
                </div>
              )}
              {showSocial && (
                <div className={s.right}>
                  <div className={cls(s.fontBody1)}>
                    {__('socialCommentHeader')}
                  </div>
                  <button
                    tabindex="0"
                    role="button"
                    onClick={onFacebookLogin}
                    className={cls(s.btn, s.fontButton4)}
                    type="button"
                  >
                    <FacebookIcon />
                  </button>
                  <button
                    tabindex="0"
                    role="button"
                    onClick={onTwitterLogin}
                    className={cls(s.btn, s.fontButton4)}
                    type="button"
                  >
                    <TwitterIcon />
                  </button>
                </div>
              )}
            </div>
          )}
          {!guestForm && !disableProfilePictures && (
            <UserPic
              userPic={userPic}
              loginProvider={loginProvider}
              onLogout={onLogout}
            />
          )}
          <div className={s.row}>
            <textarea
              className={cls(s.inpt, s.fontBody2, { [s.dirty]: form.dirty })}
              placeholder={textareaPlaceholder}
              aria-label={textareaPlaceholder}
              value={form.text}
              required={true}
              onInput={onTextInput}
              onKeyDown={(e) => {
                if (e.ctrlKey && e.keyCode == 13) {
                  this.onSend(e);
                } else if (e.metaKey && e.keyCode == 13) {
                  this.onSend(e);
                }
              }}
            />
          </div>
          {Object.keys(form.errors).length > 0 && (
            <div className={s.row}>
              {Object.keys(form.errors).map((errorKey) => {
                return h('p', {}, [form.errors[errorKey]]);
              })}
            </div>
          )}
          <div className={cls(s.row, s.last)}>
            <button
              tabindex={0}
              role="button"
              onClick={this.onSend}
              disabled={form.blocked ? 'disabled' : ''}
              type="button"
              className={cls(s.btn, s.small, s.primary, s.fontButton4)}
            >
              <ReplyIcon />
              <span>{form.blocked ? __('sending') : __('send')}</span>
            </button>
            {supportsServiceWorkers() && (
              <Toggle
                icon={<PushIcon />}
                title={__('toggleNotificationsPush')}
                onClick={onPushToggle}
                value={form.pushNotifications}
              />
            )}
            {enableEmailNotifications && (
              <Toggle
                icon={<EmailIcon />}
                title={__('toggleNotificationsEmail')}
                onClick={onEmailToggle}
                value={form.emailNotifications}
              />
            )}
          </div>
        </form>
      </div>
    );
  }
}

function Toggle({ icon, title, value, onClick }) {
  return (
    <button
      tabindex={0}
      role={'switch'}
      onClick={onClick}
      title={title}
      ariaChecked={value}
      className={cls(s.btn, s.toggle, { [s.on]: value })}
    >
      {icon}
    </button>
  );
}

export function UserPic({ userPic, userUrl, loginProvider, onLogout }) {
  return (
    <UserPicContainer userUrl={userUrl}>
      {userPic ? <img src={userPic} /> : <Anonymous />}
      {loginProvider === 'twitter' &&
        (onLogout ? (
          <button
            onClick={onLogout}
            type="button"
            title="logout"
            className={cls(s.btn, s.logout)}
          >
            <TwitterIcon />
          </button>
        ) : (
          <div className={cls(s.logout)}>
            <TwitterIcon />
          </div>
        ))}
      {loginProvider === 'fb' &&
        (onLogout ? (
          <button
            onClick={onLogout}
            type="button"
            title="logout"
            className={cls(s.btn, s.logout)}
          >
            <FacebookIcon />
          </button>
        ) : (
          <div className={cls(s.logout)}>
            <FacebookIcon />
          </div>
        ))}
    </UserPicContainer>
  );
}

function UserPicContainer({ userUrl, children }) {
  return userUrl ? (
    <a className={s.userPic} href={userUrl} target="_blank">
      {children}
    </a>
  ) : (
    <div className={s.userPic}>{children}</div>
  );
}
