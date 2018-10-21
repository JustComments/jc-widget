import { h, render, Component } from 'preact';
import { c } from '../utils/style';

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
      }`);
  }
  render({ onClick, link, text }) {
    return (
      <a onClick={onClick} className={this.linkClassName} href={link}>
        <svg viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg">
          <path d="M1792 1120q0 166-127 451-3 7-10.5 24t-13.5 30-13 22q-12 17-28 17-15 0-23.5-10t-8.5-25q0-9 2.5-26.5t2.5-23.5q5-68 5-123 0-101-17.5-181t-48.5-138.5-80-101-105.5-69.5-133-42.5-154-21.5-175.5-6h-224v256q0 26-19 45t-45 19-45-19l-512-512q-19-19-19-45t19-45l512-512q19-19 45-19t45 19 19 45v256h224q713 0 875 403 53 134 53 333z" />
        </svg>
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
