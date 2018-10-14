import { h } from 'preact';
import { shallow } from 'preact-render-spy';
import { CommentButton } from './CommentButton';

it('renders a clickable CommentButton', () => {
  let clicked = false;
  const context = shallow(
    h(CommentButton, {
      theme: {},
      buttonLabelKey: 'reply',
      onClick() {
        clicked = true;
      },
    }),
  );
  context.find('[onClick]').simulate('click');
  expect(clicked).toBeTruthy();
});
