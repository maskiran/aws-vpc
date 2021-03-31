docker network create db || true
docker stop mongodb && docker rm mongodb
docker run --name mongodb -p 127.0.0.1:27017:27017 --restart always --network db -v /home/docker/mongodata:/data/db -d mongo
