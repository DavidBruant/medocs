import { html, render } from 'https://unpkg.com/htm/preact/standalone.module.js'

function normalizeSubstanceName(substanceName){
    return substanceName.trim().toLowerCase()
}

function OutputContent({subtanceToCISs}){
    console.log('OutputContent', subtanceToCISs)
    return html`<section>
        ${
            [...subtanceToCISs].map(([substanceName, CISs]) => {
                return html`<details>
                    <summary><h3>${substanceName} (${CISs.size})</h3></summary>
                    ${
                        CISs.size >= 1 ?
                            html`<ul>
                                ${[...CISs].map(CIS => html`<li>${CIS}</li>`)}
                            </ul>` :
                            undefined
                    }
                </details>`
            })
        }
        </section>`
}

/* */

d3.text('./data/medicaments.gouv.fr/CIS_COMPO_bdpm.txt')
.then(str => {
    const compos = d3.tsvParseRows(str)
    console.log('Kompow', compos)

    const substancesDénominationToCISs = new Map()

    for(const [CIS, DésignationÉlémentPharmaceutique, CodeSubstance, DénominationSubstance] of compos){
        
        const CISs = substancesDénominationToCISs.get(DénominationSubstance) || new Set()
        CISs.add(CIS)
        substancesDénominationToCISs.set(normalizeSubstanceName(DénominationSubstance), CISs)
    }

    console.log('substancesDénominationToCISs', substancesDénominationToCISs)


    const textarea = document.querySelector('textarea')
    textarea.addEventListener('input', e => {
        const value = e.target.value

        const substanceNames = new Set(value.split('\n').map(s => s.trim()))

        const relevantSubstanceToCISs = new Map()

        for(const substanceName of substanceNames){
            const norm = normalizeSubstanceName(substanceName)
            relevantSubstanceToCISs.set(substanceName, substancesDénominationToCISs.get(norm) || new Set())
        }

        console.log('relevantSubstanceToCISs', relevantSubstanceToCISs)

        render(html`<${OutputContent} subtanceToCISs=${relevantSubstanceToCISs}/>`, document.querySelector('output'))
    })

})