import { h, Component } from 'preact';
import { __ } from './i18n';

import { Anonymous, TwitterIcon, FacebookIcon, LogoutIcon } from './icons';
import { supportsServiceWorkers } from './utils';
import s from './style.css';
import cls from 'classnames';

const icons = {
  twitter: <TwitterIcon />,
  fb: <FacebookIcon />,
};

export function Avatar({
  userPic,
  onImageError,
  userUrl,
  loginProvider,
  onLogout,
}) {
  const icon = icons[loginProvider];
  return (
    <UserPicContainer
      onLogout={onLogout}
      loginProvider={loginProvider}
      userUrl={userUrl}
    >
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
    </UserPicContainer>
  );
}

function UserPicContainer({ onLogout, loginProvider, userUrl, children }) {
  return (
    <div className={cls(s.userPicContainer)}>
      {userUrl && (
        <a
          className={cls(s.userPic)}
          href={userUrl}
          target="_blank"
          rel="noopener"
        >
          {children}
        </a>
      )}
      {!userUrl && <div className={cls(s.userPic)}>{children}</div>}
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
    </div>
  );
}
