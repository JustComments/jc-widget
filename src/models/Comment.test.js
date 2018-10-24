import { Comment } from './Comment';

it('tests comment model', () => {
  const comment = new Comment({
    itemId: 'itemId',
    commentUrl: 'http://127.0.0.1:3333/#jcb2d45575-b253-428e-8697-cd75bd16ba04',
    commentId: '1',
    nestedComments: ['2'],
    userId: '1',
    username: 'username',
    userPic:
      'https://pbs.twimg.com/profile_images/790168316778340352/KiTXTQH7_normal.jpg',
    userUrl: 'https://twitter.com/@orKoN',
    message: 'test',
    htmlMessage: '<p>test</p>\n',
    createdAt: '2018-10-21T20:30:25.228Z',
    rating: 0,
    hidden: false,
  });
  expect(comment.isHidden()).toBe(false);
  expect(comment.getCommentUrl(window)).toBe('http://localhost/#jc1');
});
