docker stop aws-vpc-api; docker rm aws-vpc-api
docker run \
    -d --rm --name aws-vpc-api \
    --network container:aws-vpc-ui \
    -v $PWD:/svc \
    --workdir /svc \
    python bash start-server.sh
