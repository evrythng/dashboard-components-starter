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
    this.title = 'Real-time Properties';

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
          defaultSeriesType: 'spline',
          height: 356
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
  }

  /**
   * Run initialization code here.
   * See component lifecycle hooks:
   * https://docs.angularjs.org/guide/component
   */
  $onInit() {
    this.EVT.operator.thng().read().then(thngs => {

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
      var resource = thng.property();

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
}

export default {
  template: `
    <md-card>
      <md-card-header>
        <md-card-header-text>
          <span class="md-headline">{{$ctrl.title}}</span>
        </md-card-header-text>
      </md-card-header>
      <md-card-content>
        <p>This widget updates the table and chart with new property updates in real-time. Try updating some <a href="/resources/thngs">Thng</a>'s properties.</p>
        <div layout="row">
          <div flex class="left">
            <my-table items="$ctrl.properties"></my-table>
          </div>
          <div flex class="right">
            <div class="empty" ng-if="!$ctrl.chart.series.length"
                 layout="column" layout-align="center center" layout-fill>
              <div>No data to display.</div>
            </div>
            <highchart ng-if="$ctrl.chart.series.length" config="$ctrl.chart"></highchart>
          </div>
        </div>
      </md-card-content>
    </md-card>
  `,
  controller: MyChartController
};
