const { Router } = require('express');
const config = require('config');
const bcrypt = require('bcryptjs');
const { check, validationResult } = require('express-validator')
const User = require('../models/user');
const router = Router();
const token = require('jsonwebtoken');
// const { rawListeners } = require('../models/user');

// /api/auth/register
router.post('/register',
    //Express-validator check format, length, exists
    [
        check('email', 'Некорректный email').isEmail(),
        check('password', 'Минимальная длина пароля 6 символов').isLength({ min: 6 })
    ],
    //async function, 2 options from frontend: request and response 
    async (req, res) => {
        try {
            //validate errors from request (Express-validator)
            const errors = validationResult(req);
            if (!errors.isEmpty) {
                //return errors aray with message (error 400 status)
                return res.status(400).json({
                    errors: errors.array(),
                    message: 'Некорректные данные при регистрации'
                });
            }
            //request body (email and passord)
            const { email, password } = req.body;

            //uniqueness check, if our candidate not unique, we return error with 400 status 
            const candidate = await User.findOne({ email });
            if (candidate) {
                return res.status(400).json({ message: 'Такой пользователь существует' });
            }

            //bcrypt, allows us to hashed passowd. First option is pass, second - length 

            const hashedPassword = await bcrypt.hash(password, 12);

            //user is ready, now we create class instance and send email and hashed password
            const user = new User({ email, password: hashedPassword });
            //waiting for the user to be saved
            await user.save();

            //send message to frontend, status 201
            res.status(201).json({ message: 'Пользователь создан' });

        } catch (error) {
            res.status(500).json({ message: 'Что-то пошло не так, попробуйте снова' });
        }
    })

// /api/auth/login
router.post('/login',
    [
        //Express-validator check format, length, exists
        check('email', 'Введите корректный email').normalizeEmail().isEmail(),
        check('password', 'Введите пароль').exists(),
        check('password', 'Минимальная длина пароля 6 символов').isLength({ min: 6 })
    ],
    //async function, 2 options from frontend: request and response 
    async (req, res) => {
        try {
            //validate errors from request (Express-validator)
            const errors = validationResult(req);
            if (!errors.isEmpty) {
                //return errors aray with message (error 400 status)
                return res.status(400).json({
                    errors: errors.array(),
                    message: 'Некорректные данные при входе'
                });
            }

            //request body (email and passord)

            const { email, password } = req.body;

            //try find user in database, we use email like unique id 

            const user = await User.findOne({ email });

            //if user doesn't exits, we send error 400 with message 

            if (!user) {
                return res.status(400).json({ message: 'Данный пользователь не найден' });
            }

            //find match, password must match with password in database 

            const isMatch = await bcrypt.compare(password, user.password);

            //if user doesn't exits, we send error 400 with message 

            if (!isMatch) {
                return res.status(400).json({ message: 'Неверный пароль, попробуйте снова' });
            }

            //create token 
            const token = jwt.sign(
                { userId: user.id },
                config.get('jwtSecret'),
                { expiresin: '1h' }
            )

            res.json({ token, userId: user.id });

        } catch (error) {
            res.status(500).json({ message: 'Что-то пошло не так, попробуйте снова' });
        }
    })
module.exports = router;