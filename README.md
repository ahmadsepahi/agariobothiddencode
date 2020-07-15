
=== RU ===

### Развертывание на локальной машине



#### Скопировать репозиторий через ssh или https отсюда:
#### Библиотке бота находится здесь: https://gitlab.com/prettyGoo/agario-python-bot

#### Использование на локальной системе
##### Установить nodejs версии не ниже 8: https://nodejs.org/en/
##### Установить все зависимости проекта: npm i
##### Запустить сервер: npm start

#### Зупуск внутри Docker
##### Если вы используете Linux или macOS и не имеете nodejs, установленный локально, то вы можете запустить проект внутри Docker
###### Для этого необходимо выполнить команду docker-compose up (убедитесь, что Docker and Docker compose установлены на вашей системе)
###### Вероятность, что докер заработает под Windows достаточно мала (но вы можете попытаться)

### NOTE:

#### Если будет в консоли ошибка, связанная с SIGNIN, то:
### lsof -i tcp:3000
### kill -9 <YOUR_PID>


#### PythonBot (https://pypi.org/project/agario-bot/)
##### Соответствующая папка может быть найдена в корне проекта. Она НЕ предназначена для запуска или прямого импорта, а лишь содержит для ознакомления код библиотеки для написания бота и содержит примеры
##### Если вы хотите использовать эту библиотеку для написания своего бота на Python, то она должна быть установлена через pip (лучше всего не засорять свой интерпретатор питона и устанавливать ее внутри virtualenv): pip install agario-bot
##### Примеры находятся в PythonBot/agario_bot/examples/scary_bot

##### Если вы хотите добавить какие-то изменения в саму библиотеку, то вам необходимо изменить setup.py (хотя бы название библиотеки), затем создать аккаунт на pypi.org, добавить логин и пароль в соотвествующий файл на системе для облегчения деплоя (о том, как это сделать, можно найти на сайте pypi) и выполнить команду make deploy.
##### Затем вы можете установить свою измененную версию библиотеки через команду через pip install your-new-library-name

#### Если вы хотите запустить сервер на хостинге (например, HerokuIf), то вы должны указать в качестве аргумента конструктора host тот url, где находится ваш сервер на хостинге


### NOTE:
#### Боты примеры по-умолчанию не будут работать на хостинге
#### Если бот не хочет запускаться под виндовс, то нужно попробовать указать в качестве host одно из следующих: localhost, 0.0.0.0, 127.0.0.1
#### Если вы измените порт по-умолчанию у сервера (сейчас это 3000), то не забудьте передать его в конструктора бота BotClient (например, это будет port=8080)

=== EN ===

### Local development


#### clone repo via ssh or https from here: 
#### if you want to clone bot-library, go here: https://gitlab.com/prettyGoo/agario-python-bot

#### local usage
##### install nodejs (recommended versions 8 or higher) : https://nodejs.org/en/
##### install dependicies: npm i
##### start server: npm start

#### Docker
##### if you are usering maxOS or Linux and do not have nodejs installed, you can launch the server in Docker
###### for this run 'docker-compose up' (make sure that you have docker and docker composed instlalled)
###### Docker container is rather unlikely to be launch on Windows (but you can try your luck)


#### PythonBot
##### Corresponding folder in project root must not be tried to laucnh, it is given here to show library code and bot examples
##### If you want to user this library for writing bot, it should be installed via pip (recommended to do it inside python virtualenv):
##### pip install agario-bot
##### homepage for library: https://pypi.org/project/agario-bot/
##### example can be found on homepage or in PythonBot/agario_bot/examples/scary_bot

##### If you want to add some changes to the library, you must update setup.py (at least change the name) and upload changes to your personal pypi accaount using 'make deploy'.
##### then your can install your new version of library via pip install your-new-library-name

#### If you want to deploy it on hosting (heroky e.g.), then you must pass specify host, where your server is running


### NOTE:
#### If bot is not working on Windows, then try to pass one of them as host to bot constructor (localhost, 0.0.0.0, 127.0.0.1)
#### If you change default port on the server (8080 e.g.), then change it for bot as well
