docker stop awsvpc || true
docker run --rm -p 10002:80 --name awsvpc \
    -e MONGODB_HOST=mongodb://mongo/aws -d \
    --network db \
    awsvpc

