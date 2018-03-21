'use strict';

d3.json('./build/data.json')
.then(data => {
    const {boitesParSexe2016} = data;

    console.log(Object.keys(boitesParSexe2016));

    const el = Bouture.section([
        Bouture.h1('Nombre de boîtes prescrites (OpenMedic2016)'),
        Bouture.table([
            Bouture.thead.tr(
                Object.keys(boitesParSexe2016).map(h => Bouture.th(h))
            ),
            Bouture.tbody.tr(
                Object.keys(boitesParSexe2016).map(h => Bouture.td(boitesParSexe2016[h]))
            )
        ])
    ]).getElement()

    document.querySelector('body main').appendChild(el)
})
