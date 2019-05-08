import { h, render, Component } from 'preact';
import { c } from '../utils/style';

export class CommentContent extends Component {
  constructor({ theme }) {
    super();
    this.contentStyle = c(`{
      position: relative;
      font-size: 15px;
      line-height: 1.6;
      overflow: hidden;
      box-sizing: inherit;
      margin: 0.5em 0px;
      color: ${theme.text.primaryColor};
    }
    > div > *:first-child {
      margin-top: 0;
    }

    ul {
      box-sizing: inherit;
      margin: 0;
    }
    ol {
      box-sizing: inherit;
      margin: 0;
    }
    blockquote {
      box-sizing: inherit;
      margin: 0;
      padding-left: 5px;
      margin-left: 5px;
      border-left: 5px solid ${theme.text.primaryColor};
    }
    a {
      box-sizing: inherit;
      color: ${theme.text.primaryColor};
      font-size: 15px;
      border-bottom: 1px dotted ${theme.text.primaryColor};
      cursor: pointer;
      text-decoration: none;
    }
    a:hover {
      color: ${theme.text.primaryColorAlt};
      background-color: transparent;
    }
    p {
      margin: 0.5em 0;
      box-sizing: inherit;
    }
    pre {
      font-size: 15px;
      line-height: 1.6;
      margin: 0.5em 0px;
      box-sizing: inherit;
    }
    pre code {
      box-sizing: inherit;
    }`);
  }
  render({ content }) {
    return <div className={this.contentStyle}>{content}</div>;
  }
}
