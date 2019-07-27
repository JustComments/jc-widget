import { h } from 'preact';
import cls from 'classnames';

import s from './style.css';

export function Toggle({ icon, title, value, onClick }) {
  return (
    <button
      aria-checked={value ? 'true' : 'false'}
      className={cls(s.btn, s.toggle, { [s.on]: value })}
      onClick={onClick}
      role="switch"
      tabindex="0"
      aria-label={title}
      title={title}
      type="button"
    >
      {icon}
    </button>
  );
}

export function Btn(props) {
  return <_btn {...props} classes={[s.btn, ...props.classes]} />;
}

export function Btn3(props) {
  return <_btn {...props} classes={[s.btn, s.fontButton3, ...props.classes]} />;
}

export function LinkBtn(props) {
  return <_btn {...props} classes={[s.linkBtn, s.fontButton2]} />;
}

export function MenuBtn(props) {
  return <_btn {...props} classes={[s.menuBtn, s.fontBody3]} />;
}

function _btn(props) {
  return (
    <button
      type="button"
      tabindex="0"
      title={props.title}
      aria-label={props.title}
      disabled={props.disabled}
      onClick={props.onClick}
      className={cls(props.classes)}
    >
      {props.children}
    </button>
  );
}
