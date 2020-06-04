import {promises} from 'fs'

import {join} from 'path'

import {tsvParseRows, csvParse} from 'd3-dsv'

import {OPEN_MEDIC_2019, OPEN_MEDIC_2018, OPEN_MEDIC_2017, OPEN_MEDIC_2016, OPEN_MEDIC_2015, OPEN_MEDIC_2014} from '../src/files.js';

import makeSubtanceToCISCIP13s from '../src/makeSubtanceToCISCIP13s.js';
import normalizeSubstanceName from '../src/normalizeSubstanceName.js';

//import boitesParSexe from './dataQueries/boitesParSexe';
//import medicsParAnnee from './dataQueries/medicsParAnnee';
//import medicsFemmesSeulement from './dataQueries/medicsFemmesSeulement';
import boitesHFParCatégorie from './dataQueries/boitesHFParCatégorie.js';

const {readFile, writeFile} = promises;

const makeOpenMedicDataPath = datafile => join(__dirname, '..', 'data', 'OpenMedic', datafile);
const makeOpenPHMEVDataPath = datafile => join(__dirname, '..', 'data', 'OpenPHMEV', datafile);

const openMedicByYear = Object.freeze({
    "2014": makeOpenMedicDataPath(OPEN_MEDIC_2014),
    "2015": makeOpenMedicDataPath(OPEN_MEDIC_2015),
    "2016": makeOpenMedicDataPath(OPEN_MEDIC_2016),
    "2017": makeOpenMedicDataPath(OPEN_MEDIC_2017),
    "2018": makeOpenMedicDataPath(OPEN_MEDIC_2018),
    "2019": makeOpenMedicDataPath(OPEN_MEDIC_2019)
});

const openPHMEVByYear = Object.freeze({
    "2014": makeOpenPHMEVDataPath('REG_OPEN_PHMEV_2014.zip'),
    "2015": makeOpenPHMEVDataPath('REG_OPEN_PHMEV_2015.zip'),
    "2016": makeOpenPHMEVDataPath('REG_OPEN_PHMEV_2016.zip'),
    "2017": makeOpenPHMEVDataPath('REG_OPEN_PHMEV_2017.zip'),
    "2018": makeOpenPHMEVDataPath('REG_OPEN_PHMEV_2018.zip')
})

const CIP13ToSubstanceP = Promise.all([
    readFile('./data/medicaments.gouv.fr/CIS_CIP_bdpm.txt', {encoding: 'utf-8'}).then(tsvParseRows),
    readFile('./data/medicaments.gouv.fr/CIS_COMPO_bdpm.txt', {encoding: 'utf-8'}).then(tsvParseRows)
])
.then(args => makeSubtanceToCISCIP13s(...args))
.then(subtanceToCISCIP13s => {
    const CIP13ToSubstance = new Map()
    
    for(const [substance, {CIP13s}] of subtanceToCISCIP13s){
        for(const CIP13 of CIP13s){
            CIP13ToSubstance.set(CIP13, normalizeSubstanceName(substance))
        }
    }

    return CIP13ToSubstance
})

const studiedSubstanceByCatégorieP = readFile('./liste-substances.csv', {encoding: 'utf-8'})
.then(csvParse)
.then(scs => {
    const substancesByCatégorie = new Map();

    for(const {Substance, Catégorie} of scs){
        const subs = substancesByCatégorie.get(Catégorie) || []
        subs.push(normalizeSubstanceName(Substance))
        substancesByCatégorie.set(Catégorie, subs)
    }

    return substancesByCatégorie;
})


const studiedCIP13ToSubstanceP = Promise.all([
    studiedSubstanceByCatégorieP.then(studiedSubstanceByCatégorie => new Set([...studiedSubstanceByCatégorie.values()].flat())),
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
    //boitesParSexe(openMedicByYear),
    //medicsParAnnee(openMedicByYear),
    //medicsFemmesSeulement(openMedicByYear),
    Promise.all([studiedCIP13ToSubstanceP, studiedSubstanceByCatégorieP])
        .then(([CIP13ToSubstance, studiedSubstanceByCatégorie]) => 
            boitesHFParCatégorie(openMedicByYear, openPHMEVByYear, CIP13ToSubstance, studiedSubstanceByCatégorie)
        )
])
.then(([/*bPSs, mPAs, mFS,*/ boitesHFByCatégorie]) => {
    return writeFile(
        join(__dirname, '..', 'build', 'data.json'), 
        JSON.stringify(
            {
                //boitesParSexe: bPSs,
                //medicsParAnnee: mPAs,
                //medicsSeulementFemmes: mFS,
                boitesHFByCatégorie
            },
            null, 
            2
        )
    )
})
.catch(err => console.error('boites par sexe error', err))
