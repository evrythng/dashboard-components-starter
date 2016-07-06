import <%= upCaseName %>Service from './<%= name %>';

describe('<%= upCaseName %> service', () => {
  let <%= upCaseName %>;

  const val = 'foobar';

  beforeEach(() => {
    <%= upCaseName %> = new <%= upCaseName %>Service();
  });

  it('should get and set value', function () {
    expect(<%= upCaseName %>.getValue()).to.be.undefined;
    <%= upCaseName %>.setValue(val);
    expect(<%= upCaseName %>.getValue()).to.equal(val);
  });

  // ...

});
