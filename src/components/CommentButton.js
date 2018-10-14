import { h, render, Component } from 'preact';
import { c } from '../utils/style';

export class CommentButton extends Component {
  constructor({ theme }) {
    super();
    this.style = c(`{
      box-sizing: inherit;
      color: ${theme.secondaryTextColor};
      font-size: 14px;
      line-height: 17px;
      text-decoration: none;
      background: transparent;
      border: 0;
      padding: 0;
      border-bottom: 1px dotted ${theme.secondaryTextColor};
      cursor: pointer;
    }
    :hover {
      color: ${theme.secondaryTextColorAlt};
      border-bottom: 1px dotted ${theme.secondaryTextColorAlt};
    }
    :focus {
      outline: ${theme.outlineStyle};
      border: none;
    }`);
  }

  render(props, state) {
    const { className, onClick, label } = this.props;
    return (
      <button
        className={`${className} ${this.style}`}
        tabindex={0}
        role={'button'}
        onClick={onClick}
      >
        <span>{label}</span>
      </button>
    );
  }
}
