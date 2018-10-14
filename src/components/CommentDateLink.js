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
      color: ${theme.secondaryTextColor};
      text-decoration: none;
    }
    :hover {
      padding: 0;
      background-color: initial;
      color: ${theme.secondaryTextColorAlt};
    }
    :hover .icon {
      fill: ${theme.secondaryTextColorAlt};
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
