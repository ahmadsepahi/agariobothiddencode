var express = require('express');
const http = require('http');
var cors = require('cors');

var router = express.Router();

var c = require('../config.json');



/*const dbHostname = "104.197.184.233";
const dbPort = 3001;
const dbPath = "/db";*/
var dbinfo = c.mongoDBinfo;
const dbHostname = dbinfo.dbHost;
const dbPort = dbinfo.dbPort_client;
const dbPath = dbinfo.dbPath;

var retUrlAddr='';
var state = '';

QUESTIONS0={

    0: "No need to take a survey because this was a training session.",
};

QUESTIONS1={

    1: "1- Responsiveness: If a game is responsive, you should be able to control your subject smoothly with no perceived delay or unexpected behavior. Please rate how responsive you feel the game is.",
};
QUESTIONS2={

    2: "2- What is your score range?"
};



router.get('/:playerName/:ping/:point/:totalTime/:urlAddr', function(req, res){
    /*console.log(req.params.ping);
    console.log(req.params.point);
    console.log(req.params.totalTime);*/
    //console.log(req);
    retUrlAddr = req.params.urlAddr;
    //console.log("retUrlAddr" , retUrlAddr);
    state = retUrlAddr.substring(0,2);
    //console.log("state", state);

    res.render('question', { title: 'Survey', playerName: req.params.playerName, ping:req.params.ping, point: req.params.point,  totalTime:req.params.totalTime, urlAddr:req.params.urlAddr, questions1:QUESTIONS1, questions2:QUESTIONS2});
});

router.post('/:playerName/:ping/:point/:totalTime/:urlAddr', function(req, res){

    //var result = {"ping": req.params.ping, "point": req.params.point, "remoteTime": new Date(), "clientIP":req.headers['x-forwarded-for'] || req.connection.remoteAddress, "agent":req.get('user-agent')};
    var result = JSON.parse(JSON.stringify(req.body));
    //console.log(result);

    result.userId = req.params.playerName;
    result.ping = req.params.ping;
    result.point = req.params.point;
    result.totalTime = req.params.totalTime;
    result.remoteTime = new Date();
    result.clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    result.agent = req.get('user-agent');
    result.code = req.params.code;
    result.urlAddr = req.params.urlAddr;
    // console.log(req);
    // console.log(req.get('user-agent'));

    var post_data = JSON.stringify(result);
    //console.log(post_data);
    var post_options = {
        hostname: dbHostname,
        port: dbPort,
        path: dbPath,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': post_data.length
        }
    };

    // Set up the request
    var post_req = http.request(post_options, function(resp) {
        resp.setEncoding('utf8');
        resp.on('data', function (chunk) {
            // console.log('Response: ' + chunk);
            redAddr = 'http://www.xdnapp.com/?'+req.params.playerName+'-'+retUrlAddr;
            res.redirect(redAddr);
        });
    });

    // post the data
    post_req.write(post_data);
    post_req.end();

});

router.get('/speedtest', function(req, res){
    // console.log("req:"+req);
    res.sendStatus(200);
});



module.exports = router;
