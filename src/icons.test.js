import render from 'preact-render-to-string';
import { TwitterIcon } from './icons';

it('renders a TwitterIcon', () => {
  const tree = render(<TwitterIcon />);
  expect(tree).toMatchSnapshot();
});
