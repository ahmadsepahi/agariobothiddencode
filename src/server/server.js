/*jslint bitwise: true, node: true */
'use strict';

/*
 * Авторы - Никита Кирилов, Алексей Костюченко 
 * 
 * Описание - Входной файл сервера. Здесь инициализируются все компоненты, подключаются сокеты и запускается игровой цикл.
 */

var express = require('express');
var app = express();
var http = require('http').Server(app);
const io = require('socket.io')(http);
var SAT = require('sat');
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
var urlencodeParser = bodyParser.urlencoded({extended: false});

// Импорт настроек игры.
var c = require('../../config.json');

// Импорт инструментов.
var util = require('./lib/util');


//Iadded

const httpDB = require('http');

app.use(express.json());
app.use(express.urlencoded({extended: false}));


app.use(urlencodeParser);
app.use(jsonParser);

var path = require('path');
var cookieParser = require('cookie-parser');

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {default: obj};
}

var surveyRouter = require("../../routes/survey");
//console.log(__dirname);
app.set('views', path.join(__dirname, "../../views"));
app.set('view engine', 'pug');

app.use('/survey', surveyRouter);

app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());

app.use(urlencodeParser);
app.use(jsonParser);
//
// Import quadtree.
var quadtree = require('simple-quadtree');

var tree = quadtree(0, 0, c.gameWidth, c.gameHeight);

const GameController = require('./game_controller');
const {
    connect
} = require("./sockets");
const UsersController = require("./users_controller");

let usersController = new UsersController();
let game = new GameController();

connect(io); // Подключение сокетов.

global.sockets = {}; // Глобальный массив. Служит для хранение сокетов пользователей.

var massFood = [];
var food = [];

var V = SAT.Vector;
var C = SAT.Circle;

const initMassLog = util.log(c.defaultPlayerMass, c.slowBase);

app.use(express.static(__dirname + '/../client'));


/**
 * @description Проверка игрока.
 * @param length
 */
function makeid(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}


var dbinfo = c.mongoDBinfo;
const dbHostname = dbinfo.dbHost;
const dbPort = dbinfo.dbPort_server;
const dbPath = dbinfo.dbPath;

//var timeToGetfinScore = -1;
function postToDB(ping, massTotal, finTime, code, name, id, timeFinScore) {
    //console.log('TIMEFINSCORE' + timeFinScore);
    var result = {
        "ping": ping,
        "point": massTotal,
        "totalTime": finTime,
        "code": code,
        "remoteTime": new Date(),
        "playerName": name,
        "playerID": id,
        "timeToGetfinScore": timeFinScore
    };
    var post_data = JSON.stringify(result);

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
    var post_req = httpDB.request(post_options, function (resp) {
        resp.setEncoding('utf8');
        /*        resp.on('data', function (chunk) {
                    // console.log('Response: ' + chunk);
                    res.redirect('/');
                });*/
    });

    // post the data
    post_req.write(post_data);
    post_req.end();
}


function tickPlayer(currentPlayer) {
    //console.log(currentPlayer.type);
    //console.log(currentPlayer.codeLen);
    if (currentPlayer.type === 'player' && c.finishScoreActive === true && c.finishTimeActive === true) {
        var finTime = new Date().getTime() - currentPlayer.startTime;
        var massTotal = Math.floor(currentPlayer.massTotal);
        var urlAddr = '';
        if (massTotal >= c.finishScore && finTime >= c.finishTime && currentPlayer.isSentToDB === false) {
            var code = makeid(currentPlayer.codeLen);
            //var finTime = new Date().getTime() - currentPlayer.startTime;
            //var massTotal = Math.floor(currentPlayer.massTotal);
            urlAddr = currentPlayer.surveyState+currentPlayer.codeLen+currentPlayer.code+code;
            sockets[currentPlayer.id].emit('kick', 'Congratulations! You scored ' + massTotal + ' in ' + c.finishTime/1000 + ' seconds. Please click the above button to take the survey.', massTotal, c.finishTime, currentPlayer.code+code, urlAddr, true);
            sockets[currentPlayer.id].disconnect();
            postToDB(currentPlayer.userPing, massTotal, c.finishTime, code, currentPlayer.name, currentPlayer.id, currentPlayer.timetoGet);
            currentPlayer.isSentToDB = true;

            //console.log(currentPlayer.name);
            //console.log(currentPlayer.id);

        } else if (massTotal < c.finishScore && finTime >= c.finishTime && currentPlayer.isSentToDB === false) {
            sockets[currentPlayer.id].emit('kick', 'You cannot take the survey since your score (' + massTotal + ') < (' + c.finishScore + '). Please try again in a few seconds.', massTotal, finTime, code, urlAddr, false);

            postToDB(currentPlayer.userPing, massTotal, c.finishTime, 'NULLNULL', currentPlayer.name, currentPlayer.id, currentPlayer.timetoGet);
            currentPlayer.isSentToDB=true;

            sockets[currentPlayer.id].disconnect();
        } else if (currentPlayer.timetoGet === -1 && massTotal >= c.finishScore) {

            currentPlayer.timetoGet = finTime;
            //console.log('TIMETIME' + currentPlayer.timetoGet);
        }
    }

    /*if(c.finishScoreActive == true && c.finishTimeActive == false){
        if(currentPlayer.massTotal >= c.finishScore){
            var finTime = new Date().getTime() - currentPlayer.startTime;
            var massTotal = Math.floor(currentPlayer.massTotal);
            sockets[currentPlayer.id].emit('kick','You got score: '+massTotal+ ' in '+ finTime+ ' ms. Your Code is: '+code, massTotal, finTime, code);
            sockets[currentPlayer.id].disconnect();
        }
    }
    if(c.finishTimeActive == true && c.finishScoreActive == false){
        if(new Date().getTime() - currentPlayer.startTime >= c.finishTime){
            var finScore = currentPlayer.massTotal;
            var massTotal = Math.floor(currentPlayer.massTotal);
            sockets[currentPlayer.id].emit('kick','Time is up and You got score: '+massTotal+ ' in '+ c.finishTime+' ms. Your Code is: '+code, massTotal, c.finishTime, code);
            sockets[currentPlayer.id].disconnect();
        }
    }*/

    // Удаление игрока за бездействие.
    if (currentPlayer.lastHeartbeat < new Date().getTime() - c.maxHeartbeatInterval) {
        global.sockets[currentPlayer.id].emit('kick', 'Last heartbeat received over ' + c.maxHeartbeatInterval + ' ago.');
        global.sockets[currentPlayer.id].disconnect();
    }

    game.movePlayer(currentPlayer);

    function funcFood(f) {
        return SAT.pointInCircle(new V(f.x, f.y), playerCircle);
    }

    function deleteFood(f) {
        food[f] = {};
        food.splice(f, 1);
    }

    function eatMass(m) {
        if (SAT.pointInCircle(new V(m.x, m.y), playerCircle)) {
            if (m.id === currentPlayer.id && m.speed > 0 && z === m.num)
                return false;
            if (currentCell.mass > m.masa * 1.1)
                return true;
        }
        return false;
    }

    /**
     * @function Проверка пользователя (игрока) на наличие взаимодействия с другими пользователями. Если было взаимодействие, то помещаем обоих пользователей в очередь на обработку столкновения.
     * @param {Object} user Объект пользователя.
     */
    function check(user) {
        for (var i = 0; i < user.cells.length; i++) {
            if (user.cells[i].mass > 10 && user.id !== currentPlayer.id) {
                var response = new SAT.Response();
                // Проверка столкновения двух игроков.
                var collided = SAT.testCircleCircle(playerCircle,
                    new C(new V(user.cells[i].x, user.cells[i].y), user.cells[i].radius),
                    response);
                if (collided) {
                    // Если произошло столкновение, то ставим обработку их столкновения в очередь.
                    response.aUser = currentCell;
                    response.bUser = {
                        id: user.id,
                        name: user.name,
                        x: user.cells[i].x,
                        y: user.cells[i].y,
                        num: i,
                        mass: user.cells[i].mass
                    };
                    playerCollisions.push(response);
                }
            }
        }
        return true;
    }

    /**
     * @function Проверка столкновения игроков.
     * @param {*} collision столкновение
     */
    function collisionCheck(collision) {
        let users = usersController.getUsers();

        // Если у игрока 1, который наехал на игрока 2, масса и радиус больше, то игрок 2 считается съеденным.
        if (collision.aUser.mass > collision.bUser.mass * 1.1 && collision.aUser.radius > Math.sqrt(Math.pow(collision.aUser.x - collision.bUser.x, 2) + Math.pow(collision.aUser.y - collision.bUser.y, 2)) * 1.75) {
            //console.log('[DEBUG] Killing user: ' + collision.bUser.id);
            //console.log('[DEBUG] Collision info:');
            var numUser = util.findIndex(users, collision.bUser.id); // Ищем индекс съеденного игрока.
            if (numUser > -1) {
                if (users[numUser].cells.length > 1) { // Если массив копий не пустой.
                    users[numUser].massTotal -= collision.bUser.mass; // Отнимаем массу от общей массы.
                    users[numUser].cells.splice(collision.bUser.num, 1); // Убираем игрока и массива окружения.
                } else {
                    usersController.removeUser(numUser); // Удляем игрока из списка пользователей.
                    // Сообщаем игроку 2, что его съели.
                    io.emit('playerDied', {
                        name: collision.bUser.name
                    });

                    // Отсылаем всем другим игрокам о смерте игрока 2

                    global.sockets[collision.bUser.id].emit('RIP', 'You cannot take the survey due to Collision. Please try again in a few seconds.');
                    /*                    if(currentPlayer.type ==='player'){
                                            var clean = path.join(__dirname, "../../Bot/clean.sh");
                                            const {spawn} = require('child_process');
                                            spawn('bash', [clean]);
                                        }*/

                }
            }

            // Игрок 1 после съедения игрока 2 получает его массу.
            currentPlayer.massTotal += collision.bUser.mass;
            collision.aUser.mass += collision.bUser.mass;


        }
    }

    // Просматриваем копии игрока
    for (var z = 0; z < currentPlayer.cells.length; z++) {

        var currentCell = currentPlayer.cells[z];
        var playerCircle = new C(
            new V(currentCell.x, currentCell.y),
            currentCell.radius
        );

        // Формируем массив съеденной еды
        var foodEaten = food.map(funcFood)
            .reduce(function (a, b, c) {
                return b ? a.concat(c) : a;
            }, []);

        // Удаляем съеденную еду из общего массива еды
        foodEaten.forEach(deleteFood);

        // Считаем, сколько прибавили в массе
        var massEaten = massFood.map(eatMass)
            .reduce(function (a, b, c) {
                return b ? a.concat(c) : a;
            }, []);

        var masaGanada = 0;
        for (var m = 0; m < massEaten.length; m++) {
            masaGanada += massFood[massEaten[m]].masa;
            massFood[massEaten[m]] = {};
            massFood.splice(massEaten[m], 1);
            for (var n = 0; n < massEaten.length; n++) {
                if (massEaten[m] < massEaten[n]) {
                    massEaten[n]--;
                }
            }
        }

        if (typeof (currentCell.speed) == "undefined")
            currentCell.speed = 6.25;
        // Переопределение массы и скорости игрока
        masaGanada += (foodEaten.length * c.foodMass);
        currentCell.mass += masaGanada;
        currentPlayer.massTotal += masaGanada;
        currentCell.radius = util.massToRadius(currentCell.mass);
        playerCircle.r = currentCell.radius;

        tree.clear();
        let users = usersController.getUsers();

        users.forEach(tree.put);
        var playerCollisions = [];

        users.forEach(user => {
            check(user)
        });
        playerCollisions.forEach(collisionCheck);
    }
}

function moveloop() {
    let users = usersController.getUsers();
    users.forEach(user => {
        tickPlayer(user);
    });
}

function gameloop() {
    let users = usersController.getUsers();
    if (users.length > 0) {
        users.sort(function (a, b) {
            return b.massTotal - a.massTotal;
        });

        users.forEach(user => {
            user.cells.forEach(cell => {
                if (cell.mass * (1 - (c.massLossRate / 1000)) > c.defaultPlayerMass && user.massTotal > c.minMassLoss) {
                    let massLoss = cell.mass * (1 - (c.massLossRate / 1000));
                    user.massTotal -= cell.mass - massLoss;
                    cell.mass = massLoss;
                }
            });
        });
    }

    game.balanceMass(users, food);
}

// Отправка обновлений игроку
function sendUpdates() {
    let users = usersController.getUsers();
    users.forEach(function (u) {
        // center the view if x/y is undefined, this will happen for spectators
        u.x = u.x || c.gameWidth / 2;
        u.y = u.y || c.gameHeight / 2;

        var visibleFood = food
            .map(function (f) {
                if (f.x > u.x - u.screenWidth / 2 - 20 &&
                    f.x < u.x + u.screenWidth / 2 + 20 &&
                    f.y > u.y - u.screenHeight / 2 - 20 &&
                    f.y < u.y + u.screenHeight / 2 + 20) {
                    return f;
                }
            })
            .filter(function (f) {
                return f;
            });

        var visibleMass = massFood
            .map(function (f) {
                if (f.x + f.radius > u.x - u.screenWidth / 2 - 20 &&
                    f.x - f.radius < u.x + u.screenWidth / 2 + 20 &&
                    f.y + f.radius > u.y - u.screenHeight / 2 - 20 &&
                    f.y - f.radius < u.y + u.screenHeight / 2 + 20) {
                    return f;
                }
            })
            .filter(function (f) {
                return f;
            });

        var visibleCells = users
            .map(function (user) {
                let cell = user.cells[0]
                if (cell.x + cell.radius > u.x - u.screenWidth / 2 - 20 &&
                    cell.x - cell.radius < u.x + u.screenWidth / 2 + 20 &&
                    cell.y + cell.radius > u.y - u.screenHeight / 2 - 20 &&
                    cell.y - cell.radius < u.y + u.screenHeight / 2 + 20) {
                    if (user.id !== u.id) {
                        return {
                            id: user.id,
                            x: user.x,
                            y: user.y,
                            cells: user.cells,
                            massTotal: Math.round(user.massTotal),
                            hue: user.hue,
                            name: user.name
                        };
                    } else {
                        return {
                            x: user.x,
                            y: user.y,
                            cells: user.cells,
                            massTotal: Math.round(user.massTotal),
                            hue: user.hue,
                        };
                    }
                }
            })
            .filter(function (user) {
                return user;
            });

        global.sockets[u.id].emit('serverTellPlayerMove', visibleCells, visibleFood, visibleMass);
    });
}

// Периодичность, с которой срабатывают циклы игры
setInterval(moveloop, 600 / 60);
setInterval(gameloop, 600);
setInterval(sendUpdates, 600 / c.networkUpdateFactor);

// Don't touch, IP configurations.
var ipaddress = process.env.OPENSHIFT_NODEJS_IP || process.env.IP || c.host;
var serverport = process.env.OPENSHIFT_NODEJS_PORT || process.env.PORT || c.port;
exports.server = http.listen(serverport, ipaddress, function () {
    console.log('[DEBUG] Listening on ' + ipaddress + ':' + serverport);
});
