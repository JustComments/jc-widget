import { h, render, Component } from 'preact';
import { c } from '../utils/style';

export class Toggle extends Component {
  constructor({ checked, theme }) {
    super();
    this.state = { checked };
    this.switchStyle = c(`{
      width: 33px;
      height: 33px;
      fill: ${theme.buttons.disabledBgColor};
      cursor: pointer;
      box-sizing: border-box;
    }
    :focus {
      outline: ${theme.outlineStyle};
    }
    `);
    this.switchCheckedStyle = c(`{
      fill: ${theme.buttons.primaryBgColor};
    }`);
  }
  getClassName() {
    return [
      this.switchStyle,
      this.state.checked ? ' ' + this.switchCheckedStyle : '',
      'jcToggle',
    ].join(' ');
  }
  onKeyPress(e) {
    e.preventDefault();
    if (e.key === 'Enter' || e.key === ' ') {
      this.onToggle();
    }
    return false;
  }
  onToggle() {
    const checked = !this.state.checked;
    this.setState({ checked });
    this.props.onChange(checked);
  }
  render({ title, svg }) {
    return (
      <svg
        className={this.getClassName()}
        onClick={this.onToggle.bind(this)}
        onKeyPress={this.onKeyPress.bind(this)}
        aria-checked={this.state.checked}
        tabindex="0"
        x="0px"
        y="0px"
        viewBox="0 0 64 64"
        enable-background="new 0 0 64 64"
        role="checkbox"
      >
        <title>{title}</title>
        {svg}
      </svg>
    );
  }
}
