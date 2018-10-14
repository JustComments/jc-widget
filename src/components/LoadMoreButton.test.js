import { h } from 'preact';
import { shallow } from 'preact-render-spy';
import { LoadMoreButton } from './LoadMoreButton';

it('renders a clickable LoadMoreButton', () => {
  let clicked = false;
  const context = shallow(
    h(LoadMoreButton, {
      theme: {},
      onClick() {
        clicked = true;
      },
    }),
  );
  context.find('[onClick]').simulate('click');
  expect(clicked).toBeTruthy();
});
