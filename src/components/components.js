import tagitsmartWidget from './tagitsmart-wfe/tagitsmart-wfe';
import srfeWidget from './srfe/srfe';
import reciclayaWidget from './reciclaya/reciclaya';
import homedepotWidget from './home-depot/home-depot';
import realTimeActions from './evtx-realtime-action-list/evtx-realtime-action-list';
import epcisActionList from './evtx-action-list-epcis/evtx-action-list-epcis.js';

import raList from './ra-list/ra-list.js';

export default angular.module('myModule.components', [])
  .component('homedepotWidget', homedepotWidget)
  .component('realTimeActions', realTimeActions)
  .component('tagitsmartWidget', tagitsmartWidget)
  .component('reciclayaWidget', reciclayaWidget)
  .component('srfeWidget', srfeWidget)
  .component('realtimeActions', raList);
