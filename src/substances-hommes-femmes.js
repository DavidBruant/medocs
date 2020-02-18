import {render, createElement} from 'https://cdn.jsdelivr.net/npm/preact@10.2.1/dist/preact.module.js'
import htm from 'https://cdn.jsdelivr.net/npm/htm@2.2.1/dist/htm.module.js'

const html = htm.bind(createElement);


function HF({homme = 0, femme = 0}){
    const hRatio = homme/(homme+femme)
    const fRatio = femme/(homme+femme)

    if(Number.isNaN(hRatio) || Number.isNaN(fRatio)){
        console.log('NaN', homme, femme, hRatio, fRatio)
    }

    return html`<div class="hf">
        <div class="bars">
            <div class="h" style=${ {width: `${hRatio*100}%`} }></div>
            <div class="f" style=${ {width: `${fRatio*100}%`} }></div>
        </div>
        <div class="numbers">
            <span>${(hRatio*100).toFixed(0)}% /  ${(fRatio*100).toFixed(0)}% </span> 
            <span>(${homme} /  ${femme})</span>
        </div>
    </div>`
}

function SubstancesHF(bySubstances){
    return html`<section>
        ${ [...Object.entries(bySubstances)].map(([substance, byYear]) => {
            return html`<section>
                <h2>${substance}</h2>
                ${ [...Object.entries(byYear)].map(([year, byDataset]) => {
                    return html`<section>
                        <h3>${year}</h3>
                        ${ [...Object.entries(byDataset)].map(([dataset, hf]) => {
                            return hf.femme > 0 || hf.homme > 0 ? html`<section>
                                <h4>${dataset}</h4>
                                <${HF} ...${hf}></>
                            </section>` : undefined
                        }) }
                    </section>`
                }) }
            </section>`
        }) }
    </section>`
}


d3.json('./build/data.json').then(data => {
    console.log('data', data)
    render(html`<${SubstancesHF} ...${data['boitesHFBySubstance']}></>`, document.querySelector('main'))
})