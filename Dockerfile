FROM node:16.8.0-alpine as ui-builder

RUN mkdir /app

WORKDIR /app

# ENV PATH /usr/src/app/node_modules/.bin:$PATH

COPY package.json /app/package.json
COPY yarn.lock /app/yarn.lock

RUN apk add --update --no-cache python3 g++ make\
    && yarn \
    && apk del python3 g++ make

RUN yarn global add @vue/cli

COPY . /app
RUN yarn build

FROM nginx:1.21.3-alpine
COPY  --from=ui-builder /app/dist /etc/nginx/html
COPY  --from=ui-builder /app/nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx"]
