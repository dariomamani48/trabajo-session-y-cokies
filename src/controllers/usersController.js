const { categories, users, writeUsersJSON } = require('../data/dataBase')
const { validationResult } = require('express-validator')
const bcrypt = require('bcryptjs')

module.exports = {
    /* Register form */
    register: (req, res) => {
        res.render('register', {
            categories,
            session: req.session
        })
    },
    /* Login form */
    login: (req, res) => {
        res.render('login', {
            categories,
            session: req.session
    })
    },
    /* User profile */
    profile: (req, res) =>{
        let user = users.find(user=> user.id === req.session.user.id);
        res.render('userProfile', {
            categories,
            session: req.session,
            user
        })
    },
    processLogin: (req, res) => {
        let errors = validationResult(req)
        
        if(errors.isEmpty()){
            let user = users.find(user => user.email === req.body.email);
            req.session.user = {
             id: user.id,
             userName: user.name + " " + user.last_name,
             email: user.email,
             avatar: user.avatar,
             rol: user.rol
         }
         /** creamos la cookie */
         if(req.body.remember){
             res.cookie('cookieDali', req.session.user, {maxAge: 1000*60})
         }
         /*------------------*/
         /** guardamos el usuario en locals */
         res.locals.user = req.session.user
         /**redireccionamos al home si todo esta ok */
         res.redirect('/')
         
         /**sino -> */
        }else{
            res.render('login', {
                categories,
                errors: errors.mapped(),
                session: req.session
            })
        }        

    },
    processRegister: (req, res) => {
        let errors = validationResult(req);

        if (errors.isEmpty()) {

            let lastId = 0;
        
            users.forEach(user => {
                if(user.id > lastId){
                    lastId = user.id
                }
            });
    
            let { 
                name, 
                last_name,
                email,
                pass1
              } = req.body;
            
            let newUser = {
                id: lastId + 1,
                name,
                last_name,
                email,
                pass: bcrypt.hashSync(pass1, 10),
                rol: "ROL_USER",
                avatar: req.file ? req.file.fileName : "default-image.png"
            };
    
            users.push(newUser);
    
            writeUsersJSON(users);
    
            res.redirect('/users/login')

        } else {
            res.render('register', {
                categories, 
                errors : errors.mapped(),
                old : req.body,
                session: req.session
            })
        }
    },
    logout: (req, res) => {
        /**destruye la sesion iniciada */
     req.session.destroy();
     /** finalizamos el tiempo de la cookie */
     if(req.cookies.cookieDali){
         res.cookie('cookieDali', '', {maxAge: -1})
     }
     /*redireccionamos una vez que se ejecuta el logout */
     res.redirect('/');

    }
}