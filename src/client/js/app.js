var io = require('socket.io-client');
var Canvas = require('./canvas'); //подключение модулей
var global = require('./global');
//var ChatClient = require('./chat-client');

var playerNameInput = document.getElementById('playerNameInput'); //переменная с index.html Имя пользователя
var socket;
var reason;

var pingInterval = 200;
var checkPingFreq = 50;
var finScore=0;
var finTime=0;
var lastPing = 0;
var finCode = 'null';
var urlAddr = '';   //This is like ?username-003Code
var checkPing = true;

var debug = function(args) { //для вывода в консоль браузера сообщения 
    if (console && console.log) {
        console.log(args);
    }
};

function startGame(type) { // обработка начала игры Нагуслае Николай
    global.playerName = playerNameInput.value.replace(/(<([^>]+)>)/ig, '').substring(0,25);
    global.playerType = type;

    global.screenWidth = window.innerWidth; //установка начала параметров
    global.screenHeight = window.innerHeight;

    document.getElementById('startMenuWrapper').style.maxHeight = '0px'; //сворачиваем экран меню
    document.getElementById('gameAreaWrapper').style.opacity = 1; //открываем игру
    if (!socket) {
        socket = io({query:"type=" + type}); //кидаем на сервер тип игрока(игрок или наблюдатель)
        setupSocket(socket); //установка сокета
    }
    if (!global.animLoopHandle)
        animloop(); //цикл игры
    socket.emit('respawn'); //отправить что произошло "перерождение"
    //window.chat.socket = socket;
    //window.chat.registerFunctions();
    window.canvas.socket = socket; //установка сокета
    global.socket = socket;
    //analyzeUrl();
}

// Валидация имени Рубан Анна
function validNick() {
    var regex = /^\w*$/;
    debug('Regex Test', regex.exec(playerNameInput.value));
    return regex.exec(playerNameInput.value) !== null;
}

function analyzeUrl() {
    var url = document.getElementById("url").getAttribute("value");
    //console.log(url);
    url = url.substring(url.indexOf(global.playerName));
    var data = url.substring(url.indexOf("-")+1,url.length);
    //console.log("data: "+data);
    global.surveyState = data.substring(0,2);
    global.codeLen = data.substring(2,3);
    global.code = data.substring(3,data.length);
    /*console.log(global.surveyState);
    console.log(global.code);
    console.log(global.codeLen);*/

    socket.emit('analyzeData', global.surveyState, global.codeLen, global.code);



}

function survey(){

    //window.open("/survey/"+global.playerName+"/"+global.pingLatency+"/"+finScore+"/"+finTime+"/"+finCode+"/"+urlAddr, "_self");
    window.open("/survey/"+global.playerName+"/"+global.pingLatency+"/"+finScore+"/"+finTime+"/"+urlAddr, "_self");


    if (!socket) {
        console.log("socket is not defined");

        socket = io({query: "type=player"});
        setupSocket(socket);

    }

    debug('PingLATANCY5: ' + global.pingLatency);

}

window.onload = function() {

    var btn = document.getElementById('startButton'), //обработка нажатия клавиш
        //btnS = document.getElementById('spectateButton'),
        nickErrorText = document.querySelector('#startMenu .input-error'); //для вывода ошибок
        btnSvy =document.getElementById('surveyBotton');
 
    /*btnS.onclick = function () { //наблюдатель
        startGame('spectate');
    };*/

    btnSvy.onclick = function(){
        checkLatency();
        survey();
    };

    btn.onclick = function () { //обработка кнопки старт игры

        // Проверка имени
        if (validNick()) {
            nickErrorText.style.opacity = 0;
            startGame('player');
        } else {
            nickErrorText.style.opacity = 1;
        }
    };

    playerNameInput.addEventListener('keypress', function (e) { //обработка нажатия enter для старта
        var key = e.which || e.keyCode;

        if (key === global.KEY_ENTER) {
            if (validNick()) {
                nickErrorText.style.opacity = 0;
                startGame('player');
            } else {
                nickErrorText.style.opacity = 1;
            }
        }
    });
};


var foodConfig = { //для границ еды
    border: 0,
};

var playerConfig = { //Внешние параметры игрока(первоначальные, типа цвет, границы и т.д.) 
    border: 6,
    textColor: '#FFFFFF',
    textBorder: '#000000',
    textBorderSize: 3,
    defaultSize: 30
};

var player = { //структура для игрока Рубан Анна
    id: -1,
    x: global.screenWidth / 2,
    y: global.screenHeight / 2,
    screenWidth: global.screenWidth,
    screenHeight: global.screenHeight,
    target: {x: global.screenWidth / 2, y: global.screenHeight / 2}
};
global.player = player;

var foods = []; //еда
var users = []; //пользователи
var target = {x: player.x, y: player.y}; //цель
global.target = target;

window.canvas = new Canvas(); //создание класса канваса для отрисовки графики
//window.chat = new ChatClient();

var c = window.canvas.cv; 
var graph = c.getContext('2d');//используем 2д 

//установка сокета (передача сообщения через вебсокеты) Нагуслаев Николай
// socket stuff.
function setupSocket(socket) {
    // Handle ping.
/*    socket.on('pongcheck', function () { //проходит ли пинг
        var latency = Date.now() - global.startPingTime;
        debug('Latency: ' + latency + 'ms');
    });*/

    socket.on('pongcheck', function (cnt) {
        //debug('TimeArraySize: ' + Object.keys(global.timeArray).length);
        if(global.timeArray !== undefined && cnt in global.timeArray) {
            var latency = Date.now() - global.timeArray[cnt];
            if (global.pingLatency > latency) {
                global.pingLatency = latency;
            }
        }
        else{
            debug("error global time array");
        }
    });

    // Handle error.
    socket.on('connect_failed', function () { //когда не возможно подрубиться
        socket.close();
        global.disconnected = true;
    });

    socket.on('disconnect', function () { //отсоединился
        console.log('disconnect');
        socket.close();
        global.disconnected = true;
    });

    // Handle connection.
    socket.on('welcome', function (playerSettings) { //если все ок, присвоить все основные  параметры

        player = playerSettings;
        player.name = global.playerName;
        player.screenWidth = global.screenWidth;
        player.screenHeight = global.screenHeight;
        player.target = window.canvas.target;
        global.player = player;
        socket.emit('gotit', player);
        global.gameStart = true;
        debug('Game started at: ' + global.gameStart);
        analyzeUrl();

        c.focus();


    });

    socket.on('gameSetup', function(data) { //начало игры, установка поля 
        global.gameWidth = data.gameWidth;
        global.gameHeight = data.gameHeight;
        resize();
    });

    socket.on('playerDied', function (data) {
        console.log('playerDied');
        // TODO сообщение
        //window.chat.addSystemLine('{GAME} - <b>' + (data.name.length < 1 ? 'An unnamed cell' : data.name) + '</b> was eaten.');

    });

    socket.on('playerDisconnect', function (data) {
        console.log('playerDisconnect');
        // TODO сообщение
        //window.chat.addSystemLine('{GAME} - <b>' + (data.name.length < 1 ? 'An unnamed cell' : data.name) + '</b> disconnected.');

    });

    socket.on('playerJoin', function (data) {
        // TODO сообщение
        //window.chat.addSystemLine('{GAME} - <b>' + (data.name.length < 1 ? 'An unnamed cell' : data.name) + '</b> joined.');

    });

    // Handle movement.
    socket.on('serverTellPlayerMove', function (userData, foodsList, massList) { //перемещение игроков (установка всех параметров, где и что находится)
        var playerData;
        for(var i =0; i< userData.length; i++) {
            if(typeof(userData[i].id) == "undefined") {
                playerData = userData[i];
                i = userData.length;
            }
        }
        if(global.playerType == 'player') { 
            var xoffset = player.x - playerData.x;
            var yoffset = player.y - playerData.y;

            player.x = playerData.x;
            player.y = playerData.y;
            player.hue = playerData.hue;
            player.massTotal = playerData.massTotal;
            player.cells = playerData.cells;
            player.xoffset = isNaN(xoffset) ? 0 : xoffset;
            player.yoffset = isNaN(yoffset) ? 0 : yoffset;
        }
        users = userData;
        foods = foodsList;
    });

    // Смерть
    socket.on('RIP', function (data) {
        console.log('RIP');
        global.gameStart = false;
        global.died = true;
        global.kicked = true;
        reason = data;
        window.setTimeout(function() {
            document.getElementById('gameAreaWrapper').style.opacity = 0;
            document.getElementById('startMenuWrapper').style.maxHeight = '1000px';
            global.died = false;
            if (global.animLoopHandle) {
                window.cancelAnimationFrame(global.animLoopHandle); //закончить анимацию
                global.animLoopHandle = undefined;
            }
            window.open(window.location.href,'_self');
        }, 5000);
    });

    socket.on('kick', function (data, score, time,code,urladdr,done) {
        global.code = code;
        global.gameStart = false;
        reason = data;
        global.kicked = true;
        socket.close();
        console.log('score: '+score + ' and time: '+time);
        finScore = score;
        finTime = time;
        finCode = code;
        urlAddr = urladdr;
        if(done){
            document.getElementById("surveyBotton").style.visibility="visible";
        }

        if(Date.now() - global.gameStart > pingInterval ){
            checkLatency();
            //analyzeUrl();
            //pingInterval *= 1.5;
            //checkPing();
        }
        //document.getElementById("surveyBotton").style.visibility="visible";
        if(done == false){
            window.setTimeout(function() {
                document.getElementById('gameAreaWrapper').style.opacity = 0;
                document.getElementById('startMenuWrapper').style.maxHeight = '1000px';
                global.died = false;
                if (global.animLoopHandle) {
                    window.cancelAnimationFrame(global.animLoopHandle); //закончить анимацию
                    global.animLoopHandle = undefined;
                }
                window.open(window.location.href,'_self');
            }, 5000);
        }

    });
}
//отрисовка шариков еды Нагуслаев Николай
function drawCircle(centerX, centerY, radius, sides) {
    var theta = 0;
    var x = 0;
    var y = 0;

    graph.beginPath(); //начало отрисовки

    for (var i = 0; i < sides; i++) {
        theta = (i / sides) * 2 * Math.PI;
        x = centerX + radius * Math.sin(theta); //вычисление координат х и у
        y = centerY + radius * Math.cos(theta);
        graph.lineTo(x, y); //отрисовка с помощью линий
    }

    graph.closePath();
    graph.stroke(); //закрашивание с бортиками
    graph.fill();
}

//Отрисовка еды Нагуслаев Николай
function drawFood(food) {
    graph.strokeStyle = 'hsl(198.6, 100%, 45%)'; 
    graph.fillStyle = 'hsl(198.6, 100%, 50%)'; 
    graph.lineWidth = foodConfig.border; 
    drawCircle(food.x - player.x + global.screenWidth / 2,
               food.y - player.y + global.screenHeight / 2,
               food.radius, global.foodSides);
}

// Отрисовка игроков Рубан Анна
function drawPlayers(order) {

    if(checkPing == true && global.cnt < checkPingFreq && (Date.now() - lastPing) > pingInterval){
        checkLatency();
        lastPing = Date.now();
    }
    else if(checkPing == true && global.cnt >= checkPingFreq) {
        checkPing = false;
    }

    var start = {
        x: player.x - (global.screenWidth / 2), //установка начальных координат
        y: player.y - (global.screenHeight / 2)
    };

    for(var z=0; z<order.length; z++)
    {
        var userCurrent = users[order[z].nCell]; //установка основных параметров
        var cellCurrent = users[order[z].nCell].cells[order[z].nDiv];

        var x=0;
        var y=0;

        var points = 30 + ~~(cellCurrent.mass/5); //расчет размера Нагуслаев Николай
        var increase = Math.PI * 2 / points; //увеличение шарика

        graph.strokeStyle = 'hsl(' + userCurrent.hue + ', 100%, 45%)'; //цвет
        graph.fillStyle = 'hsl(' + userCurrent.hue + ', 100%, 50%)';
        graph.lineWidth = playerConfig.border;

        var xstore = [];
        var ystore = [];

        global.spin += 0.0;

        var circle = {
            x: cellCurrent.x - start.x,
            y: cellCurrent.y - start.y
        };

        for (var i = 0; i < points; i++) {

            x = cellCurrent.radius * Math.cos(global.spin) + circle.x; 
            y = cellCurrent.radius * Math.sin(global.spin) + circle.y;
            if(typeof(userCurrent.id) == "undefined") {
                x = valueInRange(-userCurrent.x + global.screenWidth / 2, //вычисление диапозона
                                 global.gameWidth - userCurrent.x + global.screenWidth / 2, x);
                y = valueInRange(-userCurrent.y + global.screenHeight / 2,
                                 global.gameHeight - userCurrent.y + global.screenHeight / 2, y);
            } else {
                x = valueInRange(-cellCurrent.x - player.x + global.screenWidth / 2 + (cellCurrent.radius/3),
                                 global.gameWidth - cellCurrent.x + global.gameWidth - player.x + global.screenWidth / 2 - (cellCurrent.radius/3), x);
                y = valueInRange(-cellCurrent.y - player.y + global.screenHeight / 2 + (cellCurrent.radius/3),
                                 global.gameHeight - cellCurrent.y + global.gameHeight - player.y + global.screenHeight / 2 - (cellCurrent.radius/3) , y);
            }
            global.spin += increase; //размер
            xstore[i] = x;
            ystore[i] = y;
        }
  
        for (i = 0; i < points; ++i) { //отрисовка игроков
            if (i === 0) {
                graph.beginPath(); 
                graph.moveTo(xstore[i], ystore[i]);
            } else if (i > 0 && i < points - 1) {
                graph.lineTo(xstore[i], ystore[i]);
            } else {
                graph.lineTo(xstore[i], ystore[i]);
                graph.lineTo(xstore[0], ystore[0]);
            }

        }
        graph.lineJoin = 'round';
        graph.lineCap = 'round';
        graph.fill();
        graph.stroke();
        var nameCell = "";
        if(typeof(userCurrent.id) == "undefined")
            nameCell = player.name;
        else
            nameCell = userCurrent.name;

        var fontSize = Math.max(cellCurrent.radius / 3, 12);
        graph.lineWidth = playerConfig.textBorderSize;
        graph.fillStyle = playerConfig.textColor;
        graph.strokeStyle = playerConfig.textBorder;
        graph.miterLimit = 1;
        graph.lineJoin = 'round';
        graph.textAlign = 'center';
        graph.textBaseline = 'middle';
        graph.font = 'bold ' + fontSize + 'px sans-serif';

        if (global.toggleMassState === 0) {
            graph.strokeText(nameCell, circle.x, circle.y);
            graph.fillText(nameCell, circle.x, circle.y);
        } else {
            graph.strokeText(nameCell, circle.x, circle.y);
            graph.fillText(nameCell, circle.x, circle.y);
            graph.font = 'bold ' + Math.max(fontSize / 3 * 2, 10) + 'px sans-serif';
            if(nameCell.length === 0) fontSize = 0;
            graph.strokeText(Math.round(cellCurrent.mass), circle.x, circle.y+fontSize);
            graph.fillText(Math.round(cellCurrent.mass), circle.x, circle.y+fontSize);
        }
    }
}

function valueInRange(min, max, value) { //вычисление диапазона 
    return Math.min(max, Math.max(min, value));
}
//Отрисовка поля Нагуслаев Николай
function drawgrid() {
     graph.lineWidth = 1;
     graph.strokeStyle = global.lineColor;
     graph.globalAlpha = 0.15;
     graph.beginPath();

    for (var x = global.xoffset - player.x; x < global.screenWidth; x += global.screenHeight / 18) {
        graph.moveTo(x, 0);
        graph.lineTo(x, global.screenHeight);
    }

    for (var y = global.yoffset - player.y ; y < global.screenHeight; y += global.screenHeight / 18) {
        graph.moveTo(0, y);
        graph.lineTo(global.screenWidth, y);
    }

    graph.stroke();
    graph.globalAlpha = 1;
}
//Отрисовка границ Нагуслаев Николай
function drawborder() {
    graph.lineWidth = 1;
    graph.strokeStyle = playerConfig.borderColor;

    // Left-vertical.
    if (player.x <= global.screenWidth/2) {
        graph.beginPath();
        graph.moveTo(global.screenWidth/2 - player.x, 0 ? player.y > global.screenHeight/2 : global.screenHeight/2 - player.y);
        graph.lineTo(global.screenWidth/2 - player.x, global.gameHeight + global.screenHeight/2 - player.y);
        graph.strokeStyle = global.lineColor;
        graph.stroke();
    }

    // Top-horizontal.
    if (player.y <= global.screenHeight/2) {
        graph.beginPath();
        graph.moveTo(0 ? player.x > global.screenWidth/2 : global.screenWidth/2 - player.x, global.screenHeight/2 - player.y);
        graph.lineTo(global.gameWidth + global.screenWidth/2 - player.x, global.screenHeight/2 - player.y);
        graph.strokeStyle = global.lineColor;
        graph.stroke();
    }

    // Right-vertical.
    if (global.gameWidth - player.x <= global.screenWidth/2) {
        graph.beginPath();
        graph.moveTo(global.gameWidth + global.screenWidth/2 - player.x,
                     global.screenHeight/2 - player.y);
        graph.lineTo(global.gameWidth + global.screenWidth/2 - player.x,
                     global.gameHeight + global.screenHeight/2 - player.y);
        graph.strokeStyle = global.lineColor;
        graph.stroke();
    }

    // Bottom-horizontal.
    if (global.gameHeight - player.y <= global.screenHeight/2) {
        graph.beginPath();
        graph.moveTo(global.gameWidth + global.screenWidth/2 - player.x,
                     global.gameHeight + global.screenHeight/2 - player.y);
        graph.lineTo(global.screenWidth/2 - player.x,
                     global.gameHeight + global.screenHeight/2 - player.y);
        graph.strokeStyle = global.lineColor;
        graph.stroke();
    }
}

window.requestAnimFrame = (function() { //для анимации(синхронизация с графическим процессором и съедает меньше ресурсов CPU)
    return  window.requestAnimationFrame       ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame    ||
            window.msRequestAnimationFrame     ||
            function( callback ) {
                window.setTimeout(callback, 1000 / 60);
            };
})();

window.cancelAnimFrame = (function(handle) { //прекращение анимации
    return  window.cancelAnimationFrame     ||
            window.mozCancelAnimationFrame;
})();
// Цикл игры  Рубан Анна
function animloop() {
    global.animLoopHandle = window.requestAnimFrame(animloop);
    gameLoop();
}
//отрисовка основных параметров и логика основной игры Рубан Анна
function gameLoop() {
    if (global.died) {//если умер
        graph.fillStyle = '#333333';
        graph.fillRect(0, 0, global.screenWidth, global.screenHeight);  //отрисовка фона Нагуслаев Николай

        graph.textAlign = 'center';
        graph.fillStyle = '#FFFFFF';
        graph.font = 'bold 30px sans-serif';$
        graph.fillText('You died!', global.screenWidth / 2, global.scre$enHeight / 2);

        //graph.fillText('You were kicked for:', global.screenWidth / 2, global.screenHeight / 2 - 20);
        graph.fillText('', global.screenWidth / 2, global.screenHeight / 2 - 20);
        graph.fillText(reason, global.screenWidth / 2, global.screenHeight / 2 + 20);
    }
    else if (!global.disconnected) { //обработка событий(соединение с сервером) Рубан Анна
        if (global.gameStart) { //если начала игры, отрисовка фона, сетки и т.д.
            graph.fillStyle = global.backgroundColor;
            graph.fillRect(0, 0, global.screenWidth, global.screenHeight);

            drawgrid();
            foods.forEach(drawFood);

            if (global.borderDraw) {
                drawborder();
            }
            var orderMass = []; //масса Нагуслаев Николай
            for(var i=0; i<users.length; i++) {
                for(var j=0; j<users[i].cells.length; j++) {
                    orderMass.push({ //установка массы для всех
                        nCell: i,
                        nDiv: j,
                        mass: users[i].cells[j].mass
                    });
                }
            }
            orderMass.sort(function(obj1, obj2) { //разница масс
                return obj1.mass - obj2.mass;
            });

            drawPlayers(orderMass); //отрисовка игра в соответствие с массой
            socket.emit('heartbeat', window.canvas.target); // playerSendTarget "Heartbeat".

        } else {
            graph.fillStyle = '#333333'; //если игра закончена
            graph.fillRect(0, 0, global.screenWidth, global.screenHeight);

            graph.textAlign = 'center';
            graph.fillStyle = '#FFFFFF';
            graph.font = 'bold 30px sans-serif';
            graph.fillText('Game Over!', global.screenWidth / 2, global.screenHeight / 2);
        }
    } else { //выкинуло
        graph.fillStyle = '#333333';
        graph.fillRect(0, 0, global.screenWidth, global.screenHeight);

        graph.textAlign = 'center';
        graph.fillStyle = '#FFFFFF';
        graph.font = 'bold 26px sans-serif';
        if (global.kicked) {
            if (reason !== '') {
                //graph.fillText('You were kicked for:', global.screenWidth / 2, global.screenHeight / 2 - 20);
                graph.fillText('', global.screenWidth / 2, global.screenHeight / 2 - 20);
                graph.fillText(reason, global.screenWidth / 2, global.screenHeight / 2 + 20);
            }
            else {
                graph.fillText('You were kicked!', global.screenWidth / 2, global.screenHeight / 2);
            }
        }
        else {
              graph.fillText('Disconnected!', global.screenWidth / 2, global.screenHeight / 2);
        }
    }
}

window.addEventListener('resize', resize);
//Изменение размера поля Рубан Анна
function resize() {
    if (!socket) return;

    player.screenWidth = c.width = global.screenWidth = global.playerType == 'player' ? window.innerWidth : global.gameWidth;
    player.screenHeight = c.height = global.screenHeight = global.playerType == 'player' ? window.innerHeight : global.gameHeight;

    if (global.playerType == 'spectate') {
        player.x = global.gameWidth / 2;
        player.y = global.gameHeight / 2;
    }

    socket.emit('windowResized', { screenWidth: global.screenWidth, screenHeight: global.screenHeight });
}

function checkLatency() {
    // Ping.
    global.startPingTime = Date.now();
    global.timeArray[global.cnt] =Date.now();
    socket.emit('pingcheck', global.cnt, global.pingLatency);
    global.cnt++;

}
