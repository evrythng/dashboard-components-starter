import myMap from './my-map/my-map';
import myChart from './my-chart/my-chart';
import myTable from './my-table/my-table';
import myToolbar from './my-toolbar/my-toolbar';

export default angular.module('myModule.components', [])
  .component('myMap', myMap)
  .component('myChart', myChart)
  .component('myTable', myTable)
  .component('myToolbar', myToolbar)
  .config(WidgetsProvider => {
    'ngInject';

    WidgetsProvider.register('myMap', myMap);
    WidgetsProvider.register('myChart', myChart);
    WidgetsProvider.register('myTable', myTable);
  });
