docker stop aws-vpc-api; docker rm aws-vpc-api
docker run \
    -d --rm --name aws-vpc-api \
    --network container:aws-vpc-ui \
    -v $PWD:/svc \
    --workdir /svc \
    python \
    bash -c 'pip3 install -r requirements.txt && gunicorn rest:app --reload -w 2 -b 127.0.0.1:5000'
