import { h, render, Component } from 'preact';
import { c } from '../utils/style';

export class UserPic extends Component {
  constructor({ theme }) {
    super();
    this.state = {
      errored: false,
    };
    this.style = c(`{
      display: block;
      width: 64px;
      height: 64px;
      box-sizing: inherit;
      background-color: initial;
      border: 0,
      padding: 0,
      margin: 0,
    }`);
  }

  render({ href, src, username, theme }, { errored }) {
    const content = (
      <Center>
        <UserPicImg
          src={errored ? NO_PIC_URL : src}
          alt={`picture of ${username}`}
          onError={() => this.setState({ errored: true })}
          theme={theme}
        />
      </Center>
    );
    return href ? (
      <a href={href} target={'_blank'} rel={'noopener'} className={this.style}>
        {content}
      </a>
    ) : (
      <div className={this.style}>{content}</div>
    );
  }
}

const Center = ({ children }) => {
  return (
    <div
      style={{
        display: 'flex',
        'justify-content': 'center',
      }}
    >
      {children}
    </div>
  );
};

class UserPicImg extends Component {
  constructor({ theme }) {
    super();
    this.style = c(`{
      box-sizing: inherit;
      background-color: initial;
      border: 0;
      padding: 0;
      margin: 0;
      display: block;
      width: 40px;
      height: 40px;
      border-radius: ${theme.userPicBorderRadius};
    }`);
  }
  render({ src, onError, alt }) {
    return <img className={this.style} src={src} onError={onError} alt={alt} />;
  }
}
