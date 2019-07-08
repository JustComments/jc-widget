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
  LogoutIcon,
} from './icons';
import { supportsServiceWorkers, substitute } from './utils';
import s from './style.css';
import cls from 'classnames';

export default (inlineProps) => (
  <Connect mapToProps={mapToProps} actions={actions}>
    {(props) => <Form {...props} {...inlineProps} />}
  </Connect>
);

const mapToProps = ({ config, session, form }) => {
  const {
    disableAnonymousLogin,
    disableSocialLogin,
    enableWebsite,
    enableEmailNotifications,
    disableProfilePictures,
    localStorageSupported,
    defaultUserPicUrl,
  } = config;
  const { userPic, loginProvider } = form;
  const showSocial = localStorageSupported && !disableSocialLogin;
  const isLoggedIn = session.isAuthenticated();

  return {
    disableAnonymousLogin,
    disableSocialLogin,
    enableWebsite,
    enableEmailNotifications,
    disableProfilePictures,
    showSocial,
    form,
    isLoggedIn,
    defaultUserPicUrl,
  };
};

class Form extends Component {
  saveRef = (ref) => {
    this.form = ref;
  };

  onSend = (e) => {
    e.preventDefault();
    return this.props.sendComment(this.form, this.props.replyToComment);
  };

  onPreview = (e) => {
    e.preventDefault();
    return this.props.previewComment(this.form, this.props.replyToComment);
  };

  onHidePreview = (e) => {
    e.preventDefault();
    return this.props.hideCommentPreview(this.form, this.props.replyToComment);
  };

  onImageError = () => {
    this.props.onFormImageError();
  };

  render({
    defaultUserPicUrl,
    disableAnonymousLogin,
    replyToComment,
    disableSocialLogin,
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
    onEmailBlur,
    onWebsiteInput,
    onTextInput,
    onLogout,
    isLoggedIn,
  }) {
    const textareaPlaceholder = replyToComment
      ? substitute(__('replyTo'), {
          name: replyToComment.username,
        })
      : `${__('writeAComment')} (${__('ctrlEnterToSend')})`;

    return (
      <div
        className={cls(s.form, {
          [s.noSocial]: !showSocial,
          [s.noUserPic]: disableProfilePictures,
        })}
      >
        <form ref={this.saveRef}>
          {!isLoggedIn && (
            <div className={s.row}>
              {!disableAnonymousLogin && (
                <div className={s.left}>
                  <div className={s.inputGroup}>
                    <div className={s.formPicContainer}>
                      {!disableProfilePictures && (
                        <UserPic
                          userPic={
                            form.userPic
                              ? form.userPic
                              : !isLoggedIn
                              ? defaultUserPicUrl
                              : undefined
                          }
                          userUrl={form.website}
                          loginProvider={form.loginProvider}
                          onLogout={onLogout}
                          onImageError={this.onImageError}
                        />
                      )}
                      <div className={cls(s.formHeader, s.fontBody1)}>
                        <span>
                          {showSocial
                            ? __('socialCommentHeader')
                            : __('anonymousCommentHeader')}
                        </span>
                        {showSocial && (
                          <button
                            tabindex="0"
                            role="button"
                            title={__('loginWithFacebook')}
                            aria-label={__('loginWithFacebook')}
                            onClick={onFacebookLogin}
                            className={cls(s.btn, s.fontButton3)}
                            type="button"
                          >
                            <FacebookIcon />
                          </button>
                        )}
                        {showSocial && (
                          <button
                            tabindex="0"
                            role="button"
                            title={__('loginWithTwitter')}
                            aria-label={__('loginWithTwitter')}
                            onClick={onTwitterLogin}
                            className={cls(s.btn, s.fontButton3)}
                            type="button"
                          >
                            <TwitterIcon />
                          </button>
                        )}
                      </div>
                    </div>
                    <label className={cls(s.fontBody2)}>
                      {__('name')}
                      <input
                        value={form.username}
                        required={true}
                        max={255}
                        onInput={onUsernameInput}
                        className={cls(s.inpt, s.fontBody2, {
                          [s.dirty]: form.dirty,
                        })}
                      />
                    </label>
                    <label className={cls(s.fontBody2)}>
                      {__('email')}
                      <input
                        type="email"
                        value={form.email}
                        className={cls(s.inpt, s.fontBody2, {
                          [s.dirty]: form.dirty,
                        })}
                        max={255}
                        onBlur={onEmailBlur}
                        onInput={onEmailInput}
                      />
                    </label>
                    {enableWebsite && (
                      <label className={cls(s.fontBody2)}>
                        {__('website')}
                        <input
                          type="url"
                          value={form.website}
                          className={cls(s.inpt, s.fontBody2, {
                            [s.dirty]: form.dirty,
                          })}
                          onInput={onWebsiteInput}
                        />
                      </label>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
          {!disableProfilePictures && isLoggedIn && (
            <UserPic
              userPic={
                form.userPic
                  ? form.userPic
                  : !isLoggedIn
                  ? defaultUserPicUrl
                  : undefined
              }
              userUrl={form.website}
              loginProvider={form.loginProvider}
              onLogout={onLogout}
              onImageError={this.onImageError}
            />
          )}
          {form.preview && !form.previewLoading && (
            <div className={cls(s.comment, s.preview)}>
              <label className={cls(s.fontBody2)}>{textareaPlaceholder}</label>
              <div
                className={cls(s.content, s.fontBody2)}
                dangerouslySetInnerHTML={{ __html: form.preview }}
              />
            </div>
          )}
          {form.previewLoading && (
            <div className={cls(s.comment, s.preview)}>
              <label className={cls(s.fontBody2)}>{textareaPlaceholder}</label>
              <p className={cls(s.fontBody2, s.previewLoading)}>
                {__('loadingPreview')}
              </p>
            </div>
          )}
          {!form.preview && !form.previewLoading && (
            <div className={cls(s.row, s.textareaContainer)}>
              <label className={cls(s.fontBody2)}>
                {textareaPlaceholder}
                <textarea
                  className={cls(s.inpt, s.fontBody2, {
                    [s.dirty]: form.dirty,
                  })}
                  value={form.text}
                  required={true}
                  maxlength={5000}
                  onInput={onTextInput}
                  onKeyDown={(e) => {
                    if (e.ctrlKey && e.keyCode == 13) {
                      this.onSend(e);
                    } else if (e.metaKey && e.keyCode == 13) {
                      this.onSend(e);
                    }
                  }}
                />
              </label>
              <div className={s.textareaBtns}>
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
            </div>
          )}
          {Object.keys(form.errors).length > 0 && (
            <div className={s.row}>
              {Object.keys(form.errors).map((errorKey) => {
                return h('p', {}, [form.errors[errorKey]]);
              })}
            </div>
          )}
          <div className={cls(s.row, s.last)}>
            <button
              role="button"
              onClick={this.onSend}
              disabled={form.blocked ? 'disabled' : ''}
              type="button"
              className={cls(s.btn, s.small, s.primary, s.fontButton3)}
            >
              <ReplyIcon />
              <span
                className={cls({
                  // [s.sending]: form.blocked,
                })}
              >
                {form.blocked ? __('sending') : __('send')}
              </span>
            </button>
            {form.preview ? (
              <button
                type="button"
                onClick={this.onHidePreview}
                className={cls(s.btn, s.secondary, s.fontButton3)}
              >
                {__('hidePreview')}
              </button>
            ) : (
              <button
                type="button"
                onClick={this.onPreview}
                className={cls(s.btn, s.secondary, s.fontButton3)}
              >
                {__('preview')}
              </button>
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
      aria-checked={value ? 'true' : 'false'}
      className={cls(s.btn, s.toggle, { [s.on]: value })}
      onClick={onClick}
      role="switch"
      tabindex="0"
      aria-label={title}
      title={title}
    >
      {icon}
    </button>
  );
}

const icons = {
  twitter: <TwitterIcon />,
  fb: <FacebookIcon />,
};

export function UserPic({
  userPic,
  onImageError,
  userUrl,
  loginProvider,
  onLogout,
}) {
  const icon = icons[loginProvider];
  return (
    <UserPicContainer onLogout={onLogout} userUrl={userUrl}>
      {userPic && (
        <img
          className={s.img}
          onError={onImageError}
          alt={__('userPic')}
          src={userPic}
        />
      )}
      {!userPic && <Anonymous />}
      {icon && <div className={cls(s.providerIcon)}>{icon}</div>}
      {onLogout && loginProvider && (
        <button
          onClick={onLogout}
          type="button"
          title="logout"
          aria-label="logout"
          className={cls(s.btn, s.logoutButton)}
        >
          <LogoutIcon />
        </button>
      )}
    </UserPicContainer>
  );
}

function UserPicContainer({ onLogout, userUrl, children }) {
  return userUrl ? (
    <a className={cls(s.userPic)} href={userUrl} target="_blank" rel="noopener">
      {children}
    </a>
  ) : (
    <div className={cls(s.userPic, { [s.logout]: onLogout })}>{children}</div>
  );
}
