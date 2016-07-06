import {MyChartController} from './my-chart';

describe('my-chart component', () => {
  let scope, evt, search, ctrl;

  const thng = {
      id: 'id1',
      name: 'name1',
      properties: {
        a: 1,
        b: 2
      }
    },
    properties = [{
      thng: thng.id,
      key: 'a',
      value: 2,
      timestamp: 1
    }, {
      thng: thng.id,
      key: 'b',
      value: 3,
      timestamp: 1
    }],
    thngs = [thng],
    normalizedProperties = [{
      thng: {
        id: thng.id,
        name: thng.name
      },
      prop: {
        name: 'a',
        value: thng.properties.a
      }
    }, {
      thng: {
        id: thng.id,
        name: thng.name
      },
      prop: {
        name: 'b',
        value: thng.properties.b
      }
    }];

  beforeEach(inject(($rootScope) => {
    scope = $rootScope.$new();
  }));

  beforeEach(() => {
    thng.property = sinon.stub().returns({
      subscribe: () => {},
      unsubscribe: () => {}
    });
    evt = {
      operator: {
        thng: sinon.stub().returns({
          read: sinon.stub().returns({
            then: (cb) => cb(thngs)
          })
        })
      }
    };
    search = {
      onSearchChange: () => {}
    };
    ctrl = new MyChartController(scope, search, evt);
  });

  it('should have initial state', () => {
    expect(ctrl.title).to.equal('Real-time Properties');
    expect(ctrl.subscriptions).to.be.empty; // no subscriptions yet
    expect(ctrl.chart.series).to.be.empty; // no datapoints yet
  });

  describe('normalizeProperties', () => {
    it('should return an array with all properties of thng', () => {
      var properties = MyChartController.normalizeProperties(thng);

      expect(properties.length).to.equal(2);
      expect(properties).to.deep.equal(normalizedProperties);
    });
  });

  describe('$onInit', () => {
    beforeEach(() => {
      sinon.spy(ctrl, 'subscribeToProperties');
      ctrl.$onInit();
    });

    it('should read thngs', () => {
      expect(evt.operator.thng().read).to.have.been.called;
    });

    it('should normalize thngs properties', () => {
      expect(ctrl.properties).to.deep.equal(normalizedProperties);
    });

    it('should subscribe to thngs property updates', () => {
      expect(ctrl.subscribeToProperties).to.have.been.called;
    });
  });

  describe('subscribeToProperties', function () {
    var subscribeMock;

    beforeEach(() => {subscribeMock = sinon.stub(thng.property(), 'subscribe')});

    afterEach(() => thng.property().subscribe.restore());

    it('should subscribe to property updates if multiple thngs', () => {
      ctrl.subscribeToProperties(thngs);
      expect(thng.property().subscribe).to.have.been.called;
    });

    it('should subscribe to property updates if single thng', () => {
      ctrl.subscribeToProperties(thng);
      expect(thng.property().subscribe).to.have.been.called;
    });

    it('should store existing subscriptions', () => {
      ctrl.subscribeToProperties(thngs);
      expect(ctrl.subscriptions.length).to.equal(1);
      expect(ctrl.subscriptions).to.contain(thng.property());
    });

    it('should update property on update', () => {
      sinon.spy(ctrl, 'updateProperty');
      ctrl.$onInit();

      subscribeMock.yields(properties);
      ctrl.subscribeToProperties(thngs);

      expect(ctrl.updateProperty).to.have.been.calledWith(properties[0]);
      expect(ctrl.updateProperty).to.have.been.calledWith(properties[1]);
    });

    it('should new properties to chart', () => {
      sinon.spy(ctrl, 'addToChart');
      ctrl.$onInit();

      subscribeMock.yields(properties);
      ctrl.subscribeToProperties(thngs);

      expect(ctrl.addToChart).to.have.been.calledWith(properties[0]);
      expect(ctrl.addToChart).to.have.been.calledWith(properties[1]);
    });
  });

  describe('unsubscribeAll', () => {
    beforeEach(() => {
      sinon.spy(thng.property(), 'unsubscribe');
      ctrl.subscriptions.push(thng.property());
      ctrl.unsubscribeAll();
    });

    it('should unsubscribe from all pending subscriptions', () => {
      expect(thng.property().unsubscribe).to.have.been.called;
      expect(ctrl.subscriptions).to.be.empty;
    });
  });

  describe('updateProperty', () => {
    beforeEach(() => {
      var props = angular.copy(normalizedProperties),
        prop = angular.extend(angular.copy(properties[0]), {thng: thng.name});
      ctrl.properties = props;
      ctrl.updateProperty(prop);
    });

    it('should update property value', () => {
      expect(ctrl.properties[0].prop.value).to.equal(properties[0].value);
    });
  });

  describe('addToChart', () => {
    it('should add series if there isn\'t for thng+property yet', () => {
      ctrl.addToChart(properties[0]);
      expect(ctrl.chart.series.length).to.equal(1);
      expect(ctrl.chart.series[0].name).to.equal('a (name1)');
      expect(ctrl.chart.series[0].data).to.not.be.empty;
      expect(ctrl.chart.series[0].data.length).to.equal(1);
    });

    it('should add data point to series if already exist', () => {
      ctrl.addToChart(properties[0]);
      ctrl.addToChart(properties[0]);
      expect(ctrl.chart.series.length).to.equal(1);
      expect(ctrl.chart.series[0].data.length).to.equal(2);
    });
  });
});
