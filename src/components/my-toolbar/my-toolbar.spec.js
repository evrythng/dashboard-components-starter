import {MyToolbarController} from './my-toolbar';

describe('my-toolbar component', () => {
  let evt, search, ctrl;

  const searchText = 'foobar',
    filter = {
      id: 'thng1'
    };

  beforeEach(() => {
    evt = {
      operator: {
        thng: sinon.stub().returns({
          read: sinon.stub().returns(Promise.resolve())
        })
      }
    };
    search = {
      updateSearch: sinon.spy()
    };
    ctrl = new MyToolbarController(search, evt);
  });

  describe('search', function () {
    it('should return EVT.js read promise', function () {
      expect(ctrl.search().then).to.be.defined;
    });

    it('should search thngs by name', function () {
      var filterStr = 'name=' + searchText + '*';
      ctrl.search(searchText);
      expect(evt.operator.thng).to.have.been.calledWith();
      expect(evt.operator.thng().read).to.have.been.calledWith({
        params: {
          filter: filterStr
        }
      });
    });
  });

  describe('updateSearch', function () {
    it('should store thng in Search service', function () {
      ctrl.updateSearch(filter);
      expect(search.updateSearch).to.have.been.calledWith(filter);
    });
  });

});
