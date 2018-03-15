import './my-map.scss';
import './configuration/my-map-marker-color/my-map-marker-color';

import * as _ from 'lodash';

export class MyMapController {

  /**
   * Setup injection and initialize component variables here.
   *
   * @param $rootScope - needed for listening of draggable state change event
   * @param $scope - needed for applying changes to view
   * @param $timeout - needed for ensuring that reflow happens after component is rendered
   * @param Search - communication service between components
   * @param EVT - EVT.operator is a fully instantiated Operator scope from EVT.js
   * https://github.com/evrythng/evrythng-extended.js
   * @param leafletData - provider of leaflet controller to manipulate the map
   */
  constructor($rootScope, $scope, $timeout, Search, EVT, leafletData) {
    "ngInject";

    this.$scope = $scope;
    this.$timeout = $timeout;
    this.Search = Search;
    this.EVT = EVT;
    this.leafletData = leafletData;

    /**
     * Thng chosen in filter toolbar.
     * @type {object}
     */
    this.filter = null;

    /**
     * Map configuration. The built-in map service uses Leaflet.js.
     * See configuration examples:
     * http://tombatossals.github.io/angular-leaflet-directive/examples/0000-viewer.html
     * @type {*}
     */
    this.map = {
      center: {},
      markers: {},
      tiles: {
        url: 'https://api.tiles.mapbox.com/v3/evrythng.i2neoph9/{z}/{x}/{y}.png',
        options: {attribution: false}
      },
      defaults: {
        scrollWheelZoom: false
      }
    };

    // When entering or leaving draggable mode, ensure correct map size known
    $rootScope.$on('draggableModeChanged', this.reflowMap.bind(this));
  }

  /**
   * Run initialization code here.
   * See component lifecycle hooks:
   * https://docs.angularjs.org/guide/component
   */
  $onInit() {

    // Try to get user geolocation to center the map.
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(position => {
        this.$scope.$apply(() => {
          this.map.center = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            zoom: 5
          };
        })
      });
    }

    // Start listening for actions via WebSockets.
    this.subscribeToActions();

    // Listen for filter changes and update state accordingly.
    this.Search.onSearchChange(thng => this.filter = thng);
    this.reflowMap();
  }

  /**
   * Run cleanup code here.
   * See component lifecycle hooks:
   * https://docs.angularjs.org/guide/component
   */
  $onDestroy() {
    this.EVT.operator.action('all').unsubscribe();
  }

  /**
   * Reacts to widget configuration change by updating marker styles
   */
  $onConfigChange() {
    _.forOwn(this.map.markers, marker => marker.icon = this.getIcon());
  }

  /**
   * Subscribe to all types of actions and filter based
   * on the selected thng in the toolbar.
   */
  subscribeToActions() {

    // EVT service also contains WebSocket plugin:
    // https://github.com/evrythng/evrythng-ws.js
    this.EVT.operator.action('all').subscribe(this.addAction.bind(this));
  }

  /**
   * Clear markers from the map.
   */
  clearMarkers() {
    this.map.markers = {};
  }

  /**
   * Adds action to the map
   *
   * @param {Object} action
   */
  addAction(action) {
    if (this.isFilteredAction(action)) {
      this.$scope.$apply(() => {
        this.map.markers[action.id] = {
          lat: action.location.position.coordinates[1],
          lng: action.location.position.coordinates[0],
          icon: this.getIcon()
        };
      });
    }
  }

  /**
   * Returns true if given action could be displayed
   *
   * @param {object} action
   * @return {boolean}
   */
  isFilteredAction(action) {
    const isFilteredThng = !this.filter || this.filter.id === action.thng;
    const filteredActionTypes = _.get(this, 'evtWidget.config.actionTypes.value', []);
    const isFilteredAction = filteredActionTypes.length ? filteredActionTypes.indexOf(action.type) !== -1 : true;

    return isFilteredThng && isFilteredAction;
  }

  /**
   * Checks if there are any markers on the map.
   * @returns {boolean}
   */
  markersExist() {
    return !_.isEmpty(this.map.markers);
  }

  /**
   * Ensures leaflet knows current map size
   */
  reflowMap() {
    this.leafletData.getMap()
      .then(renderer => this.$timeout(() => renderer.invalidateSize()));
  }

  /**
   * @typedef {object} Icon
   * @property {string} iconUrl - url to load icon image
   * @property {string} iconSize - icon image size to apply correct offsets
   */

  /**
   * Returns icon object config for leflet based on current widget config
   * @return {Icon}
   */
  getIcon() {
    return {
      iconUrl: this.getIconURL('pin-s', this.getIconColor()),
      iconSize: [20, 50]
    };
  }

  /**
   * Returns desired marker color for the map, tries to read it from configuration
   *
   * @return {string}
   */
  getIconColor() {
    return _.get(this, 'evtWidget.config.markerColor.value', '599CD2');
  }

  /**
   * Builds an icon URL based on given name and color.
   * for reference: https://www.mapbox.com/maki/
   *
   * @param {string} icon
   * @param {string} color
   * @return {string}
   */
  getIconURL(icon, color) {
    return 'https://a.tiles.mapbox.com/v3/marker/' + icon + '+' + color + '.png';
  }
}

export default {
  template: `
    <evtx-widget-base class="without-footer" evt-widget="$ctrl.evtWidget" on-config-change="$ctrl.$onConfigChange()">
      <widget-body layout="column" flex>
        <leaflet flex
                 class="map-container"
                 lf-center="$ctrl.map.center"
                 defaults="$ctrl.map.defaults"
                 markers="$ctrl.map.markers"
                 tiles="$ctrl.map.tiles">
        </leaflet>
        <md-button ng-disabled="!$ctrl.markersExist()" 
                   ng-click="$ctrl.clearMarkers()"
                   class="md-fab md-mini" 
                   aria-label="Clear pins">
            <md-tooltip md-direction="left">Clear pins</md-tooltip>
            <!-- Dashboard includes Material Desidng Icons: https://materialdesignicons.com/ -->
            <md-icon class="mdi mdi-map-marker-off"></md-icon>
        </md-button>
      </widget-body>
    </evtx-widget-base>
  `,
  controller: MyMapController,


  /**
   * This object stores default configuration for your widget
   */
  evtWidget: {
    defaultConfig: {
      title: {
        value: 'Real-time Actions'
      },

      description: {
        value: 'This map pins new actions in real-time'
      },

      actionTypes: {
        editor: 'evt-widget-config-action-types',
        value: []
      },

      /**
       * Example of custom editor for widget configuration.
       * "editor" field should be a name of component with certain interface, accepting
       * configuration model and exposing changes. More could be found in "my-map-marker-color"
       * component sources, in "configuration" folder
       */
      markerColor: {
        editor: 'my-map-marker-color',
        value: '599CD2'
      }
    }
  }
};
