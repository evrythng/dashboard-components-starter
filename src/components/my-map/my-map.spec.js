import {MyMapController} from './my-map';

describe('my-map component', () => {
  let evt, search, scope, rootScope,
    timeout, ctrl, leafletData, leafletMap;

  const position = {
      coords: {
        latitude: 51.5305195,
        longitude: -0.0860023
      }
    },
    filter = {
      id: 'thng1'
    },
    evtWidget = {
      config: {
        'actionTypes': {
          value: [ '_CustomAction' ]
        }
      }
    };


  beforeEach(inject(($rootScope) => {
    scope = $rootScope.$new();
  }));

  beforeEach(() => {
    evt = {
      operator: {
        action: sinon.stub().returns({
          subscribe: () => {},
          unsubscribe: () => {}
        })
      }
    };
    search = {
      onSearchChange: () => {}
    };
    rootScope = {
      $on: sinon.stub()
    };
    timeout = sinon.stub();
    leafletMap = {
      invalidateSize: sinon.stub()
    };
    leafletData = {
      getMap: sinon.stub().returnsPromise().resolves(leafletMap)
    };

    ctrl = new MyMapController(rootScope, scope, timeout, search, evt, leafletData);
  });

  describe('instantiation', () => {
    it('should have initial state', () => {
      expect(ctrl.filter).to.be.null; // no filter
      expect(ctrl.map.markers).to.be.empty; // no markers
    });

    it('should listen for draggableModeChanged event', () => {
      expect(rootScope.$on).to.have.been.calledWith('draggableModeChanged');
    });
  });

  describe('$onInit', () => {
    beforeEach(() => {
      sinon.stub(navigator.geolocation, 'getCurrentPosition', cb => cb(position));
      sinon.spy(evt.operator.action(), 'subscribe');
      ctrl.$onInit();
    });

    afterEach(() => navigator.geolocation.getCurrentPosition.restore());

    it('should center map in current user location', () => {
      expect(navigator.geolocation.getCurrentPosition).to.have.been.called;
      scope.$digest();
      expect(ctrl.map.center).to.not.be.empty;
      expect(ctrl.map.center.lat).to.equal(position.coords.latitude);
      expect(ctrl.map.center.lng).to.equal(position.coords.longitude);
    });

    it('should start listening for all actions', () => {
      expect(evt.operator.action).to.have.been.calledWith('all');
      expect(evt.operator.action().subscribe).to.have.been.called;
    });

    it('should ensure map knows its size', () => {
      expect(leafletData.getMap).to.have.been.called;
      expect(timeout).to.have.been.calledAfter(leafletData.getMap);

      timeout.lastCall.args[0]();

      expect(leafletMap.invalidateSize).to.have.been.called;
    });
  });

  describe('$onDestroy', () => {
    beforeEach(() => {
      sinon.spy(evt.operator.action(), 'unsubscribe');
      ctrl.$onDestroy();
    });

    it('should unsubscribe from the actions events', () => {
      expect(evt.operator.action).to.have.been.calledWith('all');
      expect(evt.operator.action().unsubscribe).to.have.been.called;
    });
  });

  describe('subscribeToActions', () => {
    var lat = 0, lng = 1, action;

    beforeEach(() => {
      action = {
        id: 'actionId',
        thng: 'thng1',
        type: '_Any',
        location: {
          position: {
            coordinates: [lng, lat]
          }
        }
      };
    });

    afterEach(() => evt.operator.action().subscribe.restore());

    it('should add pin to map if not filtered', () => {
      sinon.stub(evt.operator.action(), 'subscribe', cb => cb(action));

      ctrl.subscribeToActions();
      scope.$digest();
      expect(ctrl.map.markers).to.not.be.empty;
      expect(ctrl.map.markers[action.id]).to.be.ok;
      expect(ctrl.map.markers[action.id].lat).to.equal(lat);
      expect(ctrl.map.markers[action.id].lng).to.equal(lng);
    });

    it('should not add pin to map if filtered and doesn\'t match', () => {
      action.thng = 'thng2';
      sinon.stub(evt.operator.action(), 'subscribe', cb => cb(action));

      ctrl.filter = filter;
      ctrl.subscribeToActions();
      scope.$digest();
      expect(ctrl.map.markers).to.be.empty;
    });

    it('should not add pin to map if action type filtered', () => {
      action.type = '_Any';
      sinon.stub(evt.operator.action(), 'subscribe', cb => cb(action));

      ctrl.evtWidget = evtWidget;
      ctrl.subscribeToActions();
      scope.$digest();
      expect(ctrl.map.markers).to.be.empty;
    });

    it('should add pin to map if filtered and matches', () => {
      sinon.stub(evt.operator.action(), 'subscribe', cb => cb(action));

      ctrl.filter = filter;
      ctrl.subscribeToActions();
      scope.$digest();
      expect(ctrl.map.markers).to.not.be.empty;
      expect(ctrl.map.markers[action.id]).to.be.ok;
      expect(ctrl.map.markers[action.id].lat).to.equal(lat);
      expect(ctrl.map.markers[action.id].lng).to.equal(lng);
    });

    it('should add pin to map if action type matches filter', () => {
      action.type = '_CustomAction';
      sinon.stub(evt.operator.action(), 'subscribe', cb => cb(action));

      ctrl.evtWidget = evtWidget;
      ctrl.subscribeToActions();
      scope.$digest();
      expect(ctrl.map.markers).to.not.be.empty;
      expect(ctrl.map.markers[action.id]).to.be.ok;
      expect(ctrl.map.markers[action.id].lat).to.equal(lat);
      expect(ctrl.map.markers[action.id].lng).to.equal(lng);
    });
  });

  describe('clearMarkers', () => {
    beforeEach(() => {
      ctrl.map.markers = {test: {}};
      ctrl.clearMarkers();
    });

    it('should clear the markers', () => {
      expect(ctrl.map.markers).to.be.empty;
    });
  });

  describe('markersExist', function () {
    it('should return true if there are markers on the map', () => {
      ctrl.map.markers = {test: {}};
      expect(ctrl.markersExist()).to.be.true;
    });

    it('should return false if there are no markers on the map', () => {
      expect(ctrl.markersExist()).to.be.false;
    });
  });

  describe('on filter change', () => {
    beforeEach(() => {
      sinon.stub(search, 'onSearchChange', cb => cb(filter));
      ctrl.$onInit();
    });

    afterEach(() => search.onSearchChange.restore());

    it('should update filter', () => {
      expect(ctrl.filter).to.equal(filter);
    });
  });

  describe('getIcon', () => {
    it('should return icon config', () => {
      let icon = ctrl.getIcon();
      let color = ctrl.getIconColor();

      expect(icon.iconUrl).to.include('pin-s');
      expect(icon.iconUrl).to.include(color);
      expect(icon.iconSize).to.eql([20, 50]);
    });
  });

});
