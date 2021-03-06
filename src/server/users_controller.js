'use strict';

let users = [];

/*
 * Автор - Алексей Костюченко
 * 
 * Описание - Данный модуль служит для хранения, добавления и удаления пользователей из массива, а также для получения иноформации о списке игроков из любого файла.
 */

/**
 * @author Алексей Костюченко
 * @description Служит для хранения, добавления и удаления пользователей из массива, а также для получения иноформации о списке игроков из любого файла.
 */
class UserController {

    /**
     * @method Получить список пользователей.
     */
    getUsers() {
        return users;
    }

    /**
     * @method Добавление пользователя в список пользователей.
     * @param {Object} user объект пользователя.
     */
    addUser(user) {
        users.push(user);
    }

    /**
     * @method Получение количества пользователей в списке пользователей.
     */
    getUsersLength() {
        return users.length;
    }

    /**
     * @method Удаление пользователя из списка пользователей по индексу.
     * @param {number} index индекс пользователя.
     */
    removeUser(index) {
        users.splice(index, 1);
    }
}


module.exports = UserController;
