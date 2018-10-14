import { c, getStyles } from './style';

it('should generate styles', () => {
  expect(
    c(`{
      border: 1px solid black;
    }
    :pseudo {
      border: 1px solid black;
    }`),
  ).toEqual(`jcGenCls1`);
});
