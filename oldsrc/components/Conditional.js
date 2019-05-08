import { h, render, Component } from 'preact';

export const Conditional = (props) => {
  return !!props.if && props.do();
};
