const Docker = require('dockerode');
const docker = new Docker();
module.exports = () => {
    return promise = new Promise((resolve, reject) => {
        docker.listContainers({ all: true }).then(containerStatus => {
            let prmsArr = [];
            let exitedContainer = []
            containerStatus.forEach(container => {
                if (container.State === "exited") {
                    exitedContainer.push(container.Names[0].replace('/', ''));
                }
                let con = docker.getContainer(container.Id);
                prmsArr.push(con.stats({ stream: false }));
            });
            Promise.all(prmsArr).then(containerStat => {
                resolve({ containerStat, containerStatus, exitedContainer })
            }).catch(err => {
                reject("error")
            });
        }).catch(err => {
            reject(err)
        })
    });
}

