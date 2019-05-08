import { h, render, Component } from 'preact';
import { c } from '../utils/style';

export class Attribution extends Component {
  constructor({ theme }) {
    super();
    this.containerStyle = c(`{
      font-size: 13px;
      margin-top: 20px;
      color: ${theme.text.secondaryColor};
      text-align: center;
      box-sizing: inherit;
    }`);
    this.linkStyle = c(`{
      font-size: 13px;
      color: ${theme.text.secondaryColor};
      box-sizing: inherit;
      text-decoration: none;
    }
    :hover {
      color: ${theme.text.secondaryColorAlt};
    }
    :focus {
      outline: ${theme.outlineStyle}
    }`);
  }

  render() {
    return (
      <div className={this.containerStyle}>
        <span>powered by &nbsp;</span>
        <a
          className={this.linkStyle}
          href="https://just-comments.com"
          target="_blank"
        >
          just-comments.com
        </a>
      </div>
    );
  }
}
