FROM node:latest

WORKDIR /usr/src/app
#remember to make changes in runBot.sh to be compatible
#uncomment /usr/src/app in runBot.sh

RUN apt-get update -y
RUN apt-get install python3 -y
RUN apt-get install --yes python3-pip
RUN apt-get install bash -y

RUN pip3 install socketIO-client
RUN pip3 install agario-bot

COPY package*.json ./

#check if it works
COPY npm-shrinkwrap.json ./
COPY npm-shrinkwrap.json.bk ./npm-shrinkwrap.json

RUN npm install

COPY . .

ENTRYPOINT ["npm","start"]

#Don't change this port unless you change the bot default port
EXPOSE 3000

#docker build -t ahmadsepahi/agariobothidcode:1.0.0 .
#docker push ahmadsepahi/agariobothidcode:1.0.0
#docker run -d -p 8080:3000 --name agariobot ahmadsepahi/agariobothidcode:1.0.0
