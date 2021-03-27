docker stop aws-vpc-ui; docker rm aws-vpc-ui
docker run -it --rm -d \
    -p 8002:3000 \
    -v $PWD:/svc \
    --workdir /svc \
    --name aws-vpc-ui \
    node bash -c "npm install && npm start"

docker network connect db aws-vpc-ui
