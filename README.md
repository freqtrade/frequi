# frequi

Freqtrade UI build with [Vue.js](https://vuejs.org/) and [boostrap-vue](https://bootstrap-vue.org/).

## WARNING

This project is still in it's early stages (consider it early-alpha), and is not yet stable nor recommended to be used for production usages.

It will require Freqtrade to be running on the same host with the API enabled under (`localhost:8081`). This port can be changed in `vue.config.js`.

## Project setup with node install locally

### Project setup

```
yarn install
```

### Compiles and hot-reloads for development

```
yarn serve
```

### Compiles and minifies for production

```
yarn build
```

### Lints and fixes files

```
yarn lint
```

### Build and run docker version

```
docker-compose build
docker-compose up -d

# Access using http://localhost:8080/
```


### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).

## Project setup for docker (developing inside dev container) without vscode

### Built dev docker image and run container(s) detached

```
cd .devcontainer
docker-compose up -d
```

### Go inside web service container and serve

```
docker-compose exec web /bin/bash
```

then

```
yarn serve
```

## Project setup for vscode and docker (developing inside dev container) on linux

The goal is it have a complete dev environment very quickly and isolated.

### Install missing tools if needed

Follow [getting strated](https://code.visualstudio.com/docs/remote/containers#_getting-started) section.

### Build your dev container

View > Command palette > Enter: Remote-Containers rebuild container

### Serve your local server

```
yarn serve
```

You now have useful vscode extentions, git support, your command history of the project.
