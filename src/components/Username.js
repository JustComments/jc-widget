import { h, render, Component } from 'preact';
import { c } from '../utils/style';

export class Username extends Component {
  constructor({ theme }) {
    super();
    this.linkStyle = c(`{
      padding: 0;
      background-color: initial;
      line-height: 1;
      font-size: 15px;
      line-height: 1;
      font-weight: 700;
      text-decoration: none;
      color: ${theme.text.primaryColor};
      display: inline-block;
    }
    :hover {
      padding: 0;
      color: ${theme.text.primaryColorAlt};
    }
    :focus {
      outline: ${theme.outlineStyle};
    }`);
    this.divStyle = c(`{
      padding: 0;
      line-height: 1;
      font-size: 15px;
      line-height: 1;
      font-weight: 700;
      color: ${theme.text.primaryColor};
      display: inline-block;
    }`);
  }
  render(props, state) {
    const { link, username } = props;
    return link ? (
      <a
        className={this.linkStyle}
        href={link}
        rel={'noopener'}
        target={'_blank'}
      >
        <span>{username}</span>
      </a>
    ) : (
      <div className={this.divStyle}>
        <span>{username}</span>
      </div>
    );
  }
}
