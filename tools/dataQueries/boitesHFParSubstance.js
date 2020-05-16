import makeCSVStreamFromArchive from './makeCSVStreamFromArchive'

import {SEXE_LABEL} from '../../src/SEXE_LABEL.js'

function computeBoiteBySubstanceBySexe(file, CIP13ToSubstance){
    console.log('computeBoiteBySubstanceBySexe', file)

    const boitesHFBySubstance = Object.create(null)

    return makeCSVStreamFromArchive(file)
    .then(csvStream => {
        return new Promise((resolve, reject) => {
            csvStream
            .on('data', function (data) {
                const cip13 = data['CIP13'];
                const substance = CIP13ToSubstance.get(cip13) 

                if(!substance)
                    return

                const sexe = SEXE_LABEL[data.sexe] || SEXE_LABEL[data.SEXE];
                const boites = Number(data['BOITES']);

                if(!boitesHFBySubstance[substance]){
                    boitesHFBySubstance[substance] = {}
                }

                const bySexe = boitesHFBySubstance[substance]
                bySexe[sexe] = (bySexe[sexe] || 0) + boites; // in-place mutation
            })
            .on('end', () => {
                resolve(boitesHFBySubstance)
            })
            .on('error', reject)
        })
    })
}

export default function boitesHFParSubstance(openMedicByYear, openPHMEVByYear, CIP13ToSubstance){
    const openMedicByYearsP = Promise.all([...Object.entries(openMedicByYear)].map( ([year, openMedicFile]) => {
        return computeBoiteBySubstanceBySexe(openMedicFile, CIP13ToSubstance)
        .then(boitesHFBySubstance => {    
            return {
                year: Number(year),
                boitesHFBySubstance
            }
        })
    }))

    const openPHMEVByYearsP = Promise.all([...Object.entries(openPHMEVByYear)].map( ([year, openPHMEVFile]) => {
        return computeBoiteBySubstanceBySexe(openPHMEVFile, CIP13ToSubstance)
        .then(boitesHFBySubstance => {    
            return {
                year: Number(year),
                boitesHFBySubstance
            }
        })
    }))

    return Promise.all([openMedicByYearsP, openPHMEVByYearsP])
    .then(([openMedicByYears, openPHMEVByYears]) => {
        const bySubstance = Object.create(null);

        for(const {year, boitesHFBySubstance} of openMedicByYears){
            for(const [substance, HF] of Object.entries(boitesHFBySubstance)){
                const byYear = bySubstance[substance] || Object.create(null);
                const bySource = byYear[year] || Object.create(null);

                bySource['OpenMedic'] = HF;
                byYear[year] = bySource
                bySubstance[substance] = byYear;
            }
        }

        for(const {year, boitesHFBySubstance} of openPHMEVByYears){
            for(const [substance, HF] of Object.entries(boitesHFBySubstance)){
                const byYear = bySubstance[substance] || Object.create(null);
                const bySource = byYear[year] || Object.create(null);

                bySource['OpenPHMEV'] = HF;
                byYear[year] = bySource
                bySubstance[substance] = byYear;
            }
        }

        return bySubstance
    })
}


