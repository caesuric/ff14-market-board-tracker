import React from 'react';
import { shallow } from 'enzyme';
import Main from './Main';

describe('<Main />', () => {
  let component;

  beforeEach(() => {
    component = shallow(<Main />);
  });

  test('It should mount', () => {
    expect(component.length).toBe(1);
  });
});
