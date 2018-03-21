import makeCSVStreamFromArchive from './makeCSVStreamFromArchive'

function computeYearDrugs(file){
    console.log('computeYearDrugs', file)

    const drugs = new Set()

    return makeCSVStreamFromArchive(file)
    .then(csvStream => {
        return new Promise((resolve, reject) => {
            csvStream
            .on('data', function (data) {
                const cip13 = data['CIP13'];
                drugs.add(cip13);
            })
            .on('end', () => {
                resolve(drugs)
            })
            .on('error', reject)
        })
    })
}

export default function(openMedicByYear){
    return Promise.all(Object.keys(openMedicByYear).map(year => {
        return computeYearDrugs(openMedicByYear[year])
        .then(drugs => {
            return {
                year: Number(year),
                medicaments: [...drugs]
            }
        })
    }))
}


