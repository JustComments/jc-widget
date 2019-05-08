import { sortByStrAttr, sortByNumAttr, keyBy } from './_';

it('sorts by string attribute', () => {
  expect(
    sortByStrAttr(
      [
        {
          str: '2018-01',
        },
        {
          str: '2017-01',
        },
      ],
      'str',
    ),
  ).toEqual([
    {
      str: '2017-01',
    },
    {
      str: '2018-01',
    },
  ]);
});

it('sorts by num attribute', () => {
  expect(
    sortByNumAttr(
      [
        {
          num: 1,
        },
        {
          num: -1,
        },
      ],
      'num',
    ),
  ).toEqual([
    {
      num: -1,
    },
    {
      num: 1,
    },
  ]);
});

it('keyBy', () => {
  expect(
    keyBy(
      [
        {
          id: 1,
        },
        {
          id: -1,
        },
      ],
      'id',
    ),
  ).toEqual({
    '-1': {
      id: -1,
    },
    '1': {
      id: 1,
    },
  });
});
