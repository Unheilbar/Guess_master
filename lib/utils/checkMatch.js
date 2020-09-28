//Calculation livenshtein distance
function levenshteinDistance(s1, s2) {
    let costs = 1
    let i, j, l1, l2, flip, ch, chl, ii, ii2, cost, cutHalf;
    l1 = s1.length;
    l2 = s2.length;

    costs = costs || {};
    let cr = costs.replace || 1;
    let cri = costs.replaceCase || costs.replace || 1;
    let ci = costs.insert || 1;
    let cd = costs.remove || 1;

    cutHalf = flip = Math.max(l1, l2);

    let minCost = Math.min(cd, ci, cr);
    let minD = Math.max(minCost, (l1 - l2) * cd);
    let minI = Math.max(minCost, (l2 - l1) * ci);
    let buf = new Array((cutHalf * 2) - 1);

    for (i = 0; i <= l2; ++i) {
        buf[i] = i * minD;
    }

    for (i = 0; i < l1; ++i, flip = cutHalf - flip) {
        ch = s1[i];
        chl = ch.toLowerCase();

        buf[flip] = (i + 1) * minI;

        ii = flip;
        ii2 = cutHalf - flip;

        for (j = 0; j < l2; ++j, ++ii, ++ii2) {
            cost = (ch === s2[j] ? 0 : (chl === s2[j].toLowerCase()) ? cri : cr);
            buf[ii + 1] = Math.min(buf[ii2 + 1] + cd, buf[ii] + ci, buf[ii2] + cost);
        }
    }
    return buf[l2 + cutHalf - flip];
}


//transliterate in case kirilicc alphabet
function transliterate(word){
    const a = {"Ё":"YO","Й":"I","Ц":"TS","У":"U","К":"K","Е":"E","Н":"N","Г":"G","Ш":"SH","Щ":"SCH","З":"Z","Х":"H","Ъ":"'","ё":"yo","й":"i","ц":"ts","у":"u","к":"k","е":"e","н":"n","г":"g","ш":"sh","щ":"sch","з":"z","х":"h","ъ":"'","Ф":"F","Ы":"I","В":"V","А":"a","П":"P","Р":"R","О":"O","Л":"L","Д":"D","Ж":"ZH","Э":"E","ф":"f","ы":"i","в":"v","а":"a","п":"p","р":"r","о":"o","л":"l","д":"d","ж":"zh","э":"e","Я":"Ya","Ч":"CH","С":"S","М":"M","И":"I","Т":"T","Ь":"'","Б":"B","Ю":"YU","я":"ya","ч":"ch","с":"s","м":"m","и":"i","т":"t","ь":"'","б":"b","ю":"yu", " и ":" and "};
    return word.split('').map(function (char) { 
    return a[char] || char; 
  }).join("");
}

//checking the degree of match
function checkEquals(str1, str2) {
    let threshold = Math.round(Math.log(str2.replace(' ', '').length))+1
    return levenshteinDistance(str1, str2) <= threshold
}

module.exports = function match(str1, str2, guessType) {
    let guess = transliterate(str1).toLowerCase()
    let target = transliterate(str2).toLowerCase()

    if(checkEquals(guess, target)) {    //if guess equal to target
        return true
    }

    let _target

    if(~target.indexOf('.')){
        _target =   target.replace(/\./g, '')
        if(checkEquals(guess, _target)){
            return true
        }
    }

    if(~target.indexOf('-')){
        _target = target.replace(/-/g, '')
        if(checkEquals(_target, guess)) {
            return true
        }
    }

    if(~target.indexOf(' & ') && !~target.indexOf('(')) {
        _target = target.replace(/ & /, ' and ')
    }

    if(guessType == 'artist') {
        const splits = target.split(/ & |, /) //artist name could contain a few artists
        for(let artist of splits) {
            if(checkEquals(guess, artist)) {
                return true
            }
        }
    }

    if(~target.indexOf('feat.')) {
        const feat = target.replace(/.*feat./,'').replace(']', '').replace('[instrumental]', '')
        if(checkEquals(guess, feat)) {
            return true
        }
    }

    if (/\(.+\)\??(?: \[.+\])?/.test(target)) {
        _target = target.replace(/\(.+\)\??(?: \[.+\])?/, '').trim()
        if(checkEquals(guess, _target)) {
            return true
        }
    }
    return false      
}


