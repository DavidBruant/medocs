import makeCSVStreamFromArchive from './makeCSVStreamFromArchive'

function strMapToObj(strMap) {
    // Credit : http://2ality.com/2015/08/es6-map-json.html

    let obj = Object.create(null);
    for (let [k,v] of strMap) {
        // We don’t escape the key '__proto__'
        // which can cause problems on older engines
        obj[k] = v;
    }
    return obj;
}

const SEXE_LABEL = {
    "1": "MASCULIN",
    "2": "FEMININ",
    "9": "VALEUR INCONNUE"
}


function computeBoiteBySexe(file){
    console.log('computeBoiteBySexe', file)

    const boitesBySexe = new Map()

    return makeCSVStreamFromArchive(file)
    .then(csvStream => {
        return new Promise((resolve, reject) => {
            csvStream
            .on('data', function (data) {
                const sexe = data.sexe;
                const boites = Number(data['BOITES']);

                if(!boitesBySexe.has(sexe)){
                    boitesBySexe.set(sexe, 0)
                }

                boitesBySexe.set(
                    sexe, 
                    boitesBySexe.get(sexe) + boites
                )
            })
            .on('end', () => {
                resolve(boitesBySexe)
            })
            .on('error', reject)
        })
    })
}

export default function(openMedicByYear){
    return Promise.all(Object.keys(openMedicByYear).map(year => {
        return computeBoiteBySexe(openMedicByYear[year])
        .then(strMapToObj)
        .then(bPS => {
            const boitesParSexe = {};
    
            Object.keys(bPS).forEach(k => {
                const label = SEXE_LABEL[k];
                boitesParSexe[label] = bPS[k];
            })
    
            return {
                year: Number(year),
                boitesParSexe
            }
        })
    }))
}


