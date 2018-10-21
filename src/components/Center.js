import { h, render, Component } from 'preact';

export const Center = ({ children }) => {
  return (
    <div
      style={{
        display: 'flex',
        'justify-content': 'center',
      }}
    >
      {children}
    </div>
  );
};
