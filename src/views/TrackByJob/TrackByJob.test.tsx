import React from "react";
import { shallow } from "enzyme";
import { TrackByJob } from "./TrackByJob";

describe("<TrackByJob />", () => {
  let component;

  beforeEach(() => {
    component = shallow(<TrackByJob />);
  });

  test("It should mount", () => {
    expect(component.length).toBe(1);
  });
});
