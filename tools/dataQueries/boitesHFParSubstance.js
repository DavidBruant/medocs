import makeCSVStreamFromArchive from './makeCSVStreamFromArchive'

const SEXE_LABEL = {
    "1": "homme",
    "2": "femme",
    "9": "sexe inconnu"
}

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

                const sexe = SEXE_LABEL[data.sexe];
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

export default function boitesHFParSubstance(openMedicByYear, CIP13ToSubstance){
    return Promise.all([...Object.entries(openMedicByYear)].map( ([year, openMedicFile]) => {
        return computeBoiteBySubstanceBySexe(openMedicFile, CIP13ToSubstance)
        .then(boitesHFBySubstance => {    
            return {
                year: Number(year),
                boitesHFBySubstance
            }
        })
    }))
    .then(byYears => {
        const bySubstance = Object.create(null);

        for(const {year, boitesHFBySubstance} of byYears){
            for(const [substance, HF] of Object.entries(boitesHFBySubstance)){
                const byYear = bySubstance[substance] || Object.create(null);
                const bySource = byYear[year] || Object.create(null);

                bySource['OpenMedic'] = HF;
                byYear[year] = bySource
                bySubstance[substance] = byYear;
            }
        }

        return bySubstance
    })
}


