# coding: utf-8
from agario_bot.bot import BotClient
import math


def run_scary_bot():
    b = BotClient('ScaryBot', speed_rate=1, host='0.0.0.0', port=3000)

    surroundings = b.get_visible_surroundings()
    # 0 - влево, 1- вверх, 2-вправо, 3-вниз
    # предыдущее значение - x1, настоящее- x2
    flag = False
    kol = 0
    index = 0
    enemy = dict()
    direction = -1
    x = 0  #координаты бота
    y = 0

    while True:
        surroundings = b.get_visible_surroundings()
        for cell in surroundings['cells']:
            # блок добавление координат
            key_exists = 'id' in cell
            if key_exists is not True:
                x = cell['x']
                y = cell['y']
            else:
                if len(enemy) != 0:
                    print('enemy true')
                    for en in enemy:
                        print('[ENEMY]:', enemy[en]['id'], ' ', cell['id'])
                        if enemy[en]['id'] == cell['id']:
                            enemy[en]['x1'] = enemy[en]['x2']
                            enemy[en]['y1'] = enemy[en]['y2']
                            enemy[en]['x2'] = cell['x']
                            enemy[en]['y2'] = cell['y']
                            flag = True
                            break
                        else:
                            index = index + 1
                # если значение добавляется впервые
                if flag is False:
                    enemy[kol] = {"id" : cell['id'], "x1" : -10, "x2" : -10, "y1" : -10, "y2" : -10}
                    print(enemy[kol])
                    kol = kol + 1
                    index = 0
                else:
                    flag = False

                    print('[DISTANCE]: ', enemy[index]['x2'] - enemy[index]['x1'], ' 2: ', enemy[index]['y2'] - enemy[index]['y1'])
                    if enemy[index]['x1'] != -10 and  enemy[index]['y1'] != -10:
                        if enemy[index]['x2'] - enemy[index]['x1'] > 0 and math.fabs(enemy[index]['x1']-x) > math.fabs(enemy[index]['x2']-x ): #враг движется вправо, расстояние уменьшается
                            if math.fabs(enemy[index]['y2'] - y) > math.fabs(enemy[index]['x2'] - x):
                                if x < 900:
                                    b.move_right()
                                else:
                                    b.move_up()
                            else:
                               if y < 900:
                                    b.move_down()
                               else:
                                   b.move_up()
                        elif enemy[index]['x2'] - enemy[index]['x1'] < 0 and math.fabs(enemy[index]['x1']-x) > math.fabs(enemy[index]['x2']-x):#враг движется влево, расстояние уменьшается
                            if math.fabs(enemy[index]['y2'] - y) > math.fabs(enemy[index]['x2'] - x):
                                if x > 100:
                                    b.move_left()
                                else:
                                    b.move_down()

                            else:
                                if y > 50:
                                    b.move_up()
                                else:
                                    b.move_down()
                        elif enemy[index]['y2'] - enemy[index]['y1'] > 0 and math.fabs(enemy[index]['y1']-y) > math.fabs(enemy[index]['y2']-y):#враг движется вверх, расстояние уменьшается
                            if math.fabs(enemy[index]['y2'] - y) > math.fabs(enemy[index]['x2'] - x):
                                if y > 100:
                                    b.move_down()
                                else:
                                    b.move_right()

                            else:
                                if x < 900:
                                    b.move_right()
                                else:
                                    b.move_left()
                        elif enemy[index]['y2'] - enemy[index]['y1'] < 0 and math.fabs(enemy[index]['y1']-y) > math.fabs(enemy[index]['y2']-y):#враг движется вниз
                            if math.fabs(enemy[index]['y2'] - y) > math.fabs(enemy[index]['x2'] - x):
                                if y < 900:
                                    b.move_up()
                                else:
                                    b.move_left()

                            else:
                                if x > 50:
                                    b.move_left()
                                else:
                                    b.move_right()
                        elif enemy[index]['y2'] - enemy[index]['y1'] == 0 and math.fabs(enemy[index]['y2'] - y) > math.fabs(enemy[index]['x2'] - x) and y < 950:
                            b.move_up()
                        elif enemy[index]['y2'] - enemy[index]['y1'] == 0 and math.fabs(enemy[index]['y2'] - y) < math.fabs(enemy[index]['x2'] - x) and x < 950:
                            b.move_right()
                        elif enemy[index]['x2'] - enemy[index]['x1'] == 0 and math.fabs(enemy[index]['y2'] - y) > math.fabs(enemy[index]['x2'] - x) and y > 50:
                            b.move_down()
                        elif enemy[index]['x2'] - enemy[index]['x1'] == 0 and math.fabs(enemy[index]['y2'] - y) < math.fabs(enemy[index]['x2'] - x) and x > 50:
                            b.move_left()
                    else:
                        if math.fabs(enemy[index]['y2'] - y) > math.fabs(enemy[index]['x2'] - x):
                            print('9...')
                            if x < 50:
                                b.move_up()
                            if x > 950:
                                b.move_down()
                            if y > 950:
                                b.move_down()
                            if y < 50:
                                b.move_up()
                        else:
                            print('10...')
                            if x < 50:
                                b.move_right()
                            if x > 950:
                                b.move_left()
                            if y > 950:
                                b.move_right()
                            if y < 50:
                                b.move_left()

                    index = 0