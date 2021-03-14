# this script is for starting the service inside docker

python3 -m venv /venv
/venv/bin/pip install -r requirements.txt
/venv/bin/gunicorn rest:app --reload -w 2 -b 127.0.0.1:5000
