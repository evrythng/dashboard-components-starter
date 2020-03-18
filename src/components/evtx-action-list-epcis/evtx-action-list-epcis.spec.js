'use strict';

const component = require('./evtx-action-list-epcis');
const _ = require('lodash');

describe('evtx-action-list component', () => {
  let $controller;
  let scope;
  let ctrl;
  let EVTMock;
  let listServiceMock;
  let currentProject;
  let currentFilter = {};
  let currentDateRange = {};
  const isTargetMedia = false;

  const data = {
    actionType: [{id: 'actionType1', name: '_foobar'}],
    action: [{
      id: 'action1',
      type: 'scans',
      product: 'product1',
      user: 'user1',
      createdByProject: 'project1',
      createdByApp: 'app1'
    }, {
      id: 'action2',
      type:'_foobar',
      thng: 'thng1',
      createdByProject: 'project2',
      createdByApp: 'app2'
    }, {
      id: 'action3',
      type:'_foobar',
      collection: 'collection1'
    }],
    product: [{id: 'product1', name: 'Product Foo bar'}],
    thng: [{id: 'thng1', name: 'Thng Foo bar'}],
    collection: [{id: 'collection1', name: 'Collection Foo bar'}],
    user: [{id: 'user1', name: 'User Foo bar'}],
    application: [{id: 'app1', name: 'App Foo bar'}]
  };

  const projectId = 'projectId';


  // ****************** MOCKS *******************

  beforeEach(angular.mock.module($provide => {
    $provide.value('evtScopeFilter', params => angular.copy(params) || {});
  }));

  beforeEach(angular.mock.module($provide => {
    $provide.value('$translate', () => ({
      instant: jasmine.createSpy('$trasnlate.instant')
    }));
  }));

  beforeEach(angular.mock.module($provide => {
    $provide.value('$mdMedia', () => jasmine.createSpy('$mdMedia').and.callFake(() => isTargetMedia));
  }));

  beforeEach(angular.mock.module($provide => {
    $provide.factory('EVT', $q => {
      const resource = type => ({
        iterator: jasmine.createSpy('iterator').and.returnValue({next: angular.noop}),
        read: jasmine.createSpy('read').and.returnValue($q.when(angular.copy(data[type])))
      });

      EVTMock = {operator: {}};
      ['action', 'actionType', 'product', 'thng', 'collection', 'user'].forEach(type => {
        EVTMock.operator[type] = jasmine.createSpy(type).and.returnValue(resource(type));
        EVTMock.operator.project = jasmine.createSpy('project').and.returnValue({
          application: jasmine.createSpy('application').and.returnValue(resource('application'))
        });
      });

      return EVTMock;
    });
  }));

  beforeEach(angular.mock.module($provide => {
    $provide.factory('Context', () => ({
      getCurrentFilter: jasmine.createSpy('getCurrentFilter').and.callFake(() => currentFilter),
      getCurrentProject: jasmine.createSpy('getCurrentProject').and.callFake(() => currentProject),
      getCurrentDateRange: jasmine.createSpy('getCurrentDateRange').and.callFake(() => currentDateRange)
    }));
  }));

  beforeEach(angular.mock.module($provide => {
    $provide.factory('ListService', $q => listServiceMock = {
      getIterator: jasmine.createSpy('getIterator').and.callFake((name, context, options) => ({
        items: angular.copy(data.action),
        init: jasmine.createSpy('initIterator').and.callFake(() => $q.when(options.mapFn(angular.copy(data.action))))
      }))
    });
  }));

  beforeEach(angular.mock.module($provide => {
    $provide.factory('ActionService', () => ({
      buildFilter: jasmine.createSpy('ActionService.buildFilter').and.callFake(function() {
        return _.assign(...[{}].concat(Array.from(arguments)));
      })
    }));
  }));

  beforeEach(angular.mock.module($provide => {
    $provide.factory('ModalService', () => ({}));
  }));

  beforeEach(angular.mock.module($provide => {
    $provide.factory('ActionTypeService', () => ({
      buildDisplayName: jasmine.createSpy('buildDisplayName').and.callFake(at => at.name)
    }));
  }));

  beforeEach(angular.mock.module($provide => {
    $provide.factory('toFilterParamsFilter', () => value => value);
  }));

  beforeEach(() => {
    currentProject = {id: projectId};
    currentFilter = null;
    currentDateRange = {
      from: 0,
      to: 1
    };
  });

  // ****************** END OF MOCKS *******************


  beforeEach(inject(($rootScope, _$controller_) => {
    $controller = _$controller_;
    scope = $rootScope.$new();
  }));

  describe('controller', () => {
    beforeEach(() => {
      ctrl = $controller(component.controller, {
        $scope: scope
      });
    });

    it('should get current context', () => {
      expect(ctrl.context.project).toBe(currentProject);
      expect(ctrl.context.filter).toBe(currentFilter);
      expect(ctrl.context.dateRange).toBe(currentDateRange);
    });

    it('should start loading', () => {
      ctrl.$onInit();
      expect(ctrl.state.loading).toBe(true);
    });

    describe('.$onInit()', () => {
      let result;

      beforeEach(done => {
        ctrl.$onInit().then(initResult => {
          result = initResult;
          done();
        });
        scope.$digest();
      });

      it('should get action iterator with context param', () => {
        expect(EVTMock.operator.action).toHaveBeenCalledWith('all');
        expect(EVTMock.operator.action().iterator)
          .toHaveBeenCalledWith(jasmine.objectContaining({
            params: jasmine.objectContaining({
              context: true
            })
          }));
      });

      it('should try to get cached iterator with timestamp filter in context', () => {
        expect(listServiceMock.getIterator)
          .toHaveBeenCalledWith('actions', ctrl.context, jasmine.objectContaining({
            iterator: jasmine.any(Object),
            perPage: jasmine.any(Number),
            mapFn: jasmine.any(Function)
          }));
      });

      it('should attach list iterator to the scope', () => {
        expect(ctrl.listIterator).toBeDefined();
      });

      it('should init iterator', () => {
        expect(ctrl.listIterator.init).toHaveBeenCalled();
      });

      it('should stop loading', () => {
        expect(ctrl.state.loading).toBe(false);
      });

      it('should fill product reference in target', () => {
        expect(EVTMock.operator.product().read).toHaveBeenCalledWith({
          params: {
            ids: 'product1'
          }
        });
        expect(result[0].target).toEqual(jasmine.objectContaining(data.product[0]));
      });

      it('should fill thng reference in target', () => {
        expect(EVTMock.operator.thng().read).toHaveBeenCalledWith({
          params: {
            ids: 'thng1'
          }
        });
        expect(result[1].target).toEqual(jasmine.objectContaining(data.thng[0]));
      });

      it('should fill collection reference in target', () => {
        expect(EVTMock.operator.collection().read).toHaveBeenCalledWith({
          params: {
            ids: 'collection1'
          }
        });
        expect(result[2].target).toEqual(jasmine.objectContaining(data.collection[0]));
      });

      it('should fill user reference', () => {
        expect(EVTMock.operator.user().read).toHaveBeenCalledWith({
          params: {
            ids: 'user1'
          }
        });
        expect(result[0].user).toEqual(jasmine.objectContaining(data.user[0]));
      });

      it('should fill application reference', () => {
        expect(EVTMock.operator.project).toHaveBeenCalledWith('project1');
        expect(EVTMock.operator.project().application().read).toHaveBeenCalledWith({
          params: {
            ids: 'app1'
          }
        });
        expect(result[0].application).toEqual(jasmine.objectContaining(data.application[0]));
      });

      it('should handle deleted projects', () => {
        expect(result[1].application).toBeUndefined();
      });

      it('should fill action type reference', () => {
        expect(EVTMock.operator.actionType().read).toHaveBeenCalledWith({
          params: {
            filter: 'name=scans,_foobar'
          }
        });
        expect(result[1].type).toEqual(jasmine.objectContaining(data.actionType[0]));
      });
    });

    describe('on project change', () => {
      const newProject = {id: 'newProjectId'};

      beforeEach(() => {
        scope.$digest();
        currentProject = newProject;
        scope.$digest();
      });

      it('should update context', () => {
        expect(ctrl.context.project).toBe(newProject);
      });

      it('should search', () => {
        expect(listServiceMock.getIterator).toHaveBeenCalledWith('actions', jasmine.objectContaining({
          project: newProject
        }), jasmine.any(Object));
      });
    });

    describe('on filter change', () => {
      const newFilter = {name: 'foobar'};

      beforeEach(() => {
        scope.$digest();
        currentFilter = newFilter;
        scope.$digest();
      });

      it('should update context', () => {
        expect(ctrl.context.filter).toEqual(newFilter);
      });

      it('should search', () => {
        expect(listServiceMock.getIterator).toHaveBeenCalledWith('actions', jasmine.objectContaining({
          filter: newFilter
        }), jasmine.any(Object));
      });
    });

    describe('on daterange change', () => {
      const newDateRange = {from: 2, to: 4};

      beforeEach(() => {
        scope.$digest();
        currentDateRange = newDateRange;
        scope.$digest();
      });

      it('should update context', () => {
        expect(ctrl.context.dateRange).toBe(newDateRange);
      });

      it('should search', () => {
        expect(listServiceMock.getIterator).toHaveBeenCalledWith('actions', jasmine.objectContaining({
          dateRange: newDateRange
        }), jasmine.any(Object));
      });
    });
  });
});
