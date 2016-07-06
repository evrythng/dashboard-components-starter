import './my-table.scss';

export class MyTableController {

  // Example showing how to pass read-only items into
  // a reusable component using bindings.
  // See: https://docs.angularjs.org/guide/component

}

export default {
  bindings: {
    items: '<'
  },
  template: `
    <md-whiteframe class="md-whiteframe-1dp">
      <md-toolbar>
        <div class="md-toolbar-tools">
          <div flex>Thng</div>
          <div flex>Property</div>
          <div flex>Value</div>
        </div>
      </md-toolbar>
      <md-content>
        <md-progress-circular md-mode="indeterminate" ng-if="!$ctrl.items"></md-progress-circular>
        <md-list flex ng-if="$ctrl.items">
          <md-list-item class="md-1-line" ng-repeat="item in $ctrl.items">
            <div flex>
              <a ng-href="/resources/thngs/{{item.thng.id}}">{{item.thng.name}}</a>
            </div>
            <div flex>{{item.prop.name}}</div>
            <div flex>{{item.prop.value}}</div>
          </md-list-item>
        </md-list>
      </md-content>
    </md-whiteframe>
  `,
  controller: MyTableController
};
