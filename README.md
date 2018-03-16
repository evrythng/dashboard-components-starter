<p align="center">
  <a href="https://dashboard.evrythng.com" target="_blank">
    <img src="https://evrythng.com/wp-content/themes/evrythng/img/logo-2x.png" alt="ng6-starter" />
  </a>
</p>

# EVRYTHNG Dashboard Components Starter

> The official repo to start building custom widgets for the EVRYTHNG Dashboard with [Angular](https://angularjs.org), and [Webpack](https://webpack.js.org/).

___

## Table of Contents
* [Quick Start](#quick-start)
* [Introduction](#introduction)
* [Dependencies](#dependencies)
* [Installing](#installing)
* [File Structure](#file-structure)
* [Developing](#developing)
    * [Gulp Tasks](#gulp-tasks)
    * [Testing](#testing)
    * [Generating Components](#generating-components)
    * [Using the Base Widget Component](#using-the-base-widget-component)
* [Deploying](#deploying)

## Quick Start

This section gives a step-by-step guide on how to get your first widget available on your custom dashboard.
For completing this guide, please ensure you're comfortable with `git`, `node`, `npm` and `javascript` overall.
More detailed explanations on each step could be found at sections below.

1. Ensure you have `git`, `node` and `npm` installed 
  * [node.js official download page](https://nodejs.org/en/download/)
  * [git official download page](https://git-scm.com/downloads)
2. Clone this repository to your local machine
  * `git clone https://github.com/evrythng/dashboard-components-starter.git`
3. Install all the dependencies
  * `npm install`
4. Start the dev server
  * `npm start`
5. Your new bundle is available at [https://localhost:3000/components.bundle.js](https://localhost:3000/components.bundle.js) URL by default. Open it in your browser and you'll see "Untrusted" certificate screen. Ensure that you marked that certificate as trusted. It'll allow remote dashboard to load bundle from your localhost over secure connection.
6. Add the one of the widgets from bundle to the dashboard, with following [https://developers.evrythng.com/docs/using-the-dashboard-customization-dashboards#section-add-a-widget](guide)
7. Modify the code of one of the widgets and reload the dashboard page. Changes should be reflected if all set up correctly.

## Introduction

This project provides examples of custom widgets, reusable components and shared services that will help you understand and kick-start your own custom components in the EVRYTHNG Dashboard.

Please, visit the complete step by step guide in the [EVRYTHNG Developer Hub - Customize the Dashboard](https://developers.evrythng.com/docs/using-the-dashboard-customization).

These components are meant to live and be developed within the Dashboard itself. Hence, they use same base component as most of Dashboard widgets as well as share services, styles and libraries with the main application as shown in the examples.

To read more about using the base widget component, refer to [Using the base widget component](#using-the-base-widget-component) section.


## Dependencies

Tools needed to run this app:
* `node` and `npm`

Once you have these, install the following as globals:  
`npm install -g gulp karma karma-cli webpack`


## Installing

* `clone` this repo
* `npm install` to install dependencies


## File Structure

A component is a self-contained concern -- may it be a feature or an element of the UI (such as a header, widget, or footer). The characteristic of a component is that it harnesses its own logic, templates, stylesheets and specs. This encapsulation allows us the comfort of isolation and structural locality. 

For disambiguation and according to Angular's structure, we define components as the UI elements that make up widgets, and services as template-less modules to put your logic and/or to share data. Here's how it looks:

```
src
⋅⋅components/ * UI elements
⋅⋅⋅⋅components.js * components entry file
⋅⋅⋅⋅my-widget/ * my-widget component
⋅⋅⋅⋅⋅⋅my-widget.js * my-widget logic (controller and view)
⋅⋅⋅⋅⋅⋅my-widget.scss * my-widget styles
⋅⋅⋅⋅⋅⋅my-widget.spec.js * my-widget specs
⋅⋅services/ * template-less modules
⋅⋅⋅⋅services.js * services entry file
⋅⋅⋅⋅test/ * Test component
⋅⋅⋅⋅⋅⋅test.js * Test module
⋅⋅⋅⋅⋅⋅test.spec.js * Test module specs
```

## Developing

Refer to [EVRYTHNG Developer Hub - Custom Dashboards](https://developers.evrythng.com/docs/using-the-dashboard-custom-dashboards) for the environment setup. Specifically, make sure your system accepts self-signed certificates from localhost as any components bundle needs to be server over HTTPs.

The easiest way to develop is to serve the components locally and add the widgets to the Dashboard. Reloading the page will always display the recently updated components code.

We use Gulp to build and launch the development environment. Running `gulp` will bundle the app with `webpack`, launch a development server, and watch all files. The port will be displayed in the terminal.
 
### Gulp Tasks

Here's a list of available tasks:

* `webpack`
  * runs Webpack, which will transpile, concatenate, and compress all assets and modules into `dist/components.bundle.js`.
* `serve`
  * starts a secure (HTTPs) dev server via `webpack-dev-server`, serving the built files above, without minifying.
* `build`
  * alias of `webpack`.
* `default` (which is the default task that runs when typing `gulp` without providing an argument)
	* runs `serve`.
* `component`
  * scaffolds a new component. [Read below](#generating-components) for usage details.
* `service`
  * scaffolds a new service. [Read below](#generating-components) for usage details.

  
### Testing

To run the tests, run `npm test` or `karma start`.


### Generating Components

To generate a component, run `gulp component --name <componentName>`.

To generate a service, run `gulp service --name <serviceName>`.

The parameter following the `--name` flag is the name of the component to be created. Component names must have a `-` to conform with the Web Components standard. Usually the prefix identifies all your components (e.g. we prefix all of our components with `evt-` and `evtx-`).

The component will be created, by default, inside `src/components`. To change this, apply the `--parent` flag, followed by a path relative to `src/components/`.

For example, running `gulp component --name my-search-toolbar --parent toolbars` will create a `my-search-toolbar` component at `src/components/toolbars/my-search-toolbar`.
  
### Using the Base Widget Component
   
In order to provide a consistent user experience of widgets, the Dashboard introduces the `<evtx-widget-base>` higher-order component providing access to such common features as widget resizing, hiding, or cloning, as well as widget configuration. It is not strictly required to use it but it will ensure your users have a consistent experience from their Dashboard overall.

The base widget component allows you to:
* Resize and move the widget within the section grid.
* Clone the widget for rapid prototyping of your Dashboard layout.
* Hide unnecessary widgets without deleting data about its state.
* Configure the widget if it exports any customizable properties.
* Show a spinner when loading.
* Refresh the widget content on configuration update.

For the dashboard to recognize your component as widget, it's required to provide `evtWidget` field in component definition object. 
Check the `my-map` component for more examples on implementing and using widget configuration.



## Deploying

Once you're happy with your custom widgets, they need to be deployed a publicly accessible URL. This is the URL used in the custom dashboard configuration, so it also needs to be updated once deployed.

Remember the components need to be served securely over HTTPs with a valid and trusted certificate.

You can use any of these services to host your bundles:
* Your own server and/or CDN
* [Github](https://github.com/) repository or gist (over [RawGit](https://rawgit.com/))
* [Dropbox](https://www.dropbox.com/)
* [AWS S3](https://aws.amazon.com/s3/)
* [Google Cloud Platform](https://cloud.google.com/)
* [Netlify](https://www.netlify.com/)
* ...

## Support and Questions

Make sure you follow the step by step guide in the [EVRYTHNG Developer Hub - Custom Dashboards](https://developers.evrythng.com/docs/using-the-dashboard-custom-dashboards), which includes all the necessary screenshots and information needed to setup custom widgets in the Dashboard and the development environment.

Visit [EVRYTHNG's Support](https://developers.evrythng.com/docs/support) page for more info.

___

enjoy — **EVRYTHNG**
