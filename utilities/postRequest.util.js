const request = require('request')
const req = (url, body) => {
    const promise = new Promise((resolve, reject) => { 
        request.post({
            url,
            body: JSON.parse(body),
            timeout: 5000,
            json: true,

        }, (error, response) => {
            if (error) {
                reject('Unable to connect')
            } else if (response.statusCode === 400) {
                resolve("Olmayan Id")
            } else {
                resolve(response.body)
            }
        })

    });
    return promise
    
}
module.exports = req
