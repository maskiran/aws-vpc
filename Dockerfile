FROM alpine as ui
COPY ui /svc
WORKDIR /svc
RUN apk update && apk add npm
RUN npm install
RUN npm run build

FROM nginx:alpine
RUN rm -rf /usr/share/nginx/html
COPY --from=ui /svc/build /usr/share/nginx/html
COPY ui/nginx/nginx.conf /etc/nginx/nginx.conf
COPY ui/nginx/default.conf /etc/nginx/conf.d/default.conf
COPY ui/nginx/myca.crt /etc/nginx/myca.crt
COPY ui/nginx/myca.key /etc/nginx/myca.key
COPY api /svc
WORKDIR /svc
RUN apk update && apk add py3-pip && pip install -r requirements.txt && pip install supervisor
COPY supervisord.conf /svc
CMD ["supervisord", "-c", "supervisord.conf"]
