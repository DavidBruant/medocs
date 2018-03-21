import {createReadStream, writeFile} from 'fs'
import {promisify} from 'util'
import {join, extname} from 'path'
import {createGunzip} from 'zlib'

import {Parse} from 'unzip-stream'
import csv from 'csv-parser'

import {OPEN_MEDIC_2016, OPEN_MEDIC_2015, OPEN_MEDIC_2014} from '../src/files.js';

const file = `./data/${OPEN_MEDIC_2016}`;

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



// Q1
const boitesBySexeP = new Promise((resolve, reject) => {
    const boitesBySexe = new Map()

    const extension = extname(file);

    const fileStream = createReadStream(file)

    function processStream(str){
        str
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
    }

    if(extension === '.zip'){
        fileStream
        .pipe(Parse())
        .on('entry', entry => {
            console.log('entry', entry.path, entry.type)

            processStream(
                entry.pipe(csv({separator: ';'}))
            )
        })
    }
    else{
        processStream(
            fileStream
            .pipe(createGunzip())
            .pipe(csv({separator: ';'}))
        )
    }

})


boitesBySexeP
.then(strMapToObj)
.then(boitesBySexe => {
    const o = {};

    Object.keys(boitesBySexe).forEach(k => {
        const label = SEXE_LABEL[k];
        o[label] = boitesBySexe[k];
    })

    return promisify(writeFile)(
        join(__dirname, '..', 'build', 'data.json'), 
        JSON.stringify({boitesParSexe2016: o})
    )
})
.catch(err => console.error('Q1', err))



// Q2
/*const nbPrescByMedicP = new Promise((resolve, reject) => {
    const nbPrescByMedic = new Map()

    createReadStream(file)
        .pipe(Parse())
        .on('entry', entry => {
            console.log('entry', entry.path, entry.type)

            entry
                .pipe(csv({separator: ';'}))
                .on('data', function (data) {
                    const cip13 = data.CIP13.trim();

                    if(!nbPrescByMedic.has(cip13)){
                        nbPrescByMedic.set(cip13, 0)
                    }

                    nbPrescByMedic.set(
                        cip13, 
                        nbPrescByMedic.get(cip13)+1
                    )
                })
                .on('end', () => {
                    resolve(nbPrescByMedic)
                })
                .on('error', reject)
        })
})


nbPrescByMedicP.then(nbPrescByMedic => {
    console.log('nb medic : ', nbPrescByMedic.size)

    nbPrescByMedic.forEach((count, CIP13) => {
        console.log(CIP13, count);
    })
})*/