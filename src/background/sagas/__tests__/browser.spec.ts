// import 'babel-polyfill';
import { take, put, call, apply } from 'redux-saga/effects';
import { incrementAsync } from '../browser';

describe('Test browser saga', () => {
  it('renders', () => {
    const generator = incrementAsync();
    expect(generator.next().value).toEqual(put({type: 'INCREMENT'}));
  })
});