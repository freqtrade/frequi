# frequi

Freqtrade UI build with [Vue.js](https://vuejs.org/) and [boostrap-vue](https://bootstrap-vue.org/).

## WARNING

This project is still in it's early stages, and is not yet stable nor recommended to be used for productiion usages.

It will require Freqtrade to be running on the same host with the API enabled under (`localhost:8081`). This port can be changed in `vue.config.js`.

## Project setup with node install locally

### Project setup

```
npm install
```

### Compiles and hot-reloads for development

```
npm run serve
```

### Compiles and minifies for production

```
npm run build
```

### Lints and fixes files

```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).

## Project setup for vscode and docker (developping inside dev contener) on linux

The goal is it have a complete dev environment very quickly and isolated.

### Install missing tools if needed

Follow [getting strated](https://code.visualstudio.com/docs/remote/containers#_getting-started) section.

### Build your dev container

View > Command palette > Enter: Remote-Containers rebuild container

### Install dependencies and serve your local server

```
yarn install
```

```
yarn serve
```

You now have useful vscode extentions, git support, your command history of the project.
