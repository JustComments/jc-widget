import { CommentCollection } from './CommentCollection';
import { Comment } from './Comment';

it('tests comment collection model', () => {
  const comments = [
    new Comment({
      itemId: 'itemId',
      commentUrl:
        'http://127.0.0.1:3333/#jcb2d45575-b253-428e-8697-cd75bd16ba04',
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
    }),
    new Comment({
      itemId: 'itemId',
      commentUrl:
        'http://127.0.0.1:3333/#jcb2d45575-b253-428e-8697-cd75bd16ba04',
      commentId: '2',
      nestedComments: [],
      userId: '2',
      username: 'username',
      userPic:
        'https://pbs.twimg.com/profile_images/790168316778340352/KiTXTQH7_normal.jpg',
      userUrl: 'https://twitter.com/@orKoN',
      message: 'test2',
      htmlMessage: '<p>test2</p>\n',
      createdAt: '2018-10-21T20:32:25.228Z',
      rating: 0,
      hidden: false,
      replyTo: '1',
      parentId: '1',
    }),
  ];
  const collection = new CommentCollection(comments, null, 'asc');
  expect(collection.count()).toBe(2);
});
