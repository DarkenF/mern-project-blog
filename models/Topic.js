const {Schema, model, Types} = require('mongoose')

const schema = new Schema({ // Схема для пользователя
   title: { type: String, required: true, unique: true},
   description: [{type: Types.ObjectId, ref: 'Section'}],
})

module.exports = model('Topic', schema)