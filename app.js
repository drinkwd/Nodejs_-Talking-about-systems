var express=require('express');
var app=express();
var router=require('./routers/router.js');
var session=require('express-session');
//设置session
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true
}))
//设置模板引擎
app.set('view engine','ejs');
//设置静态文件
app.use(express.static('./public'));
app.use('/avatar',express.static('./avatar'));
//设置路由表
app.get('/',router.showIndex);
app.get('/regist',router.showRegist);
app.post('/doregist',router.doRegist);
app.get('/login',router.showLogin);
app.post('/dologin',router.doLogin);
app.get('/setavatar',router.setavatar);
app.post('/doavatar',router.doavatar);
app.get('/cut',router.showcut);
app.get('/docut',router.docut);
app.post('/post',router.dopost);
app.listen(3000);