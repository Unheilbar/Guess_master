//this function returns options for request
module.exports = function (urls) {
    const randomInteger = (min, max) => {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min; //Максимум не включается, минимум включается
    }

    const urlId = urls[randomInteger(0, urls.length-1)]

    const options = {
        method:'get',
        url:'https://itunes.apple.com/lookup?id=' + urlId + '&entity=song&limit=5&sort=recent',
        json: true
    }

    return options
}

