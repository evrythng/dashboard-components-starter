import './my-map.scss';
import * as _ from 'lodash';

export class MyMapController {

  /**
   * Setup injection and initialize component variables here.
   * @param $scope - needed for applying changes to view
   * @param Search - communication service between components
   * @param EVT - EVT.operator is a fully instantiated Operator scope from EVT.js
   * https://github.com/evrythng/evrythng-extended.js
   */
  constructor($scope, Search, EVT) {
    "ngInject";
    this.$scope = $scope;
    this.Search = Search;
    this.EVT = EVT;

    /**
     * Widget title. Example of view binding.
     * @type {string}
     */
    this.title = 'Real-time Actions';

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
   * Subscribe to all types of actions and filter based
   * on the selected thng in the toolbar.
   */
  subscribeToActions() {

    // EVT service also contains WebSocket plugin:
    // https://github.com/evrythng/evrythng-ws.js
    this.EVT.operator.action('all').subscribe(action => {

      // Pin if there's no filter or if filter matches update.
      if(!this.filter || this.filter.id === action.thng){
        this.$scope.$apply(() => {
          this.map.markers[action.id] = {
            lat: action.location.position.coordinates[1],
            lng: action.location.position.coordinates[0]
          };
        });
      }

    });

  }

  /**
   * Clear markers from the map.
   */
  clearMarkers() {
    this.map.markers = {};
  }

  /**
   * Checks if there are any markers on the map.
   * @returns {boolean}
   */
  markersExist() {
    return !_.isEmpty(this.map.markers);
  }
}

export default {
  template: `
    <md-card>
      <md-card-header>
        <md-card-header-text layout-align=" center">
          <span class="md-headline">{{$ctrl.title}}</span>
        </md-card-header-text>
        <md-button ng-disabled="!$ctrl.markersExist()" 
                   ng-click="$ctrl.clearMarkers()"
                   class="md-icon-button md-primary" 
                   aria-label="Clear pins">
          <md-tooltip md-direction="left">Clear pins</md-tooltip>
          <!-- Dashboard includes Material Desidng Icons: https://materialdesignicons.com/ -->
          <md-icon class="mdi mdi-map-marker-off"></md-icon>
        </md-button>
      </md-card-header>
      <md-card-content>
        <p>This map pins new actions in real-time. Try adding some in the <a href="/testing">Testing</a> section.</p>
        <leaflet class="map-container"
                 lf-center="$ctrl.map.center"
                 defaults="$ctrl.map.defaults"
                 markers="$ctrl.map.markers"
                 tiles="$ctrl.map.tiles">
        </leaflet>
      </md-card-content>
    </md-card>
  `,
  controller: MyMapController
};
