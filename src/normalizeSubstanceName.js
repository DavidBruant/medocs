export default function normalizeSubstanceName(substanceName){
    return substanceName.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
}