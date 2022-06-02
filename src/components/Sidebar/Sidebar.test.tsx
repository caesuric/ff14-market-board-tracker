import React from 'react';
import { shallow } from 'enzyme';
import Sidebar from './Sidebar';

describe('<Sidebar />', () => {
  let component;

  beforeEach(() => {
    component = shallow(<Sidebar />);
  });

  test('It should mount', () => {
    expect(component.length).toBe(1);
  });
});
