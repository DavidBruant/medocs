'use strict';

Promise.all([
    d3.json('./build/data.json'),
    d3.csv('./data/CIP13.csv')
])
.then(([data, cip13Names]) => {
    const {boitesParSexe, medicsParAnnee, medicsSeulementFemmes} = data;

    const headers = new Set();
    
    boitesParSexe
        .map(bpss => bpss.boitesParSexe)
        .forEach(( bps => Object.keys(bps).forEach(k => headers.add(k)) ))

    const orderedHeaders = [...headers];

    const boiteParAnnee = Bouture.section([
        Bouture.h1('Nombre de boîtes prescrites (OpenMedic)'),
        Bouture.table([
            Bouture.thead.tr([
                Bouture.th('Année'), 
                ...orderedHeaders.map(h => Bouture.th(h))
            ]),
            Bouture.tbody(
                boitesParSexe.map(bps => {
                    return Bouture.tr([
                        Bouture.td(bps.year),
                        ...orderedHeaders.map(h => Bouture.td(bps.boitesParSexe[h]))
                    ])
                })
            )
        ])
    ]).getElement()


    const nbMedicamentsParAnnee = Bouture.section([
        Bouture.h1('Nombre de médicaments prescrits par année (OpenMedic)'),
        Bouture.table([
            Bouture.thead.tr([
                Bouture.th('Année'), 
                Bouture.th('Nombre médicaments')
            ]),
            Bouture.tbody(
                medicsParAnnee.map(mpa => {
                    return Bouture.tr([
                        Bouture.td(mpa.year),
                        Bouture.td(mpa.medicaments)
                    ])
                })
            )
        ])
    ]).getElement()


    const prescriptionsFemmesSeulement = Bouture.section([
        Bouture.h1('Prescriptions faites exclusivement aux femmes par année (OpenMedic)'),
        ...medicsSeulementFemmes.map(mSF => {
            return Bouture.section([
                Bouture.h1(`Prescriptions faites exclusivement aux femmes en ${mSF.year}`),

                Bouture.table([
                    Bouture.thead.tr([
                        Bouture.th('CIP13'), 
                        Bouture.th('Nom médicament')
                    ]),
                    Bouture.tbody(
                        mSF.onlyWomenDrugs.map(cip13 => {
                            return Bouture.tr([
                                Bouture.td(cip13),
                                Bouture.td(cip13Names.find(({CIP13}) => cip13 === CIP13)['NOM COURT'])
                            ])
                        })
                    )
                ])
            ])
        })
    ]).getElement()


    document.querySelector('body main').append(
        boiteParAnnee,
        nbMedicamentsParAnnee,
        prescriptionsFemmesSeulement
    )
})
