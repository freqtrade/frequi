FROM node:18.9.1-alpine as ui-builder

RUN mkdir /app

WORKDIR /app

# ENV PATH /usr/src/app/node_modules/.bin:$PATH

COPY package.json /app/package.json
COPY yarn.lock /app/yarn.lock

RUN apk add --update --no-cache python3 g++ make\
    && yarn \
    && apk del python3 g++ make

COPY . /app

# The below flag should be removed, it's an incompatibility between
# webpack and node17
RUN NODE_OPTIONS=--openssl-legacy-provider yarn build

FROM nginx:1.23.1-alpine
COPY  --from=ui-builder /app/dist /etc/nginx/html
COPY  --from=ui-builder /app/nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx"]
