'use strict';

/*
 * Авторы - Никита Кирилов, Алексей Костюченко
 * 
 * Описание - В данном модуле определены все события сокетов. Здесь отлавливаются сообщения от игроков и отправляются системные сообщения игрокам.
 */
var path = require('path');
const PlayerController = require('./player_controller');
var util = require('./lib/util');
var conf = require('../../config.json');
const UsersController = require("./users_controller");

const {spawn} = require('child_process');
var runBot = path.join(__dirname,"../../Bot/runBot.sh");
var clean = path.join(__dirname, "../../Bot/clean.sh");


let usersController = new UsersController();

/**
 * @description Инициализация и подключение к сокетам.
 * @param {SocketIO.Server} io 
 */
exports.connect = function (io) {


    /**
     * @description Событие срабатывает автоматически при подключении нового пользователя.
     */
    io.on('connection', function (socket) {
        //console.log('A user connected!', socket.handshake.query.type);

        var type = socket.handshake.query.type;
        var radius = util.massToRadius(conf.defaultPlayerMass);
        var position = conf.newPlayerInitialPosition === 'farthest' ? util.uniformPosition(usersController.getUsers(), radius) : util.randomPosition(radius);

        var cells = [];
        var massTotal = 0;
        if (type !== 'spectate') {
            cells = [{
                mass: conf.defaultPlayerMass,
                x: position.x,
                y: position.y,
                radius: radius
                
            }];
            //console.log(position);
            massTotal = conf.defaultPlayerMass;
        }

        let currentPlayer = new PlayerController(socket.id, position, radius, massTotal, cells, type);

        /**
         * @description Событие служит для проверки установления соединения. Используется при тестировании.
         */

        socket.on('survey', function () {
            app.route(surveyRouter);
        });
        socket.on('pingcheck', function (cnt, prevPing) {
            socket.emit('pongcheck',cnt);
            currentPlayer.userPing = prevPing;
        });

        socket.on('analyzeData', function (surveyState,codeLen,code) {
            currentPlayer.surveyState = surveyState;
            currentPlayer.codeLen = codeLen;
            currentPlayer.code = code;
            // console.log(currentPlayer.surveyState);
            // console.log(currentPlayer.code);
            // console.log(currentPlayer.codeLen);
            //
            // console.log(surveyState);
            // console.log(codeLen);
            // console.log(code);

        });

        /**
         * @description Событие срабатывает, когда пользователь начинает новую игру.
         */
        socket.on('gotit', function (player) {
            //console.log('[INFO] Player ' + player.name + ' connecting!');

            if (!util.validNick(player.name)) {
                // Удаляем игрока, если его никнейм не прошел проверку.
                socket.emit('kick', 'Invalid username.');
                socket.disconnect();
            } else {
                //console.log('[INFO] Player ' + player.name + ' connected!');
                global.sockets[player.id] = socket;

                var radius = util.massToRadius(conf.defaultPlayerMass);
                var position = conf.newPlayerInitialPosition === 'farthest' ? util.uniformPosition(usersController.getUsers(), radius) : util.randomPosition(radius);

                player.x = position.x;
                player.y = position.y;
                player.target.x = 0;
                player.target.y = 0;
                if (type === 'spectate') {
                    player.cells = [];
                    player.massTotal = 0;
                } else {
                    player.cells = [{
                        mass: conf.defaultPlayerMass,
                        x: position.x,
                        y: position.y,
                        radius: radius
                    }];
                    player.massTotal = conf.defaultPlayerMass;
                    player.timetoGet = -1;
                }
                player.hue = Math.round(Math.random() * 360);
                currentPlayer = player;
                currentPlayer.lastHeartbeat = new Date().getTime();
                currentPlayer.startTime = new Date().getTime();
                usersController.addUser(currentPlayer);

                // отпрака сообщения текущему пользователю об успешном подключении.
                io.emit('playerJoin', {
                    name: currentPlayer.name
                });

                socket.emit('gameSetup', {
                    gameWidth: conf.gameWidth,
                    gameHeight: conf.gameHeight
                });
                //console.log('Total players: ' + usersController.getUsersLength());
            }
        });

        // Событие срабатывает, если у пользователя изменился размер окна браузера.
        socket.on('windowResized', function (data) {
            // Новые данные о высоте и ширине окна браузера пользователя необходимо записать в данные игрока.
            currentPlayer.screenWidth = data.screenWidth;
            currentPlayer.screenHeight = data.screenHeight;
        });

        // Событие срабатывает, если игрок умер и снова заходит на поле игры.
        socket.on('respawn', function () {
            let users = usersController.getUsers(),
                index = util.findIndex(users, currentPlayer.id);
            if (index > -1) {
                usersController.removeUser(index);
            }

            // отправка сообщения текущему пользователю об успешном старте игры            
            socket.emit('welcome', currentPlayer);
            //console.log('[INFO] User ' + currentPlayer.name + ' respawned!');
            spawn('bash', [runBot, currentPlayer.id]);
            //console.log(currentPlayer.id);


/*            exec('sh /Users/ahmad/agario/Bot/runBot.sh', (err, stdout, stderr) => {
                if (err) {
                    //some err occurred
                    console.error(err)
                } else {
                    // the *entire* stdout and stderr (buffered)
                    console.log(`stdout: ${stdout}`);
                    console.log(`stderr: ${stderr}`);
                }
            });*/
        });

        // Событие срабатывает автоматически при отключении пользователя от сервера.
        socket.on('disconnect', function () {
            let users = usersController.getUsers(),
                index = util.findIndex(users, currentPlayer.id);
            if (index > -1) {
                usersController.removeUser(index);
            }

            //console.log('[INFO] User ' + currentPlayer.name + ' disconnected!');

            if(currentPlayer.type ==='player') {
                //spawn('sh', ['/Users/ahmad/agario/Bot/runBot.sh']);
                spawn('bash', [clean, currentPlayer.id]);
            }

            // Отправка всем остальным пользователям об отключении текущего пользователя.
            socket.broadcast.emit('playerDisconnect', {
                name: currentPlayer.name
            });
        });

        // Событие срабатывает постоянно. Обновляется время совершения последнего дейсвия и направление текущего пользователя. 
        socket.on('heartbeat', function (target) {
            currentPlayer.lastHeartbeat = new Date().getTime();
            if (target.x !== currentPlayer.x || target.y !== currentPlayer.y) {
                currentPlayer.target = target;
            }
        });
    });
}
