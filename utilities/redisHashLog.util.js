const redis = require('redis');
require('dotenv').config();
const client = redis.createClient({ host: process.env.REDISIP, port: process.env.REDISPORT, db: 0 });
client.on('connect', function () {
});
client.on('error', function (err) {
});
module.exports.setHash = (serviceStatus) => {
    let count = 0;
    let isReject = false;
    return new Promise((resolve, reject) => {
        serviceStatus.forEach(hashObj => {
           client.hmset(hashObj.hashName, hashObj.hashData, (err, success) => {
               count++;
               if (count === serviceStatus.length){
                    if(isReject){
                        reject("err");
                    }else{
                        resolve("success");
                    }
               }
               if (err) {
                   sReject = true;
               }
           });
        })
    });
}
module.exports.setLog = (logObj) => {
    return new Promise((resolve, reject) => {
        client.lpush(logObj.listName, JSON.stringify(logObj.listData), (err, success) => {
            if (success) {
                client.ltrim(logObj.listName, 0, 200, (err2, success2) => {
                    if (success2) {
                        resolve(success2);
                    } else {
                        reject(err2);
                    }
                });
            } else {
                reject(err);
            }
        });
    });
}