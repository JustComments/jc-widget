import { Base64 } from 'js-base64';

const GUEST_KEY = 'jcGuest123';

export default function createGuestJWT(username, email, apiKey) {
  var data = {
    apiKey,
    userId: 'guest',
    userPic: null,
    userUrl: null,
    userEmail: email,
    username,
  };
  return `${GUEST_KEY}===${Base64.encode(JSON.stringify(data))}`;
}
