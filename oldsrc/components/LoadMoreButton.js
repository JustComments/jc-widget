import { h, render, Component } from 'preact';
import { c } from '../utils/style';

export class LoadMoreButton extends Component {
  constructor({ theme }) {
    super();
    this.buttonStyle = c(`{
      display: inline-block;
      margin-top: 1rem;
      padding: 3px 9px;
      line-height: 1.8;
      box-shadow: none;
      border-radius: 0;

      color: ${theme.buttons.primaryColor};
      background-color: ${theme.buttons.primaryBgColor};
      text-shadow: -1px 1px ${theme.buttons.primaryBgColor};
      border: none;

      font-family: inherit;
      font-size: 15px;
      box-sizing: inherit;
    }
    :hover {
      background-color: ${theme.buttons.primaryColorAlt};
      text-shadow: -1px 1px ${theme.buttons.primaryColorAlt};
      cursor: pointer;
    }
    :active {
      background-color: ${theme.buttons.primaryColorAlt};
      text-shadow: -1px 1px ${theme.buttons.primaryColorAlt};
    }`);
  }
  render(props, state) {
    return (
      <div className={containerStyle}>
        <button className={this.buttonStyle} onClick={props.onClick}>
          {__('loadMoreButton')}
        </button>
      </div>
    );
  }
}

const containerStyle = c(`{
  text-align: center;
  box-sizing: inherit;
}`);
