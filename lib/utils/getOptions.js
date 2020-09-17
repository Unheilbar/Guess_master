//this function returns options for request
const ids = [
    1065981054, //b
    1457206976,
    451505887,
    262836961, // ADELE
    459885, // Avril Lavigne
    1419227, // Beyoncé
    217005, // Britney Spears
    64387566, // Katy Perry
]

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

