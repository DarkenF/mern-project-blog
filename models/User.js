const {Schema, model, Types} = require('mongoose')

const schema = new Schema({ // Схема для пользователя
   email: {type: String, required: true, unique: true},
   password: {type: String, required: true},
   isAdmin: {type: Boolean, required: true, default: false},
   links: [{ type: Types.ObjectId, ref: 'Link' }]
})

module.exports = model('User', schema)