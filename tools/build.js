import {writeFile} from 'fs'
import {promisify} from 'util'
import {join} from 'path'

import {OPEN_MEDIC_2016, OPEN_MEDIC_2015, OPEN_MEDIC_2014} from '../src/files.js';
import boitesParSexe from './dataQueries/boitesParSexe';

const openMedicByYear = Object.freeze({
    "2014": `./data/${OPEN_MEDIC_2014}`,
    "2015": `./data/${OPEN_MEDIC_2015}`,
    "2016": `./data/${OPEN_MEDIC_2016}`
});


boitesParSexe(openMedicByYear)
.then(bPSs => {
    return promisify(writeFile)(
        join(__dirname, '..', 'build', 'data.json'), 
        JSON.stringify({boitesParSexe: bPSs}, null, 3)
    )
})
.catch(err => console.error('boites par sexe error', err))
