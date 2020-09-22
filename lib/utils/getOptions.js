//this function returns options for request
module.exports = function (urls) {
    const randomInteger = (min, max) => {
        let rand = min + Math.random() * (max + 1 - min)
        return Math.floor(rand)
    }

    const urlId = urls[randomInteger(0, urls.length-1)]

    const options = {
        method:'get',
        url:'https://itunes.apple.com/lookup?id=' + urlId + '&entity=song&limit=5&sort=recent',
        json: true
    }

    return options
}

