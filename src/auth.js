import { LocalStorage } from './storage';

export function handleBootstrapParams() {
  if (!LocalStorage.supported()) {
    return;
  }
  if (LocalStorage.get('jcAuth')) {
    LocalStorage.delete('jcAuth');
    LocalStorage.set('jcOauthToken', getUrlParameter('oauth_token'));
    LocalStorage.set(
      'jcOauthTokenSecret',
      getUrlParameter('oauth_token_secret'),
    );
    LocalStorage.set('jcOauthTokenVerifier', getUrlParameter('oauth_verifier'));
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
  var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
  var results = regex.exec(location.search);
  return results === null
    ? ''
    : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

handleBootstrapParams();
