const {Router} = require('express');
const bcrypt = require('bcryptjs');
const config = require('config');
const jwt = require('jsonwebtoken');
const {check, validationResult} = require('express-validator');
const User = require('../models/User');
const router = Router();

// /api/auth/register
router.post(
    '/register', //эндпоинт
    [ //массив миддлВэеров для валидации посредством express-validator
        check('email', 'Некорректный email').isEmail(), //проверка емейла. 1 аргумент - название проверяемого поля, 2 арг. выводимая ошибка
                                                        //функция .isEmail() - проверяет, является ли входящее поле емейлом
        check('password', 'Минимальная длина пароля 6 символов').isLength({min: 6}) //проверка длины пароля
    ],
    async (req, res) => { //функция регистрации, тут пропишем всю логику обработки регистрационной страницы
    try { //асинхронщина, оборачиваем в try .. catch

        const errors = validationResult(req); //присваиваем константе результат валидаций

        if (!errors.isEmpty()) { // если констнанта errors не пустая - возвращаем на фронтенд ошибки и сообщение. isEmpty() - метод express-validators
            return res.status(400).json({
                errors: errors.array(), //.array() - возвращает массив ошибок
                message: 'Некорректные данные при регистрации'
            })
        }

        const {email, password} = req.body; //получаем поля email и password из объекта req.body.
                                            // эти поля мы будем отправлять из фронтенда
        const candidate = await User.findOne({email}); // функция .findOne ищет в коллекции пользователя с email = email полученному из фронта
                                                       // запись .findOne({email}) эквивалентна записи .findOne({email: email})

        if (candidate) { //если candidate не пустой, то возвращаем ошибку. return для того чтобы дальше скрипт не шел
            return res.status(400).json({message: 'Пользователь с таким email уже существует'})
        } // .json - это метод экспресса, выводит сообщение об ошибке

        const hashedPassword = await bcrypt.hash(password, 12); //хешируем пароль с помощью библиотеки bcrypt, 12 - сложность шифрования?
                                                                //bcrypt.hash - асинхронная операция, поэтому добавляем await
        const user = new User({email, password: hashedPassword}); //создаем пользователя с помощью модели User

        await user.save(); //ждем пока новый user сохранится в БД

        res.status(201).json({message: 'Пользователь создан'})// после сохранения пользователя выводим сообщение

    } catch (e) {
        res.status(500).json({message: 'Что-то пошло не так, попробуйте снова'}) //посмотреть коды ошибок
    }
});
// /api/auth/login
router.post(
    '/login', //эндпоинт логина
    [
        check('email', 'Введите корректный email').normalizeEmail().isEmail(),
        check('password', 'Введите пароль').exists() //проверяем, существует ли пароль в БД?
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                return res.status(400).json({
                    errors: errors.array(),
                    message: 'Некорректные данные при входе в систему'
                })
            }

            const {email, password} = req.body;

            const user = await User.findOne({email}); //ищем пользователя в БД по email

            if (!user) {
                return res.status(400).json({message: 'Пользователь не найден'});
            }

            const isMatch = await bcrypt.compare(password, user.password); // сравниваем с помощью метода bcrypt.compare()
                                                                           // входящий пароль с паролем из БД
            if (!isMatch) { //если пароли не совпадают - выводим ошибку
                return res.status(400).json({message: 'Неверный пароль, попробуйте снова'})
            }

            const token = jwt.sign( //создаем Веб токен с помощью библиотеки jsonwebtoken, в метод .sigh передаем 3 параметра:
                {userId: user.id},  // 1. Id пользователя в БД (Types.ObjectId). По этому Id мы находим все остальные данные
                config.get('jwtSecret'), // 2. Секретный ключ (любая секретная! фраза, создаем в файле default.json)
                {expiresIn: '1h'} // 3. время действия токена: 1h - один час
            );

            res.json({token, userId: user.id}) //по умолчанию статус 200, поэтому тут не пишем


        } catch (e) {
            res.status(500).json({message: 'Что-то пошло не так, попробуйте снова'}) //посмотреть коды ошибок
        }

});

module.exports = router; // синтаксис экспорта в nodeJS