exports.config = function() {
    this.port = 3000
    this.rooms = ['trash', 'geniuses']
    this.songsPerRound = 3
    this.minNicknameLength = 14
    this.ids = {
        trash:[
            1065981054, //b
            1457206976,
            451505887,
            262836961, // ADELE
            459885, // Avril Lavigne
            1419227, // Beyoncé
            217005, // Britney Spears
            64387566, // Katy Perry
        ],
    
        geniuses:[
            277293880, // Lady GaGa
            184932871, // MIKA
            1587965, // A Tribe Called Quest
            1971863, // Beastie Boys
            465802, // Cypress Hill
            384304, // EPMD
            289550, // OutKast
            13503763, // Swollen Members
            43680 // The Roots
        ]
    }
    return this
}
