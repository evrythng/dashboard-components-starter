'use strict';

import './my-map-marker-color.scss';

/**
 * Configuration component example
 * Allows to select color to be used for markers on the map.
 * To be used correctly, should have certain interface (bindings) exposed.
 * More could be found in component definition at the bottom.
 */
class EvtWidgetConfigMarkerColor {

  /**
   * Setup injection and initialize component variables here.
   *
   * @param EvtColorCategory Editor allows to select colors from EVT Color Schema
   */
  constructor(EvtColorCategory) {
    "ngInject";

    this.EvtColorCategory = EvtColorCategory;
  }

  /**
   * Run initialization code here.
   * See component lifecycle hooks:
   * https://docs.angularjs.org/guide/component
   *
   * Initialises colors model to work with
   * If previously selected color wasn't found - selects first one available
   */
  $onInit() {
    /**
     * Defines model of colors to allow selection from
     * @type {ColorCard[]}
     */
    this.colors = [
      ...this.EvtColorCategory.primaryPalette,
      ...this.EvtColorCategory.grayScalePalette
    ].map(this.hexToColor, this);

    // If no colors selected
    if (!this.colors.some(color => color.selected)) {
      this.select(this.colors[0]);
    }
  }

  /**
   * Selects the color, updates model and triggers change expression binding
   *
   * @param {ColorCard} color
   */
  select(color) {
    if (!this.isDisabled) {
      this.colors.forEach(this.deselect);

      color.selected = true;

      this.model.config.value = color.value;
      this.onChange();
    }
  }

  /**
   * Deselects given color
   *
   * @param {ColorCard} color
   */
  deselect(color) {
    color.selected = false;
  }

  /**
   * @typedef {object} ColorCard
   * @property {number} height - defines md-whiteframe height of color card
   * @property {string} value - real color value
   * @property {boolean} selected - whether this color selected or not
   */

  /**
   * Converts given hex string to color model
   *
   * @param {string} hex
   * @return {ColorCard}
   */
  hexToColor(hex) {
    const value = hex.replace('#', '');

    return {
      height: 2,
      value: value,
      selected: this.isModelValue(value)
    };
  }

  /**
   * Returns true if given hex value equals to real model value
   *
   * @param {string} hex
   * @return {boolean}
   */
  isModelValue(hex) {
    return this.model.config.value === hex;
  }
}

angular.module('myModule.components.configuration.evtWidgetConfigMarkerColor', [])
  .component('evtWidgetConfigMarkerColor', {
    controller: EvtWidgetConfigMarkerColor,
    bindings: {
      /**
       * All editor components will have these specific
       * bindings listed.
       *
       * Model is an object, containing configuration field information.
       * For sufficient editing, is enough to store/retrieve required model
       * value from `config.value` field in model. We encourage you to check out
       * what else is exposed there.
       * {
       *   config: {
       *     value: 'Model Value to be stored'
       *   }
       * }
       */
      model: '<',

      /**
       * onChange should be called as soon as configuration editor
       * considers that user have changed something in the model, which
       * should be stored afterwards.
       */
      onChange: '&',

      /**
       * When isDisabled set to true, configuration editor is advised to
       * disable its internal state for editing. For example, by disabling user
       * interaction with fields or buttons which editor component may have.
       */
      isDisabled: '<'
    },
    template: `
      <section layout="column">
        <span class="md-subhead">Choose marker color</span>
        <container layout="row" layout-align="center center" layout-wrap layout-margin>
          <div class="color"
               layout="column"
               layout-align="center center"
               ng-click="$ctrl.select(color)"
               ng-repeat="color in $ctrl.colors"
               md-whiteframe="{{ color.height }}"
               ng-mouseenter="color.height = 6"
               ng-mouseleave="color.height = 3"
               ng-style="{ 'background-color': '#' + color.value }">
            <md-icon ng-if="color.selected" class="mdi mdi-check"></md-icon>     
          </div>
        </container>
      </section>
  `});
