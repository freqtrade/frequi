# Special docker file for pre-built images
FROM nginx:1.29.2-alpine

COPY  dist/ /etc/nginx/html
COPY  nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx"]
