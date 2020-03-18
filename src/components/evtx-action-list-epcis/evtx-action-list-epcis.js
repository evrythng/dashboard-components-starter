'use strict';

require('./evtx-action-list-epcis.scss');
var template = require('./evtx-action-list-epcis.html');
var _ = require('./lodash');

export class epcisActionList {
  /* @ngInject */
  constructor($scope,
              $filter,
              $q,
              $translate,
              $mdMedia,
              Context,
              ActionService,
              ActionTypeService,
              ListService,
              ModalService,
              EVT) {
    'ngInject';

    var ctrl = this;
    var perPage = 30;

    // Context
    ctrl.context = {
      project: Context.getCurrentProject(),
      filter: Context.getCurrentFilter(),
      dateRange: Context.getCurrentDateRange()
    };

    // State
    ctrl.state = {
      loading: false,
      showLocation: true
    };

    ctrl.openAction = openAction;
    ctrl.search = search;
    ctrl.getSize = getSize;
    ctrl.$onInit = $onInit;
    ctrl.$onSizeChange = $onSizeChange;
    ctrl.getResourceId = getResourceId;
    ctrl.getResourceType = getResourceType;
    ctrl.refreshDate = refreshDate;

    $scope.$watch(Context.getCurrentProject, updateSearch('project'));
    $scope.$watch(Context.getCurrentFilter, updateSearch('filter'), true);
    $scope.$watch(Context.getCurrentDateRange, updateSearch('dateRange'), true);

    // ****************** PRIVATE ******************

    /**
     * $onInit component lifecycle hook
     */
    function $onInit() {
      return search();
    }

    /**
     * For any given moment of time - completely refreshes the widget
     * data taking into account its current state
     *
     * @return {Promise<Object[]>}
     */
    function search() {
      ctrl.state.loading = true;

      updateView();

      return findActions().finally(function () {
        ctrl.state.loading = false;
      });
    }

    /**
     * For current widget state, taking into account global Context
     * retrieves an iterator for the actions list
     *
     * @return {Promise<Object[]>}
     */
    function findActions() {
      var params = getParams();
      var iterator = EVT.operator.action('all').iterator({params: params});

      ctrl.listIterator = ListService.getIterator('actions', ctrl.context, {
        iterator: iterator,
        perPage: perPage,
        mapFn: fillActions
      });

      return ctrl.listIterator.init();
    }

    /**
     * For given actions array, finds and assigns all the referenced
     * resources
     *
     * @param {Object[]} actions
     */
    function fillActions(actions) {
      return $q.when(collectReferences(actions))
        .then(function (references) {
          return $q.all([
            fillResource(references),
            fillUser(references),
            fillApplication(references),
            fillActionType(references)
          ]);
        })
        .then(function () {
          return actions;
        });
    }

    /**
     * For given actions array, builds a map of referenced resources
     * (user, application, thng, product, collection)
     *
     * @param {Object[]} actions
     * @return {Object}
     *   @prop {Object} app - application references
     *   @prop {Object} thng - thng references
     *   @prop {Object} product - product references
     *   @prop {Object} collection - collection references
     *   @prop {Object} type - action type references
     */
    function collectReferences(actions) {
      var references = {
        app: {}
      };

      var mapTemplate = {
        ids: [],
        items: []
      };

      ['thng', 'product', 'collection', 'user', 'type'].forEach(function (key) {
        references[key] = angular.copy(mapTemplate);
      });

      actions.forEach(function (action) {
        if (action.thng) {
          store(references.thng, action, 'thng');
        } else if (action.product) {
          store(references.product, action, 'product');
        } else if (action.collection) {
          store(references.collection, action, 'collection');
        }

        if (action.user) {
          store(references.user, action, 'user');
        }

        if (action.createdByProject && action.createdByApp) {
          references.app[action.createdByProject] =
            references.app[action.createdByProject] || angular.copy(mapTemplate);
          store(references.app[action.createdByProject], action, 'createdByApp');
        }

        store(references.type, action, 'type');
      });

      return references;
    }

    /**
     * Puts given item to given map object
     *
     * @param {Object} mapObj
     * @param {Object} item
     * @param {String} key - to be used as item identifier
     */
    function store(mapObj, item, key) {
      mapObj.items.push(item);
      mapObj.ids.push(item[key]);
    }

    /**
     * For given references, fills all the related resources
     *
     * @param {Object} references
     *   @prop {String} thng - thng references
     *   @prop {String} product - product references
     *   @prop {String} collection - collection references
     */
    function fillResource(references) {
      var promises = [];

      ['thng', 'product', 'collection'].forEach(function (type) {
        if (references[type].ids.length) {
          promises.push(fillResourceType(type, references[type].ids, references[type].items));
        }
      });

      return $q.all(promises);
    }

    /**
     * For given type reads all resources with given ids
     * and assigns them to corresponding actions
     *
     * @param {String} type - thng, product or collection
     * @param {String[]} ids - ids of resources
     * @param {Object[]} items - actions to fulfill
     */
    function fillResourceType(type, ids, items) {
      return EVT.operator[type]().read({
        params: $filter('evtScope')({
          ids: _.uniq(ids).join(',')
        })
      }).then(function (result) {
        result = _.compact(result);
        return items.map(function (action) {
          action.target = _.find(result, {id: action[type]});
          if (action.target) {
            action.target.link = buildResourceLink(type);
            action.target.linkParams = buildResourceLinkParams(type, action.target);
            action.target.type = $translate.instant(type + 's.' + type);
          }
          return action;
        });
      }).catch(function () {
        return items;
      });
    }

    /**
     * For given references object, reads all related users and
     * assigns them to corresponding actions
     *
     * @param {Object} references
     *   @prop {String[]} ids - user ids
     */
    function fillUser(references) {
      if (references.user.ids.length) {
        return EVT.operator.user().read({
          params: $filter('evtScope')({
            ids: _.uniq(references.user.ids).join(',')
          })
        }).then(function (result) {
          result = _.compact(result);
          return references.user.items.map(function (action) {
            action.user = _.find(result, {id: action.user});
            return action;
          });
        }).catch(function () {
          return references.user.items;
        });
      }
    }

    /**
     * For given references object, reads all related applications and
     * assigns them to corresponding actions
     *
     * @param {Object} references
     *   @prop {String[]} ids - application ids
     */
    function fillApplication(references) {
      var promises = [];

      _.forOwn(references.app, function (val, key) {
        if (val.ids.length) {
          promises.push(EVT.operator.project(key).application().read({
            params: $filter('evtScope')({
              ids: _.uniq(val.ids).join(',')
            })
          }).then(function (result) {
            result = _.compact(result);
            return val.items.map(function (action) {
              action.application = _.find(result, {id: action.createdByApp});
              return action;
            });
          }).catch(angular.noop));
        }
      });

      return $q.all(promises);
    }

    /**
     * For given references object, reads all related action types and
     * assigns them to corresponding actions
     *
     * @param {Object} references
     *   @prop {String[]} ids - action type names
     */
    function fillActionType(references) {
      if (references.type.ids.length) {
        return EVT.operator.actionType().read({
          params: $filter('evtScope')({
            filter: 'name=' + _.uniq(references.type.ids).join(',')
          })
        }).then(function (result) {
          result = _.compact(result);

          return references.type.items.map(function (action) {
            action.type = _.clone(_.find(result, {name: action.type})) || {name: action.type};
            //action.type.name = ActionTypeService.buildDisplayName(action.type);

            return action;
          });
        }).catch(function () {
          return references.type.items;
        });
      }
    }

    /**
     * Returns resource page state identifier
     *
     * @param {String} resourceType
     * @return {string}
     */
    function buildResourceLink(resourceType) {
      return 'app.resources.' + resourceType + 's.detail';
    }

    /**
     * For given resource types, returns object consumable by
     * $stateParams as parameters for target state (resource page)
     *
     * @param {String} resourceType
     * @param {Object} resource
     * @return {Object}
     */
    function buildResourceLinkParams(resourceType, resource) {
      var params = {};
      params[resourceType + 'Id'] = resource.id;
      return params;
    }

    /**
     * Opens given action in ActionDetails modal
     *
     * @param {Event} event
     * @param {Object} action - action with filled references
     */
    function openAction(event, action) {

      // Little hack to prevent inner links from opening the modal.
      // $event.stopPropagation() would stop Angular event bubbling, making
      // the link reload the entire page, instead of simply changing the path.
      if (event.target.nodeName === 'A') {
        return;
      }

      ModalService.show({
        targetEvent: event,
        templateUrl: 'common/views/actionModal',
        controller: 'ActionModalController',
        locals: {
          action: action
        }
      });
    }

    /**
     * Updates given property within controller context
     *
     * @param {String} contextProperty
     * @return {Function}
     */
    function updateSearch(contextProperty) {
      return function (newContext, oldContext) {
        if (newContext !== oldContext) {
          ctrl.context[contextProperty] = newContext;
          search();
        }
      };
    }

    /**
     * Returns parameters object to be used for querying API
     * Ensures correct filter and scope applied
     *
     * @return {Object}
     */
    function getParams() {
      var types, filter;

      ctrl.context.filter = angular.copy(Context.getCurrentFilter());
      types = getTargetTypes();

      displayTypes(types);

      if (types.length) {
        _.set(ctrl, 'context.filter.type', types);
      }

      filter = ActionService.buildFilter(ctrl.context.filter, ctrl.context.dateRange);

      return _.extend(
        $filter('evtScope')({context: shouldShowLocation()}),
        $filter('toFilterParams')(filter)
      );
    }

    /**
     * Build action type names to display in the view.
     * Attach to the ctrl.
     */
    function displayTypes(types) {
      ctrl.displayTypes = types.map(function (type) {
        return ActionTypeService.buildDisplayName({name: type});
      });
    }

    /**
     * Returns all action types should be used, depending
     * on global filter and widget configuration
     *
     * @return {String[]}
     */
    function getTargetTypes() {
      var configTypes = _.get(ctrl, 'evtWidget.config.actionTypes.value', []);
      var filterType = _.get(ctrl, 'context.filter.type');

      if (configTypes.length) {
        return configTypes;
      } else {
        return filterType ? [filterType] : [];
      }
    }

    /**
     * Updates state configuration
     */
    function updateView() {
      ctrl.state.showLocation = shouldShowLocation();
    }

    /**
     * Returns true if list should show context location
     * @return {Boolean}
     */
    function shouldShowLocation() {
      return _.get(ctrl.evtWidget, 'config.showLocation.value', true);
    }

    /**
     * Updates grid size descriptor
     *
     * @param {Object} size - widget size object
     *   @prop {Number} sizeX - width of widget in columns
     */
    function $onSizeChange(size) {
      ctrl.state.width = {1: 'sm', 2: 'md', 3: 'lg'}[size.sizeX || 2];
    }

    /**
     * Returns size descriptor for the widget
     * When gt-md - means widget is within the grid and its size should be
     * estimated in columns (state.width)
     * When equal or smaller - means grid is in "column" mode and actual screen
     * size could be used as descriptor.
     *
     * @return {string}
     */
    function getSize() {
      return $mdMedia('gt-sm') ? ctrl.state.width : $mdMedia('sm') ? 'md' : 'sm';
    }


    function getResourceId(resourceURN){
      console.log("Resource " + resourceURN);
      let id = resourceURN.split(':');
      return id[id.length-1];
    }

    function getResourceType(resourceURN){
      if (resourceURN.startsWith("urn:evrythng:id:sscc")){
        return "SSCC";
      }
      else if (resourceURN.startsWith("urn:evrythng:po:")){
        return "Purchase Order";
      }
      else if (resourceURN.startsWith("urn:epc:class:lgtin:")){
        return "Lot Number"
      }
      else {
        return resourceURN;
      }
    }

    function refreshDate(timestamp) {
      let date = new Date(timestamp);
      return date.toLocaleString();
//        return this.$filter('evtDate')(timestamp, 'ago');
    }
  }
}

const component = {
  template: template,
  controller: epcisActionList,

  bindings: {
    evtWidget: '<'
  },

  defaultConfig: {

    position: {
      value: {
        sizeX: 3,
        sizeY: 2
      }
    },

    title: {
      required: true,
      value: 'EPCIS Actions'
    },

    description: {
      value: 'EPCIS Filterable actions list'
    },

    // Defines if location context shown
    showLocation: {
      value: true,
      displayName: 'components.actions.config.showLocation',
      editor: 'evt-widget-config-boolean'
    },

    actionTypes: {
      editor: 'evt-widget-config-action-types',
      value: []
    }
  }
};

angular.module('components.epcisActionList', [])
  .config(WidgetsProvider => {
    'ngInject';

    WidgetsProvider.register('epcisActionList', component);
  })
  .component('epcisActionList', component);
