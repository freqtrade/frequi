FROM node:23.1.0-alpine AS ui-builder

RUN mkdir /app \
    && corepack enable

WORKDIR /app

COPY package.json pnpm-lock.yaml /app/

RUN apk add --update --no-cache g++ make git \
    && pnpm install --frozen-lockfile \
    && apk del g++ make

COPY . /app

RUN pnpm run build

FROM nginx:1.27.2-alpine
COPY  --from=ui-builder /app/dist /etc/nginx/html
COPY  --from=ui-builder /app/nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx"]
