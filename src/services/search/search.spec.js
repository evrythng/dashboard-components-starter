import SearchService from './search';

describe('Search service', () => {
  let Search;

  beforeEach(() => {
    Search = new SearchService();
  });

  const cb = sinon.spy(),
    ccb = sinon.spy(),
    filter = {
      id: 'thng1'
    };

  describe('updateSearch', () => {
    it('should update search', function () {
      expect(Search.getSearch()).to.be.undefined;
      Search.updateSearch(filter);
      expect(Search.getSearch()).to.equal(filter);
    });

    it('should call all listeners with new search', () => {
      Search.onSearchChange(cb);
      Search.onSearchChange(ccb);
      Search.updateSearch(filter);

      [cb, ccb].forEach(fn => {
        expect(fn).to.have.been.calledOnce;
        expect(fn).to.have.been.calledWith(filter);
      });
    });
  });

});
