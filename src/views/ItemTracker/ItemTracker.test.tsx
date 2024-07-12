import React from "react";
import { shallow } from "enzyme";
import { ItemTracker } from "./ItemTracker";

describe("<ItemTracker />", () => {
  let component;

  beforeEach(() => {
    component = shallow(<ItemTracker />);
  });

  test("It should mount", () => {
    expect(component.length).toBe(1);
  });
});
