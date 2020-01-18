import {promises} from 'fs'

import {join} from 'path'

import {tsvParseRows} from 'd3-dsv'

import {OPEN_MEDIC_2018, OPEN_MEDIC_2017, OPEN_MEDIC_2016, OPEN_MEDIC_2015, OPEN_MEDIC_2014} from '../src/files.js';

import makeSubtanceToCISCIP13s from '../src/makeSubtanceToCISCIP13s.js';
import normalizeSubstanceName from '../src/normalizeSubstanceName.js';

import boitesParSexe from './dataQueries/boitesParSexe';
import medicsParAnnee from './dataQueries/medicsParAnnee';
import medicsFemmesSeulement from './dataQueries/medicsFemmesSeulement';
import boitesHFParSubstance from './dataQueries/boitesHFParSubstance';

const {readFile, writeFile} = promises;

function makeDataPath(datafile){
    return join(__dirname, '..', 'data', 'OpenMedic', datafile);
}

const openMedicByYear = Object.freeze({
    "2014": makeDataPath(OPEN_MEDIC_2014),
    "2015": makeDataPath(OPEN_MEDIC_2015),
    "2016": makeDataPath(OPEN_MEDIC_2016),
    "2017": makeDataPath(OPEN_MEDIC_2017),
    "2018": makeDataPath(OPEN_MEDIC_2018)
});

const CIP13ToSubstanceP = Promise.all([
    readFile('./data/medicaments.gouv.fr/CIS_CIP_bdpm.txt', {encoding: 'utf-8'}).then(tsvParseRows),
    readFile('./data/medicaments.gouv.fr/CIS_COMPO_bdpm.txt', {encoding: 'utf-8'}).then(tsvParseRows)
])
.then(args => makeSubtanceToCISCIP13s(...args))
.then(subtanceToCISCIP13s => {
    const CIP13ToSubstance = new Map()
    
    for(const [substance, {CIP13s}] of subtanceToCISCIP13s){
        for(const CIP13 of CIP13s){
            CIP13ToSubstance.set(CIP13, substance)
        }
    }

    return CIP13ToSubstance
})

const studiedCIP13ToSubstanceP = Promise.all([
    readFile('./liste-substances.csv', {encoding: 'utf-8'})
    .then(str => new Set(str.split('\n').map(s => normalizeSubstanceName(s.trim())))),
    CIP13ToSubstanceP
])
.then(([studiedSubstances, CIP13ToSubstance]) => {
    const studiedCIP13ToSubstance = new Map();

    for(const [CIP13, substance] of CIP13ToSubstance){
        if(studiedSubstances.has(substance)){
            studiedCIP13ToSubstance.set(CIP13, substance)
        }
    }
    return studiedCIP13ToSubstance
})

Promise.all([
    boitesParSexe(openMedicByYear),
    medicsParAnnee(openMedicByYear),
    medicsFemmesSeulement(openMedicByYear),
    studiedCIP13ToSubstanceP.then(CIP13ToSubstance => boitesHFParSubstance(openMedicByYear, CIP13ToSubstance))
])
.then(([bPSs, mPAs, mFS, boitesHFBySubstance]) => {
    return writeFile(
        join(__dirname, '..', 'build', 'data.json'), 
        JSON.stringify(
            {
                boitesParSexe: bPSs,
                medicsParAnnee: mPAs,
                medicsSeulementFemmes: mFS,
                boitesHFBySubstance
            },
            null, 
            2
        )
    )
})
.catch(err => console.error('boites par sexe error', err))
