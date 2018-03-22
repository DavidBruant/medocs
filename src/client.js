'use strict';

d3.json('./build/data.json')
.then(data => {
    const {boitesParSexe, medicsParAnnee} = data;

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


    document.querySelector('body main').append(
        boiteParAnnee,
        nbMedicamentsParAnnee
    )
})
