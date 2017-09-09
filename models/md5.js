/**
 * Created by Emperor on 2017/6/4 0004.
 */
var crypto=require('crypto');
module.exports=function (mingma) {
    var md5=crypto.createHash('md5');
    var password=md5.update(mingma).digest('base64');
    return password;
}