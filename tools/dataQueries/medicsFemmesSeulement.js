import makeCSVStreamFromArchive from './makeCSVStreamFromArchive'

function computeWomenOnlyDrugs(file){
    console.log('computeWomenOnlyDrugs', file)

    const prescribedToMen = new Set()
    const prescribedToWomen = new Set()

    return makeCSVStreamFromArchive(file)
    .then(csvStream => {
        return new Promise((resolve, reject) => {
            csvStream
            .on('data', function (data) {
                const sexe = data.sexe;
                const boites = Number(data['BOITES']);

                if(sexe === '9' || boites < 1)
                    return; // ignore

                const cip13 = data['CIP13'];

                if(sexe === '1') 
                    prescribedToMen.add(cip13); 
                else 
                    prescribedToWomen.add(cip13);
            })
            .on('end', () => {
                console.log('end only women', file, prescribedToMen.size, prescribedToWomen.size);

                const prescribedToWomenButNotMen = new Set(prescribedToWomen)
                
                for(const cip13 of prescribedToMen){
                    prescribedToWomenButNotMen.delete(cip13);
                }

                resolve(prescribedToWomenButNotMen)
            })
            .on('error', reject)
        })
    })
}

export default function(openMedicByYear){
    return Promise.all(Object.keys(openMedicByYear).map(year => {
        return computeWomenOnlyDrugs(openMedicByYear[year])
        .then(onlyWomenDrugs => {
            return {
                year: Number(year),
                onlyWomenDrugs: [...onlyWomenDrugs]
            }
        })
    }))
}


