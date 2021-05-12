const express = require('express')
const config = require('config')
const path = require('path')
const mongoose = require('mongoose')

const app = express()

app.use(express.json({ extended: true }))

app.use('/api/auth/', require('./routes/auth_routes')) // делаем роут на авторизацию
app.use('/api/document/', require('./routes/document_routes')) // роут на обработку ссылок

if (process.env.NODE_ENV === 'production') {
   app.use('/', express.static(path.join(__dirname, 'client', 'build')))

   app.get('*', (req, res)=> {
      res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'))
   })
}

const PORT = config.get('port') || 5000;

(async function start() {
   try {
      await mongoose.connect(config.get('mongoUrl'), {
         useNewUrlParser: true,
         useUnifiedTopology: true,
         useCreateIndex: true,
         useFindAndModify: false,
      })
      app.listen(PORT, () => console.log(`App has been started on port ${PORT}...`))
   } catch (e) {
      console.log('Server Error', e.message)
      process.exit(1); // Глобальный объект node.js
   }
})()



