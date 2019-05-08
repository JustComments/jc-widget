import { h, render, Component } from 'preact';
import { c } from '../utils/style';

export class CommentDateLink extends Component {
  constructor({ theme }) {
    super();
    this.style = c(`{
      padding: 0;
      background-color: initial;
      font-size: 12px;
      line-height: 1;
      color: ${theme.text.secondaryColor};
      text-decoration: none;
    }
    :hover {
      padding: 0;
      background-color: initial;
      color: ${theme.text.secondaryColorAlt};
    }
    :hover .icon {
      fill: ${theme.text.secondaryColorAlt};
    }
    :focus {
      outline: ${theme.outlineStyle};
    }`);
  }
  render({ onClick, date, rawDate, link }) {
    return (
      <a onClick={onClick} title={rawDate} className={this.style} href={link}>
        <span>{date}</span>
      </a>
    );
  }
}
