import {Parse} from 'unzip-stream'
import {createReadStream} from 'fs'

import csv from 'csv-parser'


const file = './data/OPEN_MEDIC_2016.zip';

const filestr = createReadStream(file);
const unzipstr = Parse();


const prescriptionsBySexeP = new Promise((resolve, reject) => {
    const prescriptionsBySexe = new Map()

    filestr
        .pipe(unzipstr)
        .on('entry', entry => {
            console.log('entry', entry.path, entry.type)

            entry
                .pipe(csv({separator: ';'}))
                .on('data', function (data) {
                    const sexe = data.sexe;

                    if(!prescriptionsBySexe.has(sexe)){
                        prescriptionsBySexe.set(sexe, 0)
                    }

                    prescriptionsBySexe.set(
                        sexe, 
                        prescriptionsBySexe.get(sexe)+1
                    )
                })
                .on('end', () => {
                    resolve(prescriptionsBySexe)
                })
                .on('error', reject)
        })
})


prescriptionsBySexeP.then(prescriptionsBySexe => {
    prescriptionsBySexe.forEach((count, sexe) => {
        console.log(sexe, count);
    })
})
