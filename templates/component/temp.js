import './<%= name %>.scss';

export class <%= upCaseName %>Controller {

  constructor() {
    this.name = '<%= name %>';
  }

}

export default {
  bindings: {},
  template: `
    <div>
      <h1>{{ $ctrl.name }}</h1>
    </div>
  `,
  controller: <%= upCaseName %>Controller
};
