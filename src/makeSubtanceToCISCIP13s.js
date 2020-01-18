import normalizeSubstanceName from './normalizeSubstanceName.js';

export default function(CISCIP13Rows, compos){

    const CISToCIP13s = new Map()

    for(const [CIS, CIP7, Libellé, StatutAdministratif, EtatCommercialisation, DateDéclarationCommercialisation, CIP13, TauxRemboursement, Prix] of CISCIP13Rows){
        const CIP13s = CISToCIP13s.get(CIS) || new Set()
        CIP13s.add(CIP13)
        CISToCIP13s.set(CIS, CIP13s)
    }

    const substancesDénominationToCISs = new Map()

    for(const [CIS, DésignationÉlémentPharmaceutique, CodeSubstance, DénominationSubstance] of compos){
        const CISs = substancesDénominationToCISs.get(DénominationSubstance) || new Set()
        CISs.add(CIS)
        substancesDénominationToCISs.set(normalizeSubstanceName(DénominationSubstance), CISs)
    }

    const subtanceToCISCIP13s = new Map()

    for(const [substanceName, CISs] of substancesDénominationToCISs){
        const CIP13s = new Set()
        for(const CIS of CISs){
            const thisCISCIP13s = CISToCIP13s.get(CIS) || new Set()

            for(const CIP13 of thisCISCIP13s){
                CIP13s.add(CIP13)
            }
        }

        const CISCIP13s = subtanceToCISCIP13s.get(substanceName) || { CISs, CIP13s }

        subtanceToCISCIP13s.set(substanceName, CISCIP13s)
    }

    return subtanceToCISCIP13s
}