const express = require('express');
const passport = require('passport');
const UserModel = require('../../models/UserModel');
const middlewares = require('../middlewares');

const router = express.Router();

const redirectIfLoggedIn = (req, res, next) => {
  if (req.user) return res.redirect('/user/account');
  return next();
};

module.exports = () => {
  router.post(
    '/login',
    passport.authenticate('local', {
      successRedirect: '/',
      failureRedirect: '/users/login?error=true',
    }),
  );
  router.get('/login', redirectIfLoggedIn, (req, res) => res.render('users/login', { error: req.query.error }));

  router.get('/logout', (req, res) => {
    req.logout();
    return res.redirect('/');
  });

  router.get('/registration', redirectIfLoggedIn, (req, res) => res.render('users/registration', { success: req.query.success }));

  router.post('/registration', middlewares.upload.single('avatar'),  async (req, res, next) => {
    try {
      const { username, email, password } = req.body;
      const user = new UserModel({
        username,
        email,
        password,
      });
      const savedUser = await user.save();

      if (savedUser) return res.redirect('/users/registration?success=true');
      return next(new Error('Failed to save user'));
    } catch (error) {
      return next(error);
    }
  });

  router.get(
    '/account',
    (req, res, next) => {
      if (req.user) return next();
      return res.status(401).end();
    },
    (req, res) => res.render('users/account', { user: req.user }),
  );

  return router;
};
