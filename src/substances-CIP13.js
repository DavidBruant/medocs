import { html, render } from 'https://unpkg.com/htm/preact/standalone.module.js'
import makeSubtanceToCISCIP13s from './makeSubtanceToCISCIP13s.js'

import normalizeSubstanceName from './normalizeSubstanceName.js';

function OutputContent({subtanceToCISCIP13s}){
    console.log('OutputContent', subtanceToCISCIP13s)
    return html`<section>
        ${
            [...subtanceToCISCIP13s].map(([substanceName, {CISs, CIP13s}]) => {
                return html`<details>
                    <summary><h3>${substanceName} (${CISs.size})</h3></summary>
                    ${
                        CISs.size >= 1 ?
                            html`
                                <div>
                                    <h4>CIS</h4>
                                    <ul>
                                        ${[...CISs].map(CIS => html`<li>${CIS}</li>`)}
                                    </ul>
                                </div>` :
                            undefined
                    }
                    ${
                        CIP13s.size >= 1 ?
                            html`
                                <div>
                                    <h4>CIP13</h4>
                                    <ul>
                                        ${[...CIP13s].map(CIP13 => html`<li>${CIP13}</li>`)}
                                    </ul>
                                </div>` :
                            undefined
                    }
                </details>`
            })
        }
        </section>`
}

const CISCIP13RowsP = d3.text('./data/medicaments.gouv.fr/CIS_CIP_bdpm.txt')
.then(d3.tsvParseRows)

const compoRowsP = d3.text('./data/medicaments.gouv.fr/CIS_COMPO_bdpm.txt')
.then(d3.tsvParseRows)

Promise.all([CISCIP13RowsP, compoRowsP])
.then(([CISCIP13Rows, compoRows]) => makeSubtanceToCISCIP13s(CISCIP13Rows, compoRows))
.then(subtanceToCISCIP13s => {
    function inputToOutput(value){
        const substanceNames = new Set(value.split('\n').map(s => s.trim()))
        substanceNames.delete('')
    
        const thisSubstancesToCISCIP13s = new Map();

        for(const name of substanceNames){
            thisSubstancesToCISCIP13s.set( 
                name, 
                subtanceToCISCIP13s.get(normalizeSubstanceName(name)) || {CIP13s : new Set(), CISs: new Set()}
            )
        }
    
        render(html`<${OutputContent} subtanceToCISCIP13s=${thisSubstancesToCISCIP13s}/>`, document.querySelector('output'))
    }

    const textarea = document.querySelector('textarea')
    textarea.addEventListener('input', e => {
        const value = e.target.value

        inputToOutput(value)
    })

    inputToOutput(textarea.value)
})