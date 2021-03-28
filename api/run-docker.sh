docker stop aws-vpc-api; docker rm aws-vpc-api
docker run \
    -e MONGODB_HOST=mongodb://mongo/aws \
    -d --rm --name aws-vpc-api \
    --network container:aws-vpc-ui \
    -v $PWD:/svc \
    --workdir /svc \
    python \
    bash -c 'pip3 install -r requirements.txt && gunicorn app:app --reload -w 2 -t 0 -b 127.0.0.1:5000'
