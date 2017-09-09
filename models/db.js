/**
 * Created by Emperor on 2017/5/16 0016.
 */
var MongoClient = require('mongodb').MongoClient;
var setting=require('../setting.js');
function _connect(callback) {
    var url = setting.dburl;
    //连接数据库
    MongoClient.connect(url, function(err, db) {
        callback(err,db);
    })
}
exports.insertOne=function (collection,json,callback) {
    _connect(function (err,db) {
        db.collection(collection).insertOne(json,function (err,result) {
            callback(err,result);
            db.close();
        })
    })
}
exports.findDocuments=function (collection,json,C,D) {
    if (arguments.length == 3) {
        //那么参数C就是callback，参数D没有传。
        var callback = C;
        var skippage = 0;
        //数目限制
        var limitpage = 0;
    } else if (arguments.length == 4) {
        var callback = D;
        var args = C;
        //应该省略的条数
        var skippage = args.pagemount * args.page||0;
        //数目限制
        var limitpage = args.pagemount||0;
        var sort=args.sort||{};
    } else {
        throw new Error("find函数的参数个数，必须是3个，或者4个。");
        return;
    }
    _connect(function (err,db) {
            db.collection(collection).find(json).limit(limitpage).skip(skippage).sort(sort).toArray(function(err, docs) {
                //console.log("Found the following records");
               // console.log(docs)
                callback(err,docs);
            });
    })
}
exports.delete=function (collection,json,callback) {
    _connect(function (err,db) {
        db.collection(collection).deleteMany(json,function(err, result) {
            console.log("Removed the document with the field a equal to 3");
            callback(err,result);
        });
    })
    
};
exports.update=function (collection,json1,json2,callback) {
    _connect(function (err,db) {
        // Update document where a is 2, set b equal to 1
        db.collection(collection).updateOne(json1
            , { $set: json2}, function(err, result) {
                console.log("Updated the document with the field a equal to 2");
                callback(err,result);
            });
    })
    
};
exports.getAllCount = function (collectionName,callback) {
    _connect(function (err, db) {
        db.collection(collectionName).count({}).then(function(count) {
            callback(count);
            db.close();
        });
    })
};
//创建索引函数
init();
function init() {
    _connect(function (err,db) {
        if(err)
        {
            console.log(err);
            return;
        }
        db.collection('users').createIndex(
            { "username": 1 },
            null,
            function(err, results) {
                if(err)
                {
                    console.log(err);
                    return;
                }
                console.log("创建索引成功")
            }
        );
    })    
}