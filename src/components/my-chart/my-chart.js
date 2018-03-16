import './my-chart.scss';
import * as _ from 'lodash';

export class MyChartController {

  /**
   * Static method that converts a Thng document
   * into an array of properties for that thng.
   * @param thng - thng document
   * @returns {Array} - normalized properties for the given thng
   */
  static normalizeProperties(thng) {
    var props = [];
    for(var prop in thng.properties){
      props.push({
        thng: {
          name: thng.name,
          id: thng.id
        },
        prop: {
          name: prop,
          value: thng.properties[prop]
        }
      });
    }
    return props;
  }

  /**
   * Setup injection and initialize component variables here.
   *
   * @param $rootScope - needed for listening of draggable state change event
   * @param $scope - needed for applying changes to view
   * @param $q - angular promise library to wire third-party thenable objects and digest cycle
   * @param $timeout - needed for ensuring that reflow happens after component is rendered
   * @param Search - communication service between components
   * @param EVT - EVT.operator is a fully instantiated Operator scope from EVT.js
   *
   * https://github.com/evrythng/evrythng-extended.js
   */
  constructor($rootScope, $scope, $q, $timeout, Search, EVT) {
    "ngInject";

    this.$scope = $scope;
    this.$timeout = $timeout;
    this.Search = Search;
    this.EVT = EVT;
    this.q = $q;

    /**
     * Store 'open' property update listeners.
     * @type {Array}
     */
    this.subscriptions = [];

    /**
     * Simple line chart options. The built-in charting
     * service uses Highcharts.js. Check out other options:
     * http://api.highcharts.com/highcharts
     * https://github.com/pablojim/highcharts-ng
     * @type {*}
     */
    this.chart = {
      options: {
        chart: {
          defaultSeriesType: 'spline'
        }
      },
      series: [],
      title: {text: ''},
      xAxis: {
        type: 'datetime',
        tickPixelInterval: 150,
        maxZoom: 20 * 1000
      },
      yAxis: {
        gridLineWidth: 0,
        title: {text: ''}
      }
    };

    // Whenever draggable mode changed - ensures chart have correct size
    $rootScope.$on('draggableModeChanged', this.reflowChart.bind(this));
  }

  /**
   * Run initialization code here.
   * See component lifecycle hooks:
   * https://docs.angularjs.org/guide/component
   */
  $onInit() {
    // Using q wrapper to connect promise returned by EVT to angular $digest cycle
    // It guarantees that widget will be updated immediately as data resolved
    this.q.when(
      this.EVT.operator.thng().read()
    ).then(thngs => {

      // Normalize properties. One row per thng + property.
      this.properties = _.flatten(
        thngs.map(MyChartController.normalizeProperties)
      );

      // Subscribe to new property updates for all thngs.
      this.subscribeToProperties(thngs);

      // Listen for filter changes and start listening
      // only for changes on the selected thng (if one
      // selected) or all again (if it has been cleared).
      this.Search.onSearchChange(thng => {
        this.unsubscribeAll();
        this.subscribeToProperties(thng || thngs);
      });

    });
  }

  /**
   * Run cleanup code here.
   * See component lifecycle hooks:
   * https://docs.angularjs.org/guide/component
   */
  $onDestroy() {
    this.unsubscribeAll();
  }

  /**
   * Subscribe to property updates for the given thng
   * or thngs. On update, update table and add datapoint
   * to chart.
   * @param thngs - single thng or array of thngs
   */
  subscribeToProperties(thngs){
    if (!angular.isArray(thngs)) thngs = [thngs];

    thngs.forEach(thng => {
      // Building rest resource to make requests for
      var resource = thng.property();

      // @see https://github.com/evrythng/evrythng-ws.js
      // for more information about evrythng-ws
      resource.subscribe(updatedProperties => {
        updatedProperties.forEach(prop => {
          angular.extend(prop, {thng: thng.name});
          this.updateProperty(prop);
          this.addToChart(prop);
        });
      });

      // Store subscribed resource - to be unsubscribed later.
      this.subscriptions.push(resource);
    });
  }

  /**
   * Unsubscribe from existing open connections.
   */
  unsubscribeAll() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.subscriptions = [];
  }

  /**
   * Update property in properties list.
   * @param prop
   */
  updateProperty(prop){
    var match = {
      thng: {name: prop.thng},
      prop: {name: prop.key}
    };
    var existingProp = _.find(this.properties, match);
    existingProp.prop.value = prop.value;
  }

  /**
   * Add data point to chart. Create series for property
   * if it doesn't exist yet.
   * @param prop
   */
  addToChart(prop){
    var date = new Date(prop.timestamp),
      utcDate = Date.UTC(null, null, null, date.getHours(), date.getMinutes(), date.getSeconds()),
      datapoint = [utcDate, prop.value],
      series,
      seriesName = `${prop.key} (${prop.thng})`;

    if(!(series = _.find(this.chart.series, {name: seriesName}))){

      // Create new series if not found.
      series = {
        name: seriesName,
        data: []
      };
      this.chart.series.push(series);

    }

    this.$scope.$apply(() => series.data.push(datapoint));
  }

  /**
   * Reflows chart when needed.
   * Ensures that it happens after current digest cycle run.
   */
  reflowChart() {
    if (this.chart && this.chart.getHighcharts) {
      // Ensure we'll try to reflow when highcharts
      // will have updated state
      this.$timeout(() => {
        let highchart = this.chart.getHighcharts();

        if (highchart.options && highchart.options.chart) {
          highchart.reflow();
        }
      });
    }
  }
}

export default {
  template: `
    <evtx-widget-base evt-widget="$ctrl.evtWidget">
      <widget-body layout="column" flex>
        <p>Try updating some <a href="/resources/thngs">Thng</a>\'s properties.</p>
        <div layout="row" flex>
          <my-table flex class="left" items="$ctrl.properties"></my-table>
          <div flex class="right">
            <div class="empty" ng-if="!$ctrl.chart.series.length"
                 layout="column" layout-align="center center" layout-fill>
              <div>No data to display.</div>
            </div>
            <highchart ng-if="$ctrl.chart.series.length" config="$ctrl.chart" class="my-highchart"></highchart>
          </div>
        </div>
      </widget-body>
      <widget-footer layout="row" layout-align="start center">
        <small ng-if="$ctrl.properties.length">Showing data for {{ $ctrl.properties.length }} {{ $ctrl.properties.length === 1 ? 'property' : 'properties' }}</small>
      </widget-footer>
    </evtx-widget-base>
  `,
  controller: MyChartController,

  /**
   * This object holds the configuration of a widget,
   * to be used by the Dashboard
   */
  evtWidget: {
    /**
     * This object stores default configuration for your widget
     */
    defaultConfig: {
      title: {
        value: 'Real-time Properties',
      },

      description: {
        value: 'This widget updates the table and chart with new property updates in real-time.'
      }
    }
  }
};
