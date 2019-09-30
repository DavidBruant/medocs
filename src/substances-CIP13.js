import { html, render } from 'https://unpkg.com/htm/preact/standalone.module.js'

function normalizeSubstanceName(substanceName){
    return substanceName.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
}

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

const CISToCIP13sP = d3.text('./data/medicaments.gouv.fr/CIS_CIP_bdpm.txt')
.then(d3.tsvParseRows)
.then(CISCIP13Rows => {
    const CISToCIP13s = new Map()

    for(const [CIS, CIP7, Libellé, StatutAdministratif, EtatCommercialisation, DateDéclarationCommercialisation, CIP13, TauxRemboursement, Prix] of CISCIP13Rows){
        const CIP13s = CISToCIP13s.get(CIS) || new Set()
        CIP13s.add(CIP13)
        CISToCIP13s.set(CIS, CIP13s)
    }

    return CISToCIP13s
})

const substancesDénominationToCISsP = d3.text('./data/medicaments.gouv.fr/CIS_COMPO_bdpm.txt')
.then(d3.tsvParseRows)
.then(compos => {
    const substancesDénominationToCISs = new Map()

    for(const [CIS, DésignationÉlémentPharmaceutique, CodeSubstance, DénominationSubstance] of compos){
        const CISs = substancesDénominationToCISs.get(DénominationSubstance) || new Set()
        CISs.add(CIS)
        substancesDénominationToCISs.set(normalizeSubstanceName(DénominationSubstance), CISs)
    }

    return substancesDénominationToCISs
})

Promise.all([CISToCIP13sP, substancesDénominationToCISsP])
.then(([CISToCIP13s, substancesDénominationToCISs]) => {

    function inputToOutput(value){
        const substanceNames = new Set(value.split('\n').map(s => s.trim()))
        substanceNames.delete('')
    
        const subtanceToCISCIP13s = new Map()
    
        for(const substanceName of substanceNames){
            const norm = normalizeSubstanceName(substanceName)

            const CISs = substancesDénominationToCISs.get(norm) || new Set()
            const CIP13s = new Set()
            for(const CIS of CISs){
                const thisCISCIP13s = CISToCIP13s.get(CIS) || new Set()

                for(const CIP13 of thisCISCIP13s){
                    CIP13s.add(CIP13)
                }
            }

            const CISCIP13s = subtanceToCISCIP13s.get(norm) || { CISs, CIP13s }

            subtanceToCISCIP13s.set(substanceName, CISCIP13s)
        }
    
        render(html`<${OutputContent} subtanceToCISCIP13s=${subtanceToCISCIP13s}/>`, document.querySelector('output'))
    }

    const textarea = document.querySelector('textarea')
    textarea.addEventListener('input', e => {
        const value = e.target.value

        inputToOutput(value)
    })

    inputToOutput(textarea.value)
})