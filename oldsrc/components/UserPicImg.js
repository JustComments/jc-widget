import { h, render, Component } from 'preact';
import { c } from '../utils/style';

export class UserPicImg extends Component {
  constructor({ theme }) {
    super();
    this.style = c(`{
      display: block;
      box-sizing: inherit;
      background-color: initial;
      border: 0;
      padding: 0;
      margin: 0;
      display: block;
      width: 40px;
      height: 40px;
      border-radius: ${theme.avatar.borderRadius};
    }`);
  }
  render({ theme, src, onError, alt }) {
    if (src) {
      return (
        <img className={this.style} src={src} onError={onError} alt={alt} />
      );
    } else {
      return (
        <svg
          className={this.style}
          viewBox="0 0 32 32"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            style={{ fill: theme.avatar.backgroundColor }}
            height="32"
            width="32"
          />
          <path
            style={{ fill: theme.avatar.color }}
            d="m18,23.521078l0,-1.780245c2.203,-1.339772 4,-4.682185 4,-8.023518c0,-5.366645 0,-9.716316 -6,-9.716316s-6,4.349671 -6,9.716316c0,3.342413 1.797,6.683746 4,8.023518l0,1.780245c-6.784,0.599173 -12,4.197448 -12,8.548199l28,0c0,-4.35075 -5.216,-7.950105 -12,-8.548199z"
          />
        </svg>
      );
    }
  }
}
