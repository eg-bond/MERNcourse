const {Schema, model, Types} = require('mongoose');

// это сущность, которая будет работать с пользователями
// любые другие сущьности также создаются в папке models

const schema = new Schema({ //в схеме описываем все данные, которые должны присутствовать в коллекции User
    email: {type: String, required: true, unique: true}, //unique: true - элемент должен быть уникальным
    password: {type: String, required: true}, //required: true - элемент должен обязательно присутствовать
    links: [{type: Types.ObjectId, ref: 'Link'}] // тип Types.ObjectId - берется из mongoose, является ссылкой на пользователя в БД
}); //ref: 'Link' - название коллекции, к которой мы привязываемся (модель Link будет создана позже)

module.exports = model('User', schema); //экспортируемый результат работы - модель mongoDB, 'User' - название модели