const {Router} = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const config = require('config')
const {check, validationResult} = require('express-validator')
const User = require('../models/User')
const router = Router()

// /api/auth/register
router.post(
   '/register',
   //Создаем серверную валидацию
   [
      check('email', 'Некорректный email').isEmail(),
      check('password', 'Минимальная длина пароля 6 символов')
         .isLength({ min: 6 })
   ],
   async (request, response) => {
   try {
      const errors = validationResult(request) // Валидируем входяшие поля

      if (!errors.isEmpty()) {
         return response.status(400).json({
            errors: errors.array(),
            message: 'Некорректные данные при регистрации'
         })
      }

      //Регистрация пользователя
      const {email, password} = request.body // То, что мы отправляем с фронта

      const candidate = await User.findOne({
         email
      })

      if (candidate) {
         return response.status(400).json({ message: 'Такой пользователь уже существует'})
      }

      //Шифрование пароля с помощью библиотеки bcryptjs

      const hashedPassword = await bcrypt.hash(password, 12) // шифрование ассинхронное!
      const user = new User({
         email,
         password: hashedPassword
      })

      await user.save()
      response.status(201).json({ message: 'Пользователь создан'})

   }catch (e) {
      response.status(500).json({ message: 'Что-то пошло не так!'})
   }
})

// /api/auth/login
router.post(
   '/login',
   [
      check('email', 'Введите корректный email!').normalizeEmail().isEmail(),
      check('password', 'Введите пароль').exists()
   ],
   async (req, res) => {
      try {
         const errors = validationResult(req)

         if (!errors.isEmpty()) {
            return res.status(400).json({
               errors: errors.array(),
               message: 'Некорректные данные при входе'
            })
         }

         const {email, password} = req.body

         const user = await User.findOne({
            email
         })

         if (!user) {
            return res.status(400).json({ message: 'Пользователь не найден' })
         }

         const isMatch = await bcrypt.compare(password, user.password)

         if (!isMatch) {
            return res.status(400).json({ message: 'Неверный пароль, попробуйте снова'})
         }

         // Авторизация пользователя jsonwebtoken

         // создаем токен
         const token = jwt.sign(
            {
               userId: user.id,
               isAdmin: user.isAdmin,
            },
            config.get('jwtSecret'),
            {expiresIn: '1h'} //Время существования токена
         )

         // Отправляем ответ пользователю
         res.json({
            token, userId: user.id, isAdmin: user.isAdmin,
         })


      }catch (e) {
         res.status(500).json({ message: 'Что-то пошло не так!'})
      }

})

module.exports = router