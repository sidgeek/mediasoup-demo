### start server
cd server

<!-- build docker image -->
sh docker/build.sh

<!-- start docker container -->
MEDIASOUP_ANNOUNCED_IP=192.168.0.3 ./docker/run.sh



#### start app
cd app
npm start


#### visit 
https://sid.plus:3000/?info=true
