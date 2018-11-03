import { h, render, Component } from 'preact';
import { c } from '../utils/style';
import { Center } from './Center';
import { UserPicImg } from './UserPicImg';

export class UserPic extends Component {
  constructor({ theme, src }) {
    super();
    this.style = c(`{
      display: block;
      width: 64px;
      height: 47px;
      box-sizing: inherit;
      background-color: initial;
      border: 0;
      padding: 0;
      margin: 0;
    }`);
    this.state = {
      src,
    };
  }

  render({ href, src, username, theme }) {
    const content = (
      <Center>
        <UserPicImg
          src={this.state.src}
          alt={`picture of ${username}`}
          onError={() => this.setState({ src: undefined })}
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
