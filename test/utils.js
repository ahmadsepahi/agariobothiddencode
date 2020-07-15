/*jshint expr:true */

/*
 * Автор - Алексей Костюченко
 * 
 * Описание - тестирование основных инструментов сервера. 
 */

var expect = require('chai').expect,
    util = require('../src/server/lib/util');

describe('util.js', function () {

    describe('#massToRadius', function () {

        // Функция должна вернуть не нулевое значение, при передавании ей нулевого значения.
        it('should return non-zero radius on zero input', function () {
            // Передаем функции нулевое значение.
            var r = util.massToRadius(0);
            // Проверяем, что возвращается число
            expect(r).to.be.a('number');
            // Проверяем, что радиус равен 4. По формуле. Главное, что не нулевое значение.
            expect(r).to.equal(4);
        });

        // Проверка правильности расчета радиуса исходя из массы.
        it('should convert masses to a circle radius', function () {
            var r1 = util.massToRadius(4),
                r2 = util.massToRadius(16),
                r3 = util.massToRadius(1);

            expect(r1).to.equal(16); // При радиусе 4 должно вернуться 16
            expect(r2).to.equal(28); // При радиусе 16 должно вернуться 28
            expect(r3).to.equal(10); // При радиусе 1 должно вернуться 10
        });
    });

    describe('#validNick', function () {

        // Сервер должен пропускать никнеймы с символами ascii
        it('should allow ascii character nicknames', function () {
            var n1 = util.validNick('Walter_White'),
                n2 = util.validNick('Jesse_Pinkman'),
                n3 = util.validNick('hank'),
                n4 = util.validNick('marie_schrader12'),
                n5 = util.validNick('p');

            expect(n1).to.be.true;
            expect(n2).to.be.true;
            expect(n3).to.be.true;
            expect(n4).to.be.true;
            expect(n5).to.be.true;
        });

        // Сервер не должен пропускать никнеймы с символами unicode (никнейм на русском не пройдет)
        it('should disallow unicode-dependent alphabets', function () {
            var n1 = util.validNick('Йèæü');

            expect(n1).to.be.false;
        });

        // Сервер не должен пропускать никнеймы с пробелами   
        it('should disallow spaces in nicknames', function () {
            var n1 = util.validNick('Walter White');
            expect(n1).to.be.false;
        });
    });

    describe('#getDistance', function () {

        // helper class
        function Point(x, y, r) {
            return {
                x: x,
                y: y,
                radius: r
            };
        }

        var p1 = Point(-100, 20, 1),
            p2 = Point(0, 40, 5),
            p3 = Point(0, 0, 100);

        // Функции должна вернуть положительное число.
        it('should return a positive number', function () {
            var d = util.getDistance(p1, p2);
            expect(d).to.be.above(-1);
        });
    });
});
