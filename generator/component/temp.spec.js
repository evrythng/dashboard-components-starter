import {<%= upCaseName %>Controller} from './<%= name %>';

describe('<%= name %> component', () => {
  let ctrl;

  beforeEach(() => {
    ctrl = new <%= upCaseName %>Controller();
  });

  it('should have initial state', () => {
    expect(ctrl.name).to.equal('<%= name %>');
  });

  // ...
});
