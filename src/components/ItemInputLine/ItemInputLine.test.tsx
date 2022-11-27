import React from 'react';
import { shallow } from 'enzyme';
import { ItemInputLine } from './ItemInputLine';

describe('<ItemInputLine />', () => {
  let component;

  beforeEach(() => {
    component = shallow(<ItemInputLine item={{id: 'id', text: 'item', loaded: false, loaded2: false}}/>);
  });

  test('It should mount', () => {
    expect(component.length).toBe(1);
  });
});
