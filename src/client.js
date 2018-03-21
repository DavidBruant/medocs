'use strict';

d3.json('./build/data.json')
.then(data => {
    const {boitesParSexe} = data;

    const headers = new Set();
    
    boitesParSexe
        .map(bpss => bpss.boitesParSexe)
        .forEach(( bps => Object.keys(bps).forEach(k => headers.add(k)) ))

    const orderedHeaders = [...headers];

    const el = Bouture.section([
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

    document.querySelector('body main').appendChild(el)
})
