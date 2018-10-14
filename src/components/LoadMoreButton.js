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
      appearance: none;
      box-shadow: none;
      border-radius: 0;

      color: #fff;
      background-color: ${theme.primaryColor};
      text-shadow: -1px 1px ${theme.primaryColor};
      border: none;

      font-family: inherit;
      font-size: 15px;
      box-sizing: inherit;
    }
    :hover {
      background-color: ${theme.primaryColorAlt};
      text-shadow: -1px 1px ${theme.primaryColorAlt};
      cursor: pointer;
    }
    :active {
      background-color: ${theme.primaryColorAlt};
      text-shadow: -1px 1px ${theme.primaryColorAlt};
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
