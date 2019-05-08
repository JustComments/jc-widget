import { h, render, Component } from 'preact';
import { c } from '../utils/style';
import replyToIcon from './icons/replyToIcon';

export class ReplyToLink extends Component {
  constructor({ theme }) {
    super();
    this.linkClassName = c(`{
        padding: 0;
        font-size: 12px;
        line-height: 1;
        color: ${theme.text.secondaryColor};
        text-decoration: none;
      }
      :hover {
        padding: 0;
        color: ${theme.text.secondaryColorAlt};
      }
      :hover svg {
        fill: ${theme.text.secondaryColorAlt};
      }
      :focus {
        outline: ${theme.outlineStyle};
      }
      svg {
        fill: ${theme.text.secondaryColor};
        vertical-align: middle;
        height: 11px;
        width: 11px;
      }
    `);
  }
  render({ onClick, link, text }) {
    return (
      <a onClick={onClick} className={this.linkClassName} href={link}>
        {replyToIcon}
        <span className={textClassName}>{text}</span>
      </a>
    );
  }
}

const textClassName = c(
  `{
  margin-left: 4px;
  font-size: 12px;
}`,
);
