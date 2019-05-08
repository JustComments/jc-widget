import { h, render, Component } from 'preact';
import { c } from '../utils/style';

export class CommentButton extends Component {
  constructor({ theme }) {
    super();
    this.style = c(`{
      box-sizing: inherit;
      color: ${theme.buttons.secondaryColor};
      font-size: 14px;
      line-height: 17px;
      text-decoration: none;
      background: transparent;
      border: 0;
      padding: 0;
      cursor: pointer;
      text-transform: capitalize;
    }
    :hover {
      color: ${theme.buttons.secondaryColorAlt};
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
