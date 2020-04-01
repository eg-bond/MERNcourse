const express = require('express');
const config = require('config');
const mongoose = require('mongoose');

const app = express(); //инстанс экспресса



const PORT = config.get('port') || 5000; //выдергиваем порт из файла default.json либо присваиваем значение 5000 если config.get('port') = undefined

async function start() { //функция для подключения к базе данных
    try {
        await mongoose.connect(config.get('mongoUri'), { //подключаемся к БД
            useNewUrlParser: true, //эти параметры нужны для нормального подключения
            useUnifiedTopology: true,
            useCreateIndex: true
        })
    } catch (e) {
        console.log('Server Error:', e.message);
        process.exit(1); //глобальная объект nodeJS который завершает процесс
    }
}

start();

app.listen(PORT, () => console.log(`App has been started on port ${PORT}...`));