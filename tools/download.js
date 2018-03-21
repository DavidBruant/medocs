import {open, createWriteStream} from 'fs'
import {promisify} from 'util'
import {join} from 'path'
import got from 'got'

import {OPEN_MEDIC_2016, OPEN_MEDIC_2015, OPEN_MEDIC_2014} from '../src/files.js';

const [openP] = [open].map(promisify);


const fileToURL = Object.freeze({
    [OPEN_MEDIC_2016]: 'http://open-data-assurance-maladie.ameli.fr/fic/medicaments/Open_MEDIC_Base_Complete/OPEN_MEDIC_2016.zip',
    [OPEN_MEDIC_2015]: 'http://open-data-assurance-maladie.ameli.fr/fic/medicaments/Open_MEDIC_Base_Complete/OPEN_MEDIC_2015.CSV.gz',
    [OPEN_MEDIC_2014]: 'http://open-data-assurance-maladie.ameli.fr/fic/medicaments/Open_MEDIC_Base_Complete/OPEN_MEDIC_2014.CSV.gz'
})

Object.keys(fileToURL).map(filename => {
    const filepath = join(__dirname, '..', 'data', filename);

    return openP(filepath, 'r')
    .then(() => {
        console.log(`'ts'all good! ${filepath} is already present!`)
    })
    .catch(err => {
        if (err.code === 'ENOENT') {
            console.log(`Hey! ${filename} is not there! Let's download it!`);
            const url = fileToURL[filename];
            const fileStream = createWriteStream(filepath)
            return new Promise(resolve => {
                fileStream.on('finish', resolve)
                got.stream(url).pipe(fileStream)
            })
            .catch(err => {
                console.error('request url', err);
            })
        }
      
        console.error(`Error with file ${filename}`, err);
    })
})
