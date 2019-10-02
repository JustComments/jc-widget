import { h, Component } from 'preact';
import { Connect } from 'redux-zero/preact';
import cls from 'classnames';

import { __, substitute } from './i18n';
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
import { Avatar } from './avatar';
import { supportsServiceWorkers } from './utils';
import { Toggle, Btn3 } from './ui';

import s from './style.css';

export default (inlineProps) => (
  <Connect mapToProps={mapToProps} actions={actions}>
    {(props) => <Form {...props} {...inlineProps} />}
  </Connect>
);

const mapToProps = ({ config, session }) => {
  const {
    defaultUserPicUrl,
    disableAnonymousLogin,
    disableProfilePictures,
    disablePushNotifications,
    disableSocialLogin,
    enableEmailNotifications,
    enableWebsite,
    localStorageSupported,
    customLocale,
  } = config;

  return {
    defaultUserPicUrl,
    disableAnonymousLogin,
    disableProfilePictures,
    disablePushNotifications,
    disableSocialLogin,
    enableEmailNotifications,
    enableWebsite,
    showSocial: localStorageSupported && !disableSocialLogin,
    customLocale,
  };
};

class Form extends Component {
  saveRef = (ref) => {
    this.form = ref;
  };

  onSend = (e) => {
    e.preventDefault();
    return this.props.sendComment(
      this.form,
      this.props.replyToComment,
      this.props.formIdx,
    );
  };

  onPreview = (e) => {
    e.preventDefault();
    return this.props.previewComment(this.props.formIdx);
  };

  onHidePreview = (e) => {
    e.preventDefault();
    return this.props.hideCommentPreview(this.props.formIdx);
  };

  onImageError = () => {
    this.props.onFormImageError(this.props.formIdx);
  };

  onEmailBlur = () => {
    this.props.onEmailBlur(this.props.formIdx);
  };

  onEmailInput = (e) => {
    this.props.onEmailInput(e, this.props.formIdx);
  };

  onEmailToggle = (e) => {
    this.props.onEmailToggle(e, this.props.formIdx);
  };

  onPushToggle = (e) => {
    this.props.onPushToggle(e, this.props.formIdx);
  };

  onTextInput = (e) => {
    this.props.onTextInput(e, this.props.formIdx);
  };

  onUsernameInput = (e) => {
    this.props.onUsernameInput(e, this.props.formIdx);
  };

  onWebsiteInput = (e) => {
    this.props.onWebsiteInput(e, this.props.formIdx);
  };

  render({
    defaultUserPicUrl,
    disableAnonymousLogin,
    disableProfilePictures,
    disablePushNotifications,
    disableSocialLogin,
    enableEmailNotifications,
    enableWebsite,
    form,
    last,
    onFacebookLogin,
    onLogout,
    onTwitterLogin,
    replyToComment,
    showSocial,
    customLocale,
  }) {
    const textareaPlaceholder = replyToComment
      ? substitute(__('replyTo', customLocale), {
          name: replyToComment.username,
        })
      : `${__('writeAComment', customLocale)} (${__(
          'ctrlEnterToSend',
          customLocale,
        )})`;

    const sendingText = __('sending', customLocale);
    const sendText = __('send', customLocale);
    const hidePreviewText = __('hidePreview', customLocale);
    const previewText = __('preview', customLocale);

    const renderLoginOptions = !(disableSocialLogin && disableAnonymousLogin);

    return (
      <div
        className={cls(s.form, {
          [s.noSocial]: !showSocial,
          [s.noUserPic]: disableProfilePictures,
          [s.last]: last,
        })}
      >
        <form ref={this.saveRef}>
          {!form.isLoggedIn && (
            <div className={s.row}>
              {renderLoginOptions && (
                <div className={s.left}>
                  <div className={s.inputGroup}>
                    <div className={s.formPicContainer}>
                      {!disableProfilePictures && (
                        <Avatar
                          userPic={
                            form.userPic
                              ? form.userPic
                              : !form.isLoggedIn
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
                            ? __('socialCommentHeader', customLocale)
                            : __('anonymousCommentHeader', customLocale)}
                        </span>
                        {showSocial && (
                          <span className={cls(s.socialContainer)}>
                            <Btn3
                              title={__('loginWithFacebook', customLocale)}
                              onClick={onFacebookLogin}
                            >
                              <FacebookIcon />
                            </Btn3>
                            <Btn3
                              title={__('loginWithTwitter', customLocale)}
                              onClick={onTwitterLogin}
                            >
                              <TwitterIcon />
                            </Btn3>
                          </span>
                        )}
                      </div>
                    </div>
                    {!disableAnonymousLogin && (
                      <label className={cls(s.fontBody2)}>
                        {__('name', customLocale)}
                        <input
                          value={form.username}
                          required
                          max={255}
                          onInput={this.onUsernameInput}
                          className={cls(s.inpt, s.fontBody2, {
                            [s.dirty]: form.dirty,
                          })}
                        />
                      </label>
                    )}
                    {!disableAnonymousLogin && (
                      <label className={cls(s.fontBody2)}>
                        {__('email', customLocale)}
                        <input
                          type="email"
                          value={form.email}
                          className={cls(s.inpt, s.fontBody2, {
                            [s.dirty]: form.dirty,
                          })}
                          max={255}
                          onBlur={this.onEmailBlur}
                          onInput={this.onEmailInput}
                        />
                      </label>
                    )}
                    {!disableAnonymousLogin && enableWebsite && (
                      <label className={cls(s.fontBody2)}>
                        {__('website', customLocale)}
                        <input
                          type="url"
                          value={form.website}
                          className={cls(s.inpt, s.fontBody2, {
                            [s.dirty]: form.dirty,
                          })}
                          onInput={this.onWebsiteInput}
                        />
                      </label>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
          {!disableProfilePictures && form.isLoggedIn && (
            <Avatar
              userPic={
                form.userPic
                  ? form.userPic
                  : !form.isLoggedIn
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
            <div className={cls(s.row)}>
              <div className={cls(s.comment, s.preview)}>
                <label className={cls(s.fontBody2)}>
                  {textareaPlaceholder}
                </label>
                <div
                  className={cls(s.content, s.fontBody2)}
                  dangerouslySetInnerHTML={{ __html: form.preview }}
                />
              </div>
            </div>
          )}
          {form.previewLoading && (
            <div className={cls(s.row)}>
              <div className={cls(s.comment, s.preview)}>
                <label className={cls(s.fontBody2)}>
                  {textareaPlaceholder}
                </label>
                <p className={cls(s.fontBody2, s.previewLoading)}>
                  {__('loadingPreview', customLocale)}
                </p>
              </div>
            </div>
          )}
          {!form.preview &&
            !form.previewLoading &&
            ((!disableAnonymousLogin ||
              (disableAnonymousLogin && form.isLoggedIn)) && (
              <div className={cls(s.row, s.textareaContainer)}>
                <label className={cls(s.fontBody2)}>
                  {textareaPlaceholder}
                  <textarea
                    className={cls(s.inpt, s.fontBody2, {
                      [s.dirty]: form.dirty,
                    })}
                    disabled={form.blocked}
                    value={form.text}
                    required
                    maxlength={5000}
                    onInput={this.onTextInput}
                    style={{ minHeight: '150px' }}
                    onKeyDown={(e) => {
                      if (form.blocked) {
                        return;
                      }
                      if (e.ctrlKey && e.keyCode == 13) {
                        this.onSend(e);
                      } else if (e.metaKey && e.keyCode == 13) {
                        this.onSend(e);
                      }
                    }}
                  />
                </label>
                <div className={s.textareaBtns}>
                  {supportsServiceWorkers() && !disablePushNotifications && (
                    <Toggle
                      icon={<PushIcon />}
                      title={__('toggleNotificationsPush', customLocale)}
                      onClick={this.onPushToggle}
                      value={form.pushNotifications}
                    />
                  )}
                  {enableEmailNotifications && (
                    <Toggle
                      icon={<EmailIcon />}
                      title={__('toggleNotificationsEmail', customLocale)}
                      onClick={this.onEmailToggle}
                      value={form.emailNotifications}
                    />
                  )}
                </div>
              </div>
            ))}
          {Object.keys(form.errors).length > 0 && (
            <div className={s.row}>
              {Object.keys(form.errors).map((errorKey) =>
                h('p', {}, [form.errors[errorKey]]),
              )}
            </div>
          )}
          {(!disableAnonymousLogin ||
            (disableAnonymousLogin && form.isLoggedIn)) && (
            <div className={cls(s.row, s.last)}>
              <Btn3
                onClick={this.onSend}
                disabled={form.blocked}
                classes={[s.small, s.primary]}
              >
                <ReplyIcon />
                <span>{form.blocked ? sendingText : sendText}</span>
              </Btn3>
              {form.preview && (
                <Btn3 onClick={this.onHidePreview} classes={[s.secondary]}>
                  {hidePreviewText}
                </Btn3>
              )}
              {!form.preview && (
                <Btn3 onClick={this.onPreview} classes={[s.secondary]}>
                  {previewText}
                </Btn3>
              )}
            </div>
          )}
        </form>
      </div>
    );
  }
}
