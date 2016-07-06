import './my-toolbar.scss';

export class MyToolbarController {

  /**
   * Setup injection and initialize component variables here.
   * @param Search - communication service between components
   * @param EVT - EVT.operator is a fully instantiated Operator scope from EVT.js
   * https://github.com/evrythng/evrythng-extended.js
   */
  constructor(Search, EVT) {
    "ngInject";
    this.Search = Search;
    this.EVT = EVT;
  }

  /**
   * Search Thngs by name (starts with).
   * @param name - thng name to search
   * @returns {promise}
   */
  search(name) {
    return this.EVT.operator.thng().read({
      params: {
        filter: 'name=' + name + '*'
      }
    });
  }

  /**
   * Update searched/filtered thng in shared service.
   * @param thng - selected thng
   */
  updateSearch(thng){
    this.Search.updateSearch(thng);
  }

}

export default {
  template: `
    <md-toolbar>
      <div class="md-toolbar-tools" layout-align="center center">
        <div class="search-icon mdi mdi-filter-variant"></div>
        <md-autocomplete
          flex="60"
          md-search-text="$ctrl.searchText"
          md-items="item in $ctrl.search($ctrl.searchText)"
          md-selected-item-change="$ctrl.updateSearch(item)"
          md-item-text="item.name"
          placeholder="Select thng to filter updates"
          md-min-length="0">
          <md-item-template>
            <span md-highlight-text="$ctrl.searchText" md-highlight-flags="^i">{{item.name}}</span>
          </md-item-template>
        </md-autocomplete>
      </div>
    </md-toolbar>
  `,
  controller: MyToolbarController
};
