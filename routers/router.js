/**
 * Created by Emperor on 2017/6/6 0006.
 */
//显示首页
var formidable=require('formidable');
var db=require('../models/db.js');
var md5=require('../models/md5.js');
var path=require('path');
var fs=require('fs');
var gm=require('gm');
exports.showIndex=function (req,res) {
    //如果用户已经登录了检索数据库查头像
    if(req.session.login==1)
    {
        db.findDocuments('users',{"username":req.session.username},function (err,docs) {
            var avatar=docs[0].avatar||"moren.jpg";
            db.findDocuments('post',{},function (err,result2) {
                res.render('index',{
                    "login":req.session.login,
                    "username":req.session.username,
                    "avatar":avatar,
                    "shuoshuo":result2
                });                
            })

        })
    }
    else
    {
        db.findDocuments('post',{},function (err,result2) {
            res.render('index',{
                "login":req.session.login,
                "username":req.session.username,
                "avatar":"moren.jpg",
                "shuoshuo":result2
            });
        })
    }
}
//注册页面
exports.showRegist=function (req,res) {
    res.render('regist');
}
exports.doRegist=function (req,res,next) {
    var form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files) {
        //获取提交的用户名和密码
        var username=fields.username;
        var password=fields.password;
        //对提交的用户名进行判断
        password=md5(md5(password)+2);
        db.findDocuments('users',{"username":username},function (err,docs) {
            if(err)
            {
                console.log(err);
                res.send("-3");//服务器错误
                return;
            }
            if(docs.length!=0)
            {
                res.send("-1");//用户名重复
                return;
            }
            //进行插入
           db.insertOne('users',{
               "username":username,
               "password":password,
               "avatar":"moren.jpg"
           },function (err,result) {
               if(err)
               {
                   res.send("-3")//服务器错误
                   return;
               }
               req.session.login=1;
               req.session.username=username;
               res.send("1");
           })
        })
    });
};
exports.showLogin=function (req,res,next) {
    res.render('login');
};
exports.doLogin=function (req,res,next) {
    var form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files) {
        //获取提交的用户名和密码
        var username=fields.username;
        var password=fields.password;
        //对提交的用户名进行判断
        password=md5(md5(password)+2);
        db.findDocuments('users',{"username":username},function (err,docs) {
            if(err)
            {
                res.send("-3");//服务器错误
                return ;
            }
            if(docs.length==0)
            {
                res.send("-2");//用户不存在
                return ;
            }
            if(docs[0].password!=password)
            {
                res.send("-1")//密码不匹配
                return;
            }
            req.session.login=1;
            req.session.username=username;
            res.send("1");
            
        })
    });
};
//更改头像的时候用户肯定是在登录的情况下
exports.setavatar=function (req,res,next) {
    //console.log(req.session.login);
    if(req.session.login!=1)
    {
        res.end("非法闯入");
        return;
    }
    res.render('setavatar',{
        "login":req.session.login,
        "username":req.session.username
    });
    
};
exports.doavatar=function (req,res,next) {
    var form = new formidable.IncomingForm();
    form.uploadDir = path.normalize(__dirname + "/../avatar");
    form.parse(req, function (err, fields, files) {
        console.log(files);
        var oldpath = files.touxiang.path;
        var newpath = path.normalize(__dirname + "/../avatar") + "/" + req.session.username + ".jpg";
        fs.rename(oldpath, newpath, function (err) {
            if (err) {
                res.send("失败");
                return;
            }
            req.session.avatar = req.session.username + ".jpg";
            //跳转到切的业务
            res.redirect("/cut");
        });
    });
}
exports.showcut=function (req,res,next) {
    res.render('cut',{
        "avatar":req.session.avatar
    });
};
exports.docut=function (req,res,next) {
    var filename = req.session.avatar;
    var w = req.query.w;
    var h = req.query.h;
    var x = req.query.x;
    var y = req.query.y;

    gm("./avatar/"+filename)
        .crop(w,h,x,y)
        .resize(100,100,"!")
        .write("./avatar/"+filename,function(err){
            if(err)
            {
                res.send("-1");
            }
            db.update('users',{username:req.session.username},{"avatar":req.session.avatar},function () {
                res.send("1");
            })
        });
};
exports.dopost=function (req,res,next) {
    var form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files) {
        //获取提交的用户名和密码
        var username=req.session.username;
        var content=fields.content;
        db.insertOne('post',{
                "username":username,
                "datetime":new Date(),
                "content":content
            },function (err,result) {
                if(err)
                {
                    res.send("-3")//服务器错误
                    return;
                }
                res.send("1");
            })
        })
};