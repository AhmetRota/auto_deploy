const request = require('request')
const reqMoxa = (url) => {
const promise = new Promise ((resolve, reject) => {
    request({
        url,
        json: true,
        timeout: 5000
      
    }, (error, response) => {
        if (error) {
            console.log(error)
            reject('Unable to connect')
        } else if (response.statusCode === 400) {
            resolve(response.statusCode)
        } else {
            resolve(response.body)
        }
    })
});
return promise
    
}
module.exports = reqMoxa
