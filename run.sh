docker stop awsvpc || true
docker run --rm -p 9000:80 -p 9443:443 --name awsvpc -e MONGODB_HOST=mongodb://mongodb/aws --network db awsvpc