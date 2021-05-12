const {Schema, model, Types} = require('mongoose')

const schema = new Schema({ // Схема для пользователя
   subTitle: { type: String, required: true},
   description: { type: String, required: true},
   ownerTopic: {type: Types.ObjectId, ref: 'Topic'}
})

module.exports = model('Section', schema)