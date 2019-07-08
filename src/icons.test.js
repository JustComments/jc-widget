import render from 'preact-render-to-string';
import { h } from 'preact';

/** @jsx h */
import { TwitterIcon } from './icons';

it('renders a TwitterIcon', () => {
  const tree = render(<TwitterIcon />);
  expect(tree).toMatchSnapshot();
});
