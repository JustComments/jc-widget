import { h, render, Component } from 'preact';

export function bootstrapRecaptcha() {
  window.jcRecaptchaPromise = new Promise((resolve) => {
    window.jcOnRecaptchaLoad = function() {
      resolve();
    };
  });
  const s = document.createElement('script');
  s.async = true;
  s.defer = true;
  s.setAttribute(
    'src',
    'https://www.google.com/recaptcha/api.js?onload=jcOnRecaptchaLoad&render=explicit',
  );
  document.body.appendChild(s);
}

export class Recaptcha extends Component {
  saveRef = (ref) => {
    this.root = ref;
  };

  render() {
    return <div ref={this.saveRef} />;
  }

  componentDidMount() {
    const { sitekey } = this.props;
    return window.jcRecaptchaPromise.then(() => {
      this.grecaptchaId = grecaptcha.render(this.root, {
        sitekey: sitekey,
        size: 'invisible',
        callback: this.onCaptchaSubmit.bind(this),
      });
    });
  }

  componentWillUnmount() {
    return window.jcRecaptchaPromise.then(() => {
      grecaptcha.reset(this.grecaptchaId);
    });
  }

  check() {
    return window.jcRecaptchaPromise.then(() => {
      grecaptcha.execute(this.grecaptchaId);
      return new Promise((resolve, reject) => {
        this.failCaptcha = reject;
        this.succeedCaptcha = resolve;
      });
    });
  }

  onCaptchaSubmit(result) {
    grecaptcha.reset(this.grecaptchaId);
    return this.succeedCaptcha(result);
  }
}
