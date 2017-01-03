<p align="center">
  <a href="https://dashboard.evrythng.com" target="_blank">
    <img src="https://evrythng.com/wp-content/themes/evrythng/img/logo-2x.png" alt="ng6-starter" />
  </a>
</p>

# EVRYTHNG Dashboard Components Starter

> The official repo to start building custom widgets for the EVRYTHNG Dashboard with [Angular](https://angularjs.org), [ES6](https://git.io/es6features), and [Webpack](http://webpack.github.io/).

___

## Table of Contents
* [Introduction](#introduction)
* [Dependencies](#dependencies)
* [Installing](#installing)
* [File Structure](#file-structure)
* [Developing](#developing)
    * [Gulp Tasks](#gulp-tasks)
    * [Testing](#testing)
	* [Generating Components](#generating-components)
* [Deploying](#deploying)


## Introduction

This project provides examples of custom widgets, reusable components and shared services that will help you understand and kick-start your own custom components in the EVRYTHNG Dashboard.

Please, visit the complete step by step guide in the [EVRYTHNG Developer Hub - Customize the Dashboard](https://developers.evrythng.com/v1.0/docs/customize-dashboard-create-components).

The Dashboard uses Angular 1.5 components as a great way to ensure a tasteful transition to Angular 2 and Web Components (e.g. Polymer). Having that in mind we chose a simple structure that resembles both Angular 2 components and Polymer elements for a smooth transition. Similarly, we also bundled this project with modern future-proof development tools such as ES6, Sass, Webpack and Gulp.

These components are meant to live and be developed within the Dashboard itself. Hence, they can share services, styles and libraries with the main application as shown in the examples.


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

Refer to [EVRYTHNG Developer Hub - Customize the Dashboard](https://developers.evrythng.com/v1.0/docs/customize-dashboard-create-components) for the environment setup. Specifically, make sure your system accepts self-signed certificates from localhost as any components bundle needs to be server over HTTPs.

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
* `publish`
  * builds and deploys the components to EVRYTHNG platform using Files API. [Read below](#deploying-using-files-api) for usage details.

  
### Testing

To run the tests, run `npm test` or `karma start`.


### Generating Components

To generate a component, run `gulp component --name <componentName>`.

To generate a service, run `gulp service --name <serviceName>`.

The parameter following the `--name` flag is the name of the component to be created. Component names must have a `-` to conform with the Web Components standard. Usually the prefix identifies all your components (e.g. we prefix all of our components with `evt-` and `evtx-`).

The component will be created, by default, inside `src/components`. To change this, apply the `--parent` flag, followed by a path relative to `src/components/`.

For example, running `gulp component --name my-search-toolbar --parent toolbars` will create a `my-search-toolbar` component at `src/components/toolbars/my-search-toolbar`.  


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
* [Files API](#deploying-using-files-api)
* ...

### Deploying using Files API

EVRYTHNG platform provides powerful cloud file system, or Files API, which could be used
to store your custom components. Files API requires an API key with valid permissions to be provided from environment. It could be done either with `EVT_AUTH` environment variable or `~./evt-auth` file.
Ensure to have one of these before running `gulp publish`.

## Support and Questions

Make sure you follow the step by step guide in the [EVRYTHNG Developer Hub - Customize the Dashboard](https://developers.evrythng.com/v1.0/docs/customize-dashboard-create-components), which includes all the necessary screenshots and information needed to setup custom widgets in the Dashboard and the development environment.

Visit [EVRYTHNG's Support](https://developers.evrythng.com/docs/support) page for more info.

___

enjoy — **EVRYTHNG**
