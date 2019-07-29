import { LocalStorage } from './storage';

export function handleBootstrapParams() {
  if (!LocalStorage.supported()) {
    return;
  }
  if (LocalStorage.get('jcAuth')) {
    LocalStorage.delete('jcAuth');
    LocalStorage.set('jcOauthToken', getUrlParameter('oauth_token'));
    window.close();
  }
  if (LocalStorage.get('jcPush')) {
    LocalStorage.delete('jcPush');
    LocalStorage.set(
      'jcPushSubscription',
      getUrlParameter('jcPushSubscription'),
    );
    window.close();
  }
}

function getUrlParameter(name) {
  name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
  let regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
  let results = regex.exec(location.search);
  return results === null
    ? ''
    : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

handleBootstrapParams();
