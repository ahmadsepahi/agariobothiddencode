/*jshint expr:true */

/*
 * Автор - Алексей Костюченко
 * 
 * Описание - тестирование сокетов. 
 */

/*
 *  Внимание! 
 * При запуске сервера Gulp проходит по всем тестам. Для тестирования сокетов создается соединение на том же порту,
 * который необходим для запуска сервера. В следствии чего сервер запуститься не может, так как порт уже занят.
 * 
 * Для решения данной проблемы, перед запуском сервера этот файл необходимо исключить из тестов путем написания "return;".
 * 
 * Для запуска тестирования удалите "return;" после данного комментария и выполните команду npm run test.
 * 
 * Простите за костыли :)
 */
return;

var expect = require('chai').expect,
    io = require('socket.io-client'),
    options = {
        transports: ['websocket'],
        forceNew: true,
        reconnection: false
    };
var server = require('../src/server/server');
var socketURL = 'http://localhost:3000';

var user = {
    'name': 'Alex',
    'type': 'player',
    'target': {
        'x': 0,
        'y': 0
    }
};

describe("Socket.io", function () {

    /* Test 1 - Check connection to server.
    Проверка соединения с сервером. Проверка корректного взаимодействия сокетов.
     */
    it('Should recieve pongcheck message from server', function (done) {
        var client = io.connect(socketURL, options);

        client.on('connect', function () {
            // При подключении к серверу отправляем ему сообщение 'pingcheck'
            client.emit('pingcheck');
        });

        // При получении сообщения 'pingcheck' сервер должен отправить нам сообщение 'pongcheck'
        client.on('pongcheck', function () {
            // Если данное сообщение получена, значит взаимодействие сокетов корректно.
            client.disconnect();
            done();
        });
    });

    /* Test 2 - Check connection user to the server. 
    Проверка присоединения пользователя к серверу.
    */
    it('Should recieve object with name of connected client', function (done) {
        var client = io.connect(socketURL, options);

        client.on('connect', function () {
            // После подключения к серверу отправляем ему информацию о пользователе.
            client.emit('gotit', user);
        });

        // Получаем сообщение от сервера об успешной регистрации пользователя в игре. В сообщение должен вернуться объект этого пользователя.
        client.on('playerJoin', function (obj) {
            // Проверяем, что вернулся объект.
            expect(obj).to.be.a('object');
            
            // Проверяем, что "Имя" является строковой переменной.
            expect(obj.name).to.be.a('string');

            // Проверяем, что имя совпадает с тем, что мы отправили на сервер.
            expect(obj.name).to.equal(user.name);
            client.disconnect();
            done();
        });
    });

    /* Test 3 - Check disconnection user from the server. 
    Проверка отключения пользователя от сервера.
    */
    it('Should recieve object with name of diconnected client', function (done) {
        // Создаем два соединения
        var client = io.connect(socketURL, options);
        var client2 = io.connect(socketURL, options);

        client.on('connect', function () {
            // Подключаем пользователя 1, затем отключаем его.
            client.emit('gotit', user);
            setTimeout(() => {
                client.disconnect()
            }, 40);
        });

        // Пользователь 2 должен получить сообщение об отключении пользователя.
        client2.on('playerDisconnect', function (obj) {
            // Проверяем, что вернулся объект.
            expect(obj).to.be.a('object');
            // Проверяем, что "Имя" является строковой переменной.
            expect(obj.name).to.be.a('string');
            // Проверяем, что имя совпадает с именем пользователя 1 (которого отключили).
            expect(obj.name).to.equal(user.name);
            client2.disconnect();
            done();
        });
    });

    /* Test 4 - Check respawning user. 
    Проверка повторного входа в игру после смерти.
    */
    it('Should recieve object with name of respawned client', function (done) {
        var client = io.connect(socketURL, options);

        client.on('connect', function () {
            // После захода в игру вызываем событие 'respawn' и передаем данные о текущем игроке. Данное событие срабатывает после смерти игрока и повторного входа в игру.
            client.emit('gotit', user);
            setTimeout(() => {
                client.emit('respawn');
            }, 40);
        });

        // Получаем сообщение от сервера об успешном входе на поле игры.
        client.on('welcome', function (obj) {
            // Проверяем, что вернулся объект.
            expect(obj).to.be.a('object');
            // Проверяем, что "Имя" является строковой переменной.
            expect(obj.name).to.be.a('string');
            // Проверяем, что имя совпадает с тем, что мы отправили на сервер.
            expect(obj.name).to.equal(user.name);
            client.disconnect();
            done();
        });
    });
});
