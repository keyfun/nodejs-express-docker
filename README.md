# nodejs-express-docker
NodeJS + Express DockerFile

docker run --name nodeapp -p 3000:3000 -d keyfun/nodejs-express-docker

docker run --name nodeapp -v $(pwd):/usr/src/app -p 3000:3000 -d keyfun/nodejs-express-docker