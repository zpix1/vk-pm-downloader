#! /usr/bin/env python3

import argparse
import os
import asyncio
import random
from time import sleep
from bs4 import BeautifulSoup 
import requests
import aiohttp

parser = argparse.ArgumentParser(description='Скачать все вложения из файлов VK PM Downloader')
parser.add_argument('--wait', type=int, help='Задержка между отдельными запросами (в мс)', default=0)
sp = parser.add_subparsers()

file_p = sp.add_parser('file', help='Скачать у одного файла')
file_p.add_argument('infile', action='store', type=argparse.FileType('r'), help='Входной HTML файл (скачанный с помощью VK PM Downloader v>=1.3)')
file_p.add_argument('outfile', action='store', type=argparse.FileType('w'), help='Выходной файл с измененными ссылками')
file_p.add_argument('--download', choices=['photo', 'audio', 'all'], default='all', help='Выбор видов вложений для загрузки, по умолчанию качается все')
file_p.add_argument('--dir', help='Папка для вложений, по умолчанию создается автоматически')

dir_p = sp.add_parser('dir', help='Скачать для всей папки')
dir_p.add_argument('indir', help='Папка с диалогами')
dir_p.add_argument('outdir', help='Папка для вывода')
dir_p.add_argument('--download', choices=['photo', 'audio', 'all'], default='all', help='Выбор видов вложений для загрузки, по умолчанию качается все')

args = parser.parse_args()


NTRY = 5

async def download_to(path, url, session, redo=NTRY):
    if redo == 0:
        return
    try:
        async with session.get(url) as response:
            with open(path, 'wb') as f:  
                f.write(await response.read())
                sleep(args.wait / 1000)
    except Exception as e:
        print('Возникла ошибка при загрузке вложения ({}) (попытка {}) ({})'.format(path, NTRY + 1 -redo, e))
        sleep(1)
        await download_to(path, url, session, redo=redo-1)
    else:
        s = 'Вложение ({}) загружено'.format(path)
        if redo != NTRY:
            s += ' (с {} попытки)'.format(NTRY + 1 - redo)
        print(s)

async def download_all(tasks):
    async with aiohttp.ClientSession() as session:
        tasks = [asyncio.ensure_future(download_to(e[0], e[1], session)) for e in tasks]
        return await asyncio.gather(*tasks)

def download(directory, infile, outfile, download):
    # directory =

    html = infile.read()

    soup = BeautifulSoup(html, 'lxml')

    to_download = []
    if download == 'all':
        to_download = soup.find_all(class_='download_photo_type') + soup.find_all(class_='download_audio_message_type')
    elif download == 'audio':
        to_download = soup.find_all(class_='download_audio_message_type')
    elif download == 'photo':
        to_download = soup.find_all(class_='download_photo_type')

    if not os.path.exists(directory):
        print('Директория {} была создана'.format(directory))
        os.makedirs(directory)
    
    tasks = set()

    for e_i, e in enumerate(to_download):
        url = e.get
        if not e.has_attr('data-src'):
            print('Ссылка не найдена, скорее всего при загрузке HTML использовалась устаревшая версия VK PM Downloader')
            return False

        url = e['data-src']

        new_name = '{}'.format('_'.join(url.split('/')[-4:]))
        new_path = os.path.join(directory, new_name)
        if not os.path.exists(new_path) and not (new_path, url) in tasks:
            print('Загрузка вложения id={}'.format(e_i))
            tasks.add((new_path, url))
        elif (new_path, url) in tasks:
            print('Вложение ({}) повторяется, не загружаю'.format(new_path))
        else:
            print('Вложение ({}) уже было загружено'.format(new_path))
        if e.name == 'a':
            e['href'] = new_path
        elif e.name == 'audio':
           e['src'] = new_path
    
    outfile.write(str(soup))
    print('Ожидание загрузки вложений')

    loop = asyncio.get_event_loop()
    future = asyncio.ensure_future(download_all(list(tasks)))
    loop.run_until_complete(future)

    print('Все вложения загружены')

if 'indir' in args:
    if not os.path.exists(args.indir):
        print('Директория indir не обнаружена')
        exit(1)
    else:
        if not os.path.exists(args.outdir):
            print('Директория {} была создана'.format(args.outdir))
            os.makedirs(args.outdir)
    for f in os.listdir(args.indir):
        print('Файл {}'.format(f))
        if f.endswith('.html'):
            os.chdir(args.outdir)
            download('atts_' + f + '_dir', open(os.path.join('..',args.indir, f)), open(os.path.join(f), 'w'), args.download)
            os.chdir('..')
else:
    download(args.dir or 'atts_' + args.infile.name + '_dir', args.infile, args.outfile, args.download)
