FROM node:14.10.1-alpine as ui-builder

RUN mkdir /app

WORKDIR /app

# ENV PATH /usr/src/app/node_modules/.bin:$PATH

COPY package.json /app/package.json
COPY yarn.lock /app/yarn.lock

RUN yarn

RUN yarn global add @vue/cli

COPY . /app
RUN yarn build

FROM nginx:alpine
COPY  --from=ui-builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
