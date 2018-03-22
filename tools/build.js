import {writeFile} from 'fs'
import {promisify} from 'util'
import {join} from 'path'

import {OPEN_MEDIC_2016, OPEN_MEDIC_2015, OPEN_MEDIC_2014} from '../src/files.js';
import boitesParSexe from './dataQueries/boitesParSexe';
import medicsParAnnee from './dataQueries/medicsParAnnee';
import medicsFemmesSeulement from './dataQueries/medicsFemmesSeulement';

function makeDataPath(datafile){
    return join(__dirname, '..', 'data', datafile);
}

const openMedicByYear = Object.freeze({
    "2014": makeDataPath(OPEN_MEDIC_2014),
    "2015": makeDataPath(OPEN_MEDIC_2015),
    "2016": makeDataPath(OPEN_MEDIC_2016)
});

Promise.all([
    boitesParSexe(openMedicByYear),
    medicsParAnnee(openMedicByYear),
    medicsFemmesSeulement(openMedicByYear)
])
.then(([bPSs, mPAs, mFS]) => {
    return promisify(writeFile)(
        join(__dirname, '..', 'build', 'data.json'), 
        JSON.stringify(
            {
                boitesParSexe: bPSs,
                medicsParAnnee: mPAs,
                medicsSeulementFemmes: mFS
            },
            null, 
            2
        )
    )
})
.catch(err => console.error('boites par sexe error', err))
