import { h, render, Component } from 'preact';
import icon from './icons/twitter';
import { c } from '../utils/style';

export class TwitterSignIn extends Component {
  constructor({ theme }) {
    super();
    this.style = c(`{
      box-sizing: inherit;
      position: absolute;
      top: 0;
      right: 0;
      display: block;
      cursor: pointer;
      width: 33.6px;
      height: 33.6px;
      background-color: transparent;
      border: 0;
      padding: 0;
      margin: 0;
    }
    :focus {
      outline: ${theme.outlineStyle};
    }`);
  }
  render({ onClick, title, theme }) {
    return (
      <button
        className={this.style}
        tabindex={0}
        role={'button'}
        title={title}
        onClick={onClick}
      >
        {icon}
      </button>
    );
  }
}
