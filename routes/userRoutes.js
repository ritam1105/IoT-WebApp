const express = require('express');

const userRoutes=express.Router();
//local module
const userController=require('../controllers/userControler');

userRoutes.get('/',userController.getHome);
userRoutes.get('/dashboard',userController.getDashboard);
userRoutes.get('/login',userController.getLogin);
userRoutes.get('/signup',userController.getSignIn);

// Form submissions
userRoutes.post('/login', userController.postLogin);
userRoutes.post('/signup', userController.postSignup);




module.exports=userRoutes;