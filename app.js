const express = require("express"), bodyParser = require('body-parser');
require('dotenv').config()
const requestGet = require("./utilities/getRequest.util");
const requestPost = require("./utilities/postRequest.util");
const containerInfo = require("./utilities/getContainerStat.util");
const mongoose = require("./config/mongoConnnect");
const Mongo = require("./models/test.model");
const app = express();
var http = require("http");
const db = require('./config/sqlConnect');
const sensor = require('./models/sensor.model');
const udaqSensors = require('./models/udaqSensor.model');
const WebSocket = require('ws');
const osu = require('node-os-utils')
const redisStatus = require('./utilities/redisHashLog.utilsadasdsa');

let urlVti = "http://" + process.env.VTI_PORT + "/";
let urlUdaq = "http://" + process.env.UDAQ_PORT + "/";
let urlModbus = "http://" + process.env.MODBUS_PORT + "/";
let urlBeckhoff = "http://" + process.env.BECKHOFF_PORT + "/";
let urlMoxaRest = "http://" + process.env.MOXA_PORT + "/";

let vtiSensor = [];
let ionSensor = [];
let udaqSensor = [];
let beckhoffSensor = [];
let moxaRestSensor = [];

let containerStat = {};
let containerStatus = {};
let mongoFlag = 0;

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
let ws;
function connect() {
    ws = new WebSocket('ws://' + process.env.SOCKET_SERVER);
    ws.onopen = function () {

    };
    ws.onmessage = function (e) { };
    ws.onclose = function (e) {
        setTimeout(function () {
            connect();
        }, 5000);
    };
    ws.onerror = function (err) {
        ws.close();
    };
}
connect()
let runningContainer = {
    hostpc: {
        name: 'hostpc',
        running: true,
        memory: "null",
        uptime: "null",
        cpu: "null",
        storage: "null",
        date: new Date() - (new Date().getTimezoneOffset() * 60 * 1000),

    },
    manager: {
        name: 'manager',
        running: true,
        memory: "null",
        uptime: "null",
        cpu: "null",
        storage: "null",
        date: new Date() - (new Date().getTimezoneOffset() * 60 * 1000),
        runningTest: []
    },
    vti: {
        name: 'vti',
        running: true,
        memory: "null",
        uptime: "null",
        cpu: "null",
        storage: "null",
        date: new Date() - (new Date().getTimezoneOffset() * 60 * 1000),
        runningTest: []
    },
    modbus: {
        name: 'modbus',
        running: true,
        memory: "null",
        uptime: "null",
        cpu: "null",
        storage: "null",
        date: new Date() - (new Date().getTimezoneOffset() * 60 * 1000),
        runningTest: []
    },
    udaq: {
        name: 'udaq',
        running: true,
        memory: "null",
        uptime: "null",
        cpu: "null",
        storage: "null",
        date: new Date() - (new Date().getTimezoneOffset() * 60 * 1000),
        runningTest: []
    },
    beckhoffnode: {
        name: 'beckhoffnode',
        running: true,
        memory: "null",
        uptime: "null",
        cpu: "null",
        storage: "null",
        date: new Date() - (new Date().getTimezoneOffset() * 60 * 1000),
        runningTest: []
    },
    moxarest: {
        name: 'moxarest',
        running: true,
        memory: "null",
        uptime: "null",
        cpu: "null",
        storage: "null",
        date: new Date() - (new Date().getTimezoneOffset() * 60 * 1000),
        runningTest: []
    },
    beckhoff: {
        name: 'beckhoffPython',
        running: true,
        memory: "null",
        uptime: "null",
        cpu: "null",
        storage: "null",
        date: new Date() - (new Date().getTimezoneOffset() * 60 * 1000)
    },
    redis2: {
        name: 'redis',
        running: true,
        memory: "null",
        uptime: "null",
        cpu: "null",
        storage: "null",
        date: new Date() - (new Date().getTimezoneOffset() * 60 * 1000)
    },
    mongo: {
        name: 'mongo',
        running: true,
        memory: "null",
        uptime: "null",
        cpu: "null",
        storage: "null",
        date: new Date() - (new Date().getTimezoneOffset() * 60 * 1000)
    },
    mssql: {
        name: 'mssql',
        running: true,
        memory: "null",
        uptime: "null",
        cpu: "null",
        storage: "null",
        date: new Date() - (new Date().getTimezoneOffset() * 60 * 1000)
    }
}
db.authenticate().then(() => {
}).catch(err => {
})
const init = () => {
    sensor.findAll({
    }).then(sensor => {
        sensor.forEach(item => {
            if (item.dataValues.connectionType === "VISA") {
                vtiSensor.push(item.dataValues.sensorId)
            } else if (item.dataValues.hardwareType === "ION") {
                ionSensor.push(item.dataValues.sensorId)
            } else if (item.dataValues.connectionType === "beckhoffAms") {
                beckhoffSensor.push(item.dataValues.sensorId)
            } else if (item.dataValues.connectionType === "MoxaRest") {
                moxaRestSensor.push(item.dataValues.sensorId)
            }
        })
    })
    udaqSensors.findAll({
        attributes: ['udaqSensorId']
    }).then(items => {
        items.forEach(item => {
            udaqSensor.push(item.dataValues.udaqSensorId)
        })
    })
    Mongo.find({}, function (err, items) {
        if (!err && items.length === 0) {
            alarmSend(101);
        }
    })
}

//////


app.get("/dene", (req, res) => {
   res.status(200).send({message: 'Birinci version'});
})



////////////

app.post("/", (req, res) => {
    startTest(req.body).then(startTestRes => {
        res.status(200).send(true);
    }).catch(e => {
        res.status(400).send(false);
    })

})
app.post("/stop", (req, res) => {
    try {
        stopTest(req.body).then(success => {
            res.status(200).send({ message: "Secilen Testler Durdu !!!" })
        }).catch(e => {
            res.status(400).send({ message: "Request Parse edilemedi !!!" })
        })
    } catch (error) {
        res.status(400).send({ message: error })
    }
})
app.post("/read", (req, res) => {
    try {
        readSensor(req.body).then(datas => {
            res.status(200).send(datas)
        }).catch(e => {
            res.status(400).send({ message: "Request Parse edilemedi !!!" })
        })
    } catch (error) {
        res.status(400).send({ message: error })
    }

})
app.post("/readBeckhoff", (req, res) => {
    try {
        requestPost(urlBeckhoff + 'readWithControllerId', JSON.stringify(req.body)).then(data => {
            if (data === "Olmayan Id") {
                res.status(400).send({ message: "Hatali Sorgu, parametreleri kontrol et" })
            } else {
                res.status(200).send(data)
            }
        }).catch(err => {
            res.status(400).send({ message: err })
        })
    } catch (error) {
        res.status(400).send({ message: error })
    }

})
app.post("/calibrationRead", (req, res) => {
    try {
        calibrationReadSensor(req.body).then(datas => {
            res.status(200).send(datas)
        }).catch(e => {
            res.status(400).send({ message: e })
        })
    } catch (error) {
        res.status(400).send({ message: error })
    }

})
app.post("/incidentResolve", (req, res) => {
    try {
        requestPost(urlBeckhoff + 'incidentResolve', JSON.stringify(req.body)).then(data => {
            res.status(200).send({ message: data })
        }).catch(err => {
            res.status(400).send({ message: err })
        })
    } catch (error) {
        res.status(400).send({ message: error })
    }

})
app.post("/iniCheck", (req, res) => {
    try {
        let reqUdaq = {
            sensors: []
        }
        req.body.sensors.forEach((sensor) => {
            let isUdaq = udaqSensor.findIndex(object => object === sensor)
            if (isUdaq !== -1) {
                reqUdaq.sensors.push({
                    sensorId: sensor
                })
            }
        })
        let send = {}
        requestPost(urlUdaq + 'read', JSON.stringify(reqUdaq)).then(item => {
            if (item !== "Olmayan Id") {
                send.ini = item
            }
            res.status(200).send(send)
        }).catch(e => {
            res.status(400).send({ message: e })
        })
    } catch (error) {
        res.status(500).send(error)
    }
})
app.post("/readStatus", (req, res) => {
    try {
        requestPost(urlBeckhoff + 'readStatus', JSON.stringify(req.body)).then(data => {
            if (data === "Olmayan Id") {
                res.status(400).send({ message: "Hatali Sorgu, varName || value kontrol et" })
            } else {
                res.status(200).send(data)
            }
        }).catch(err => {
            res.status(400).send({ message: "Request Parse edilemedi !!!" })
        })
    } catch (error) {
        res.status(400).send({ message: error })
    }

})
app.post("/roomControlSet", (req, res) => {
    try {
        requestPost(urlBeckhoff + 'write', JSON.stringify(req.body)).then(data => {
            if (data === "Olmayan Id") {
                res.status(400).send({ message: "Hatali Sorgu, varName || value kontrol et" })
            } else {
                res.status(200).send(data)
            }
        }).catch(err => {
            res.status(400).send({ message: "Request Parse edilemedi !!!" })
        })
    } catch (error) {
        res.status(400).send({ message: error })
    }

})
app.post('/restartAllTest', (req, res) => {
    Mongo.remove({}, () => { });
    requestGet(urlModbus + "stopAllTest");
    requestGet(urlVti + "stopAllTest");
    requestGet(urlUdaq + "stopAllTest");
    requestGet(urlBeckhoff + "stopAllTest");
    requestGet(urlMoxaRest + "stopAllTest");
    let prmsArr = []
    req.body.testArr.forEach(test => {
        prmsArr.push(startTest(test));
    })
    Promise.all(prmsArr).then(result => {
        res.status(200).send({ message: "testler yeniden başladi" });
    }).catch((err) => {
        res.status(400).send({ message: "testler başlatilamadi" });
    });

});
app.post('/reInitAll', (req, res) => {
    reInitAll().then(data => {
        res.status(200).send({
            message: "Tüm Bufferlar Guncellendi"
        })
    }).catch(err => {
        res.status(400).send({
            message: "Bufferlar Güncellenemedi"
        })
    });
});
app.post('/reInitMoxaRest', (req, res) => {
    reInitMoxaRest().then(data => {
        res.status(200).send({
            message: "MoxaRest Buffer Guncellendi"
        })
    }).catch(err => {
        res.status(400).send({
            message: "MoxaRest Buffer Güncellenemedi"
        })
    });
});
app.post('/reInitBeckhoff', (req, res) => {
    reInitBeckhoff().then(data => {
        res.status(200).send({
            message: "Beckhoff Buffer Guncellendi"
        })
    }).catch(err => {
        res.status(400).send({
            message: "Beckhoff Buffer Güncellenemedi"
        })
    });
});
app.post('/reInitModbus', (req, res) => {
    reInitModbus().then(data => {
        res.status(200).send({
            message: "Modbus Buffer Guncellendi"
        })
    }).catch(err => {
        res.status(400).send({
            message: "Modbus Buffer Güncellenemedi"
        })
    });
});
app.post('/reInitUdaq', (req, res) => {
    reInitUdaq().then(data => {
        res.status(200).send({
            message: "Udaq Buffer Guncellendi"
        })
    }).catch(err => {
        res.status(400).send({
            message: "Udaq Buffer Güncellenemedi"
        })
    });
});
app.post('/reInitVti', (req, res) => {
    reInitVti().then(data => {
        res.status(200).send({
            message: "Vti Buffer Guncellendi"
        })
    }).catch(err => {
        res.status(400).send({
            message: "Vti Buffer Güncellenemedi"
        })
    });
});
app.get("/getSensorBuffer", (req, res) => {
    let sensors = {
        vtiSensor,
        ionSensor,
        udaqSensor,
        beckhoffSensor,
        moxaRestSensor
    }
    res.status(200).send(sensors);
})
app.get("/getContainerStatus", (req, res) => {
    res.status(200).send(containerStatus);
})
app.get("/getContainerStat", (req, res) => {
    res.status(200).send(containerStat);
})
app.get('/stopAllTest', (req, res) => {
    Mongo.remove({}, () => { });
    requestGet(urlModbus + "stopAllTest");
    requestGet(urlVti + "stopAllTest");
    requestGet(urlUdaq + "stopAllTest");
    requestGet(urlBeckhoff + "stopAllTest");
    requestGet(urlMoxaRest + "stopAllTest");
    res.status(200).send({ message: "Testler durdu" })
});
app.get('/runningContainer', (req, res) => {
    res.status(200).send(runningContainer);
});
wss.on('connection', function connection(ws) {
    ws.on('message', function incoming(data) {
        socketMsgParse(data);
    });
});
function reInitAll() {
    return new Promise((resolve, reject) => {
        let prmsArr = [];
        prmsArr.push(reInitVti());
        prmsArr.push(reInitUdaq());
        prmsArr.push(reInitModbus());
        prmsArr.push(reInitMoxaRest());
        prmsArr.push(reInitBeckhoff());
        Promise.all(prmsArr).then(result => {
            resolve("Success")
        }).catch(err => {
            reject("error")
        });
    });
}
function reInitVti() {
    return new Promise((resolve, reject) => {
        requestPost(urlVti + 'reInit', JSON.stringify({})).then(data => {
            resolve();
        }).catch(err => {
            reject();
        });
    });
}
function reInitUdaq() {
    return new Promise((resolve, reject) => {
        requestPost(urlUdaq + 'reInit', JSON.stringify({})).then(data => {
            resolve();
        }).catch(err => {
            reject();
        });
    });
}
function reInitModbus() {
    return new Promise((resolve, reject) => {
        requestPost(urlModbus + 'reInit', JSON.stringify({})).then(data => {
            resolve();
        }).catch(err => {
            reject();
        });
    });
}
function reInitMoxaRest() {
    return new Promise((resolve, reject) => {
        requestPost(urlMoxaRest + 'reInit', JSON.stringify({})).then(data => {
            resolve();
        }).catch(err => {
            reject();
        });
    });
}
function reInitBeckhoff() {
    return new Promise((resolve, reject) => {
        requestPost(urlBeckhoff + 'reInit', JSON.stringify({})).then(data => {
            resolve();
        }).catch(err => {
            reject();
        });
    });
}
function moxaRestRestart() {
    Mongo.find({ protocol: "moxaRest" }, { 'protocol': 1, 'testId': 1, 'body': 1, '_id': 0 }, function (err, items) {
        for (var i = 0; i < items.length; i += 10) {
            let sliceTestArr = items.slice(i, i + 10);
            requestPost(urlMoxaRest + 'startMultiTest', JSON.stringify(sliceTestArr));
        }
    })
}
function vtiRestart() {
    Mongo.find({ protocol: "vti" }, { 'protocol': 1, 'testId': 1, 'body': 1, '_id': 0 }, function (err, items) {
        for (var i = 0; i < items.length; i += 10) {
            let sliceTestArr = items.slice(i, i + 10);
            requestPost(urlVti + 'startMultiTest', JSON.stringify(sliceTestArr));
        }
    })
}
function udaqRestart() {
    Mongo.find({ protocol: "udaq" }, { 'protocol': 1, 'testId': 1, 'body': 1, '_id': 0 }, function (err, items) {
        for (var i = 0; i < items.length; i += 10) {
            let sliceTestArr = items.slice(i, i + 10);
            requestPost(urlUdaq + 'startMultiTest', JSON.stringify(sliceTestArr));
        }
    })
}
function modbusRestart() {
    Mongo.find({ protocol: "modbus" }, { 'protocol': 1, 'testId': 1, 'body': 1, '_id': 0 }, function (err, items) {
        for (var i = 0; i < items.length; i += 10) {
            let sliceTestArr = items.slice(i, i + 10);
            requestPost(urlModbus + 'startMultiTest', JSON.stringify(sliceTestArr));
        }
    })
}
function beckhoffRestart() {
    Mongo.find({ protocol: "beckhoff" }, { 'protocol': 1, 'testId': 1, 'body': 1, '_id': 0 }, function (err, items) {
        for (var i = 0; i < items.length; i += 10) {
            let sliceTestArr = items.slice(i, i + 10);
            requestPost(urlBeckhoff + 'startMultiTest', JSON.stringify(sliceTestArr));
        }
    })
}
function socketMsgParse(message) {
    switch (message) {
        case "modbus":
            modbusRestart();
            break;
        case "vti":
            vtiRestart();
            break;
        case "udaq":
            udaqRestart();
            break;
        case "beckhoffnode":
            beckhoffRestart();
            break;
        case "moxarest":
            moxaRestRestart();
            break;
        default:
            let parseMsg = JSON.parse(message);
            runningContainer[parseMsg.device].runningTest = parseMsg.runningTests;
            runningContainer[parseMsg.device].date = new Date() - (new Date().getTimezoneOffset() * 60 * 1000);
            runningContainer[parseMsg.device].running = true;
            break;
    }
}
function checkConteinerDown() {
    setInterval(() => {
        let code = 0
        let vtiTime = differenceTime(runningContainer.vti.date);
        let modbusTime = differenceTime(runningContainer.modbus.date);
        let udaqTime = differenceTime(runningContainer.udaq.date);
        let beckhoffnodeTime = differenceTime(runningContainer.beckhoffnode.date);
        let moxaRestTime = differenceTime(runningContainer.moxarest.date);
        let beckhoffTime = differenceTime(runningContainer.beckhoff.date);
        let redis2Time = differenceTime(runningContainer.redis2.date);
        if (beckhoffnodeTime > 20) {
            runningContainer.beckhoffnode.running = false;
            alarmSend(400);
            code = 1;
        }
        if (moxaRestTime > 20) {
            runningContainer.moxarest.running = false;
            alarmSend(600);
            code = 1;
        }
        if (udaqTime > 20) {
            runningContainer.udaq.running = false;
            alarmSend(500);
            code = 1;
        }
        if (modbusTime > 20) {
            runningContainer.modbus.running = false;
            alarmSend(200);
            code = 1;
        }
        if (vtiTime > 20) {
            runningContainer.vti.running = false;
            alarmSend(300);
            code = 1;
        }
        if (beckhoffTime > 20) {
            runningContainer.beckhoff.running = false;
            alarmSend(401);
            code = 1;
        }
        if (redis2Time > 20) {
            runningContainer.redis2.running = false;
            alarmSend(900);
            code = 1;
        }
        if (mongoose.connection.readyState === 0) {
            runningContainer.mongo.running = false;
            code = 1;
            mongoFlag = 1;
            alarmSend(800);
        } else if (mongoose.connection.readyState === 1 && mongoFlag === 1) {
            runningContainer.mongo.date = new Date() - (new Date().getTimezoneOffset() * 60 * 1000);
            runningContainer.mongo.running = true;
            mongoFlag = 0;
            Mongo.find({}, function (err, items) {
                if (!err && items.length === 0) {
                    alarmSend(101);
                }
            })
        } else {
            runningContainer.mongo.date = new Date() - (new Date().getTimezoneOffset() * 60 * 1000);
            runningContainer.mongo.running = true;
        }
        db.authenticate().then(() => {
            runningContainer.mssql.date = new Date() - (new Date().getTimezoneOffset() * 60 * 1000);
            runningContainer.mssql.running = true;
        }).catch(err => {
            runningContainer.mssql.running = false;
            code = 1;
            alarmSend(700);
        }).finally(() => {
            let message = {
                type: "rha",
                payload: {
                    subtype: "hb",
                    obj: {
                        container: "Manager",
                        date: new Date() - (new Date().getTimezoneOffset() * 60 * 1000),
                        code: code,
                    }
                }
            }
            redisStatus.setLog({
                listName: message.payload.obj.code,
                listData: message.payload.obj
            })
            try {
                ws.send(JSON.stringify(message))
            } catch (error) { }
        })
        systemStatus();
    }, 20000)
}
function systemStatus() {
    if (runningContainer.redis2.running) {
        runningContainer.hostpc.date = new Date() - (new Date().getTimezoneOffset() * 60 * 1000);
        osu.cpu.free().then(cpu => {
            runningContainer.hostpc.cpu = 100 - cpu;
            osu.drive.info().then(disk => {
                runningContainer.hostpc.storage = disk.usedPercentage;
                if (parseFloat(disk.usedPercentage) > 90) {
                    alarmSend(153);
                } else if (parseFloat(disk.usedPercentage) > 80) {
                    alarmSend(152);
                }
                osu.mem.info().then(ram => {
                    runningContainer.hostpc.memory = 100 - ram.freeMemPercentage;
                    if (parseFloat(runningContainer.hostpc.memory) > 90) {
                        alarmSend(151);
                    } else if (parseFloat(runningContainer.hostpc.memory) > 80) {
                        alarmSend(150);
                    }
                })
            })
        })
        let hour = osu.os.uptime() / 3600;
        runningContainer.hostpc.uptime = hour + " hours";
        let hashArray = [];
        let serviceArray = Object.keys(runningContainer)
        serviceArray.forEach(service => {
            let hashObj = {
                hashName: service,
                hashData: {
                    name: runningContainer[service].name,
                    running: runningContainer[service].running.toString(),
                    memory: runningContainer[service].memory.toString(),
                    uptime: runningContainer[service].uptime.toString(),
                    cpu: runningContainer[service].cpu.toString(),
                    storage: runningContainer[service].storage.toString(),
                    date: runningContainer[service].date.toString(),
                }
            }
            hashArray.push(hashObj);
        })
        redisStatus.setHash(hashArray);
    }
}
function differenceTime(time) {
    let now = new Date() - (new Date().getTimezoneOffset() * 60 * 1000);
    let Difference_In_Time = now - time;
    let Seconds_from_T1_to_T2 = Difference_In_Time / 1000;
    return Math.abs(Seconds_from_T1_to_T2);
}
function alarmSend(code) {
    let message = {
        type: "rha",
        payload: {
            subtype: "error",
            obj: {
                container: "Manager",
                date: new Date() - (new Date().getTimezoneOffset() * 60 * 1000),
                code: code
            }
        }
    }
    redisStatus.setLog({
        listName: message.payload.obj.code,
        listData: message.payload.obj
    })
    try {
        ws.send(JSON.stringify(message))
    } catch (error) {
    }
}
function readSensor(requestObject) {
    const promise = new Promise((resolve, reject) => {
        const prmsArr = [];
        let reqVti = {
            sensors: []
        }
        let reqMod = {
            sensors: []
        }
        let reqBeck = {
            sensors: []
        }
        let reqMoxaRest = {
            sensors: []
        }
        requestObject.sensors.forEach((sensor) => {
            let isVti = vtiSensor.findIndex(object => object === sensor)
            let isIon = ionSensor.findIndex(object => object === sensor)
            let isBeck = beckhoffSensor.findIndex(object => object === sensor)
            let isMoxa = moxaRestSensor.findIndex(object => object === sensor)
            if (isVti !== -1) {
                reqVti.sensors.push({
                    sensorId: sensor,
                })
            } else if (isIon !== -1) {
                reqMod.sensors.push({
                    sensorId: sensor
                })
            } else if (isBeck !== -1) {
                reqBeck.sensors.push({
                    sensorId: sensor
                })
            } else if (isMoxa !== -1) {
                reqMoxaRest.sensors.push({
                    sensorId: sensor
                })
            }
        })
        let send = {
            sensors: [],
        }
        if (reqMoxaRest.sensors.length > 0) {
            prmsArr.push(requestPost(urlMoxaRest + 'read', JSON.stringify(reqMoxaRest)));
        }
        if (reqVti.sensors.length > 0) {
            prmsArr.push(requestPost(urlVti + 'read', JSON.stringify(reqVti)));
        }
        if (reqMod.sensors.length > 0) {
            prmsArr.push(requestPost(urlModbus + 'read', JSON.stringify(reqMod)));
        }
        if (reqBeck.sensors.length > 0) {
            prmsArr.push(requestPost(urlBeckhoff + 'read', JSON.stringify(reqBeck)));

        }
        Promise.all(prmsArr).then(result => {
            result.forEach(data => {
                if (data !== "Olmayan Id") {
                    send.sensors = send.sensors.concat(data)
                }
            })
            resolve(send)
        }).catch(err => {
            reject("error")
        });
    });
    return promise
}
function calibrationReadSensor(requestObject) {
    const promise = new Promise((resolve, reject) => {
        const prmsArr = [];
        let reqVti = {
            sensors: []
        }
        let reqMod = {
            sensors: []
        }
        let reqBeck = {
            sensors: []
        }
        let reqMoxaRest = {
            sensors: []
        }
        requestObject.sensors.forEach((sensor) => {
            let isVti = vtiSensor.findIndex(object => object === sensor)
            let isIon = ionSensor.findIndex(object => object === sensor)
            let isBeck = beckhoffSensor.findIndex(object => object === sensor)
            let isMoxa = moxaRestSensor.findIndex(object => object === sensor)
            if (isVti !== -1) {
                reqVti.sensors.push({
                    sensorId: sensor,
                })
            } else if (isIon !== -1) {
                reqMod.sensors.push({
                    sensorId: sensor
                })
            } else if (isBeck !== -1) {
                reqBeck.sensors.push({
                    sensorId: sensor
                })
            } else if (isMoxa !== -1) {
                reqMoxaRest.sensors.push({
                    sensorId: sensor
                })
            }
        })
        let send = {
            sensors: [],
        }
        if (reqMoxaRest.sensors.length > 0) {
            prmsArr.push(requestPost(urlMoxaRest + 'calibrationRead', JSON.stringify(reqMoxaRest)));
        }
        if (reqVti.sensors.length > 0) {
            prmsArr.push(requestPost(urlVti + 'calibrationRead', JSON.stringify(reqVti)));
        }
        if (reqMod.sensors.length > 0) {
            prmsArr.push(requestPost(urlModbus + 'calibrationRead', JSON.stringify(reqMod)));
        }
        if (reqBeck.sensors.length > 0) {
            prmsArr.push(requestPost(urlBeckhoff + 'calibrationRead', JSON.stringify(reqBeck)));

        }
        Promise.all(prmsArr).then(result => {
            result.forEach(data => {
                if (data !== "Olmayan Id") {
                    send.sensors = send.sensors.concat(data)
                }
            })
            resolve(send)
        }).catch(err => {
            reject(err)
        });
    });
    return promise
}
function startTest(requestObject) {
    const promise = new Promise((resolve, reject) => {
        let reqVti = {
            testId: requestObject.testId,
            sampleTime: requestObject.sampleTime,
            sensors: []
        }
        let reqMod = {
            testId: requestObject.testId,
            sampleTime: requestObject.sampleTime,
            sensors: []
        }
        let reqUdaq = {
            testId: requestObject.testId,
            sampleTime: requestObject.sampleTime,
            sensors: []
        }
        let reqBeck = {
            testId: requestObject.testId,
            sampleTime: requestObject.sampleTime,
            sensors: []
        }
        let reqMoxaRest = {
            testId: requestObject.testId,
            sampleTime: requestObject.sampleTime,
            sensors: []
        }
        requestObject.sensors.forEach((sensor) => {
            let isVti = vtiSensor.findIndex(object => object === sensor.sensorId);
            let isIon = ionSensor.findIndex(object => object === sensor.sensorId);
            let isUdaq = udaqSensor.findIndex(object => object === sensor.sensorId);
            let isMoxa = moxaRestSensor.findIndex(object => object === sensor.sensorId);
            let isBeckhoff = beckhoffSensor.findIndex(object => object === sensor.sensorId)
            if (isVti !== -1) {
                if (Object.keys(sensor).includes("calA") && typeof sensor.calA === 'number' && Object.keys(sensor).includes("calB") && typeof sensor.calB === 'number') {
                    reqVti.sensors.push({
                        sensorId: sensor.sensorId,
                        traceId: sensor.traceId,
                        calA: sensor.calA,
                        calB: sensor.calB
                    })
                } else {
                    reqVti.sensors.push({
                        sensorId: sensor.sensorId,
                        traceId: sensor.traceId,
                    })
                }
            } else if (isIon !== -1) {
                reqMod.sensors.push({
                    sensorId: sensor.sensorId,
                    traceId: sensor.traceId,
                })
            } else if (isUdaq !== -1) {
                reqUdaq.sensors.push({
                    sensorId: sensor.sensorId,
                    length: sensor.length,
                })
            } else if (isMoxa !== -1) {
                if (Object.keys(sensor).includes("calA") && typeof sensor.calA === 'number' && Object.keys(sensor).includes("calB") && typeof sensor.calB === 'number') {
                    reqMoxaRest.sensors.push({
                        sensorId: sensor.sensorId,
                        traceId: sensor.traceId,
                        calA: sensor.calA,
                        calB: sensor.calB
                    })
                } else {
                    reqMoxaRest.sensors.push({
                        sensorId: sensor.sensorId,
                        traceId: sensor.traceId,
                    })
                }

            } else if (isBeckhoff !== -1) {
                reqBeck.sensors.push({
                    sensorId: sensor.sensorId,
                    traceId: sensor.traceId,
                })
            }

        })
        let prmsArr = []
        if (reqMoxaRest.sensors.length > 0) {
            prmsArr.push(requestPost(urlMoxaRest + 'startTest', JSON.stringify(reqMoxaRest)));
        }
        if (reqMod.sensors.length > 0) {
            prmsArr.push(requestPost(urlModbus + 'startTest', JSON.stringify(reqMod)));
        }
        if (reqUdaq.sensors.length > 0) {
            prmsArr.push(requestPost(urlUdaq + 'startTest', JSON.stringify(reqUdaq)));
        }
        if (reqVti.sensors.length > 0) {
            prmsArr.push(requestPost(urlVti + 'startTest', JSON.stringify(reqVti)));
        }
        if (reqBeck.sensors.length > 0) {
            prmsArr.push(requestPost(urlBeckhoff + 'startTest', JSON.stringify(reqBeck)));
        }
        Promise.all(prmsArr).then(result => {
            if (reqMoxaRest.sensors.length > 0) {
                let saveMongo = new Mongo({ protocol: "moxaRest", testId: reqMoxaRest.testId, body: JSON.stringify(reqMoxaRest) });
                saveMongo.save()
            }
            if (reqMod.sensors.length > 0) {
                let saveMongo = new Mongo({ protocol: "modbus", testId: reqMod.testId, body: JSON.stringify(reqMod) });
                saveMongo.save()
            }
            if (reqUdaq.sensors.length > 0) {
                let saveMongo = new Mongo({ protocol: "udaq", testId: reqUdaq.testId, body: JSON.stringify(reqUdaq) });
                saveMongo.save()
            }
            if (reqVti.sensors.length > 0) {
                let saveMongo = new Mongo({ protocol: "vti", testId: reqVti.testId, body: JSON.stringify(reqVti) });
                saveMongo.save()
            }
            if (reqBeck.sensors.length > 0) {
                let saveMongo = new Mongo({ protocol: "beckhoff", testId: reqBeck.testId, body: JSON.stringify(reqBeck) });
                saveMongo.save()
            }
            resolve("Success")
        }).catch(err => {
            reject("error")
        });
    });
    return promise;



}
function stopTest(requestObject) {
    return new Promise((resolve, reject) => {
        let prmsArr = [];
        requestObject.testIdArray.forEach(test => {
            Mongo.find({ testId: test }, function (err, items) {
                if (!err) {
                    Mongo.deleteMany({ protocol: "vti", testId: test }, function (err, obj) { })
                    Mongo.deleteMany({ protocol: "modbus", testId: test }, function (err, obj) { })
                    Mongo.deleteMany({ protocol: "udaq", testId: test }, function (err, obj) { })
                    Mongo.deleteMany({ protocol: "beckhoff", testId: test }, function (err, obj) { })
                    Mongo.deleteMany({ protocol: "moxaRest", testId: test }, function (err, obj) { })
                }
            })
            prmsArr.push(requestPost(urlModbus + 'stopTest', JSON.stringify({ testId: test })));
            prmsArr.push(requestPost(urlVti + 'stopTest', JSON.stringify({ testId: test })));
            prmsArr.push(requestPost(urlUdaq + 'stopTest', JSON.stringify({ testId: test })));
            prmsArr.push(requestPost(urlBeckhoff + 'stopTest', JSON.stringify({ testId: test })));
            prmsArr.push(requestPost(urlMoxaRest + 'stopTest', JSON.stringify({ testId: test })));
        });
        Promise.all(prmsArr).then(result => {
            resolve("success")
        }).catch(err => {
            reject("error")
        });
    });
}
function calCpuMemDisk(item) {
    return new Promise((resolve, reject) => {
        try {
            let cpuDelta = item.cpu_stats.cpu_usage.total_usage - item.precpu_stats.cpu_usage.total_usage;
            let systemDelta = item.cpu_stats.system_cpu_usage - item.precpu_stats.system_cpu_usage;
            let perCpu = (cpuDelta / systemDelta) * item.cpu_stats.cpu_usage.percpu_usage.length * 100.0;
            let perMem = (item.memory_stats.usage / item.memory_stats.limit) * 100.0;
            let perDisk = 0;
            item.blkio_stats.io_service_bytes_recursive.forEach(data => {
                if (data.op === "Write") {
                    perDisk = perDisk + data.value;
                }
            })
            perDisk = perDisk * 1024;
            resolve({ perCpu, perMem, perDisk });
        } catch (error) {
            reject(0);
        }
    });
}
function getContainerStat() {
    setInterval(() => {
        containerInfo().then(arr => {
            arr.containerStat.forEach(item => {
                let key = item.name.replace('/', '');
                containerStat[key] = item;
                switch (key) {
                    case "moxarest":
                        if (item.cpu_stats.cpu_usage.total_usage !== 0) {
                            calCpuMemDisk(item).then(stats => {
                                runningContainer.moxarest.cpu = stats.perCpu;
                                runningContainer.moxarest.memory = stats.perMem;
                                runningContainer.moxarest.storage = stats.perDisk;
                            }).catch(err => {
                                runningContainer.moxarest.cpu = "Hatali Hesaplama";
                                runningContainer.moxarest.memory = "Hatali Hesaplama";
                                runningContainer.moxarest.storage = "Hatali Hesaplama";
                            })
                        } else {
                            runningContainer.moxarest.cpu = 0;
                            runningContainer.moxarest.memory = 0;
                            runningContainer.moxarest.storage = 0;
                        }
                        break;
                    case "beckhoffnode":
                        if (item.cpu_stats.cpu_usage.total_usage !== 0) {
                            calCpuMemDisk(item).then(stats => {
                                runningContainer.beckhoffnode.cpu = stats.perCpu;
                                runningContainer.beckhoffnode.memory = stats.perMem;
                                runningContainer.beckhoffnode.storage = stats.perDisk;
                            }).catch(err => {
                                runningContainer.beckhoffnode.cpu = "Hatali Hesaplama";
                                runningContainer.beckhoffnode.memory = "Hatali Hesaplama";
                                runningContainer.beckhoffnode.storage = "Hatali Hesaplama";
                            })
                        } else {
                            runningContainer.beckhoffnode.cpu = 0;
                            runningContainer.beckhoffnode.memory = 0;
                            runningContainer.beckhoffnode.storage = 0;
                        }
                        break;
                    case "udaq":
                        if (item.cpu_stats.cpu_usage.total_usage !== 0) {
                            calCpuMemDisk(item).then(stats => {
                                runningContainer.udaq.cpu = stats.perCpu;
                                runningContainer.udaq.memory = stats.perMem;
                                runningContainer.udaq.storage = stats.perDisk;
                            }).catch(err => {
                                runningContainer.udaq.cpu = "Hatali Hesaplama";
                                runningContainer.udaq.memory = "Hatali Hesaplama";
                                runningContainer.udaq.storage = "Hatali Hesaplama";
                            })
                        } else {
                            runningContainer.udaq.cpu = 0;
                            runningContainer.udaq.memory = 0;
                            runningContainer.udaq.storage = 0;
                        }
                        break;
                    case "beckhoff":
                        if (item.cpu_stats.cpu_usage.total_usage !== 0) {
                            calCpuMemDisk(item).then(stats => {
                                runningContainer.beckhoff.cpu = stats.perCpu;
                                runningContainer.beckhoff.memory = stats.perMem;
                                runningContainer.beckhoff.storage = stats.perDisk;
                            }).catch(err => {
                                runningContainer.beckhoff.cpu = "Hatali Hesaplama";
                                runningContainer.beckhoff.memory = "Hatali Hesaplama";
                                runningContainer.beckhoff.storage = "Hatali Hesaplama";
                            })
                        } else {
                            runningContainer.beckhoff.cpu = 0;
                            runningContainer.beckhoff.memory = 0;
                            runningContainer.beckhoff.storage = 0;
                        }
                        break;
                    case "modbus":
                        if (item.cpu_stats.cpu_usage.total_usage !== 0) {
                            calCpuMemDisk(item).then(stats => {
                                runningContainer.modbus.cpu = stats.perCpu;
                                runningContainer.modbus.memory = stats.perMem;
                                runningContainer.modbus.storage = stats.perDisk;
                            }).catch(err => {
                                runningContainer.modbus.cpu = "Hatali Hesaplama";
                                runningContainer.modbus.memory = "Hatali Hesaplama";
                                runningContainer.modbus.storage = "Hatali Hesaplama";
                            })
                        } else {
                            runningContainer.modbus.cpu = 0;
                            runningContainer.modbus.memory = 0;
                            runningContainer.modbus.storage = 0;
                        }
                        break;
                    case "redis2":
                        if (item.cpu_stats.cpu_usage.total_usage !== 0) {
                            calCpuMemDisk(item).then(stats => {
                                runningContainer.redis2.cpu = stats.perCpu;
                                runningContainer.redis2.memory = stats.perMem;
                                runningContainer.redis2.storage = stats.perDisk;
                            }).catch(err => {
                                runningContainer.redis2.cpu = "Hatali Hesaplama";
                                runningContainer.redis2.memory = "Hatali Hesaplama";
                                runningContainer.redis2.storage = "Hatali Hesaplama";
                            })
                        } else {
                            runningContainer.redis2.cpu = 0;
                            runningContainer.redis2.memory = 0;
                            runningContainer.redis2.storage = 0;
                        }
                        break;
                    case "manager":
                        if (item.cpu_stats.cpu_usage.total_usage !== 0) {
                            calCpuMemDisk(item).then(stats => {
                                runningContainer.manager.cpu = stats.perCpu;
                                runningContainer.manager.memory = stats.perMem;
                                runningContainer.manager.storage = stats.perDisk;
                            }).catch(err => {
                                runningContainer.manager.cpu = "Hatali Hesaplama";
                                runningContainer.manager.memory = "Hatali Hesaplama";
                                runningContainer.manager.storage = "Hatali Hesaplama";
                            })
                        } else {
                            runningContainer.manager.cpu = 0;
                            runningContainer.manager.memory = 0;
                            runningContainer.manager.storage = 0;
                        }
                        break;
                }
            })
            arr.containerStatus.forEach(item => {
                let key = item.Names[0].replace('/', '');
                containerStatus[key] = item;
                switch (key) {
                    case "moxarest":
                        runningContainer.moxarest.uptime = item.Status;
                        if (item.State === "running") {
                            runningContainer.moxarest.date = new Date() - (new Date().getTimezoneOffset() * 60 * 1000);
                            runningContainer.moxarest.running = true
                        }
                        break;
                    case "beckhoffnode":
                        runningContainer.beckhoffnode.uptime = item.Status;
                        if (item.State === "running") {
                            runningContainer.beckhoffnode.date = new Date() - (new Date().getTimezoneOffset() * 60 * 1000);
                            runningContainer.beckhoffnode.running = true
                        }
                        break;
                    case "udaq":
                        runningContainer.udaq.uptime = item.Status;
                        if (item.State === "running") {
                            runningContainer.udaq.date = new Date() - (new Date().getTimezoneOffset() * 60 * 1000);
                            runningContainer.udaq.running = true
                        }
                        break;
                    case "beckhoff":
                        runningContainer.beckhoff.uptime = item.Status;
                        if (item.State === "running") {
                            runningContainer.beckhoff.date = new Date() - (new Date().getTimezoneOffset() * 60 * 1000);
                            runningContainer.beckhoff.running = true
                        }
                        break;
                    case "modbus":
                        runningContainer.modbus.uptime = item.Status;
                        if (item.State === "running") {
                            runningContainer.modbus.date = new Date() - (new Date().getTimezoneOffset() * 60 * 1000);
                            runningContainer.modbus.running = true
                        }
                        break;
                    case "redis2":
                        runningContainer.redis2.uptime = item.Status;
                        if (item.State === "running") {
                            runningContainer.redis2.date = new Date() - (new Date().getTimezoneOffset() * 60 * 1000);
                            runningContainer.redis2.running = true
                        }
                        break;
                    case "manager":
                        runningContainer.manager.uptime = item.Status;
                        if (item.State === "running") {
                            runningContainer.manager.date = new Date() - (new Date().getTimezoneOffset() * 60 * 1000);
                            runningContainer.manager.running = true
                        }
                        break;
                }
            })

        })
    }, 15000);
}
init();
getContainerStat();
checkConteinerDown();
vtiRestart();
udaqRestart();
modbusRestart();
beckhoffRestart();
moxaRestRestart();
server.listen(process.env.MANAGER_PORT.split(':')[1]);
process.on('unhandledRejection', (reason, p) => {
}).on('uncaughtException', err => {
});