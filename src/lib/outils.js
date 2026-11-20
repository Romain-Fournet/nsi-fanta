// Fonctions pures partagées par les pages.

export const NIVEAU_COULEURS = ['#B9C0CC', '#C8323C', '#E07B24', '#E5B800', '#2E8B57']

export const TYPES_EXERCICE = {
  lire: 'Lire (prédire)',
  trace: 'Trace',
  bug: 'Trouver le bug',
  completer: 'Compléter',
  ecrire: 'Écrire',
  sql: 'SQL',
  papier: 'Papier',
}

export const TYPES_NOTE = {
  blocage: 'Blocage',
  erreur: 'Erreur fréquente',
  declic: 'Déclic',
  astuce: 'Astuce',
  remarque: 'Remarque',
}

export const RESULTATS = {
  seule: 'Réussi seule',
  aide: 'Réussi avec aide',
  echec: 'Pas réussi',
}

export const MODES = { basthon: 'Basthon', papier: 'Papier' }

export function nouvelId(prefixe = 'id') {
  return `${prefixe}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`
}

export function maintenantISO() {
  return new Date().toISOString()
}

export function aujourdhuiISO() {
  const d = new Date()
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

export function formatDate(iso, options = { day: 'numeric', month: 'long', year: 'numeric' }) {
  if (!iso) return ''
  const d = iso.length === 10 ? new Date(`${iso}T12:00:00`) : new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('fr-FR', options)
}

export function formatDateCourte(iso) {
  return formatDate(iso, { day: 'numeric', month: 'short' })
}

/** Nombre de jours entiers entre aujourd'hui et une date AAAA-MM-JJ. */
export function joursAvant(dateISO) {
  if (!dateISO) return null
  const cible = new Date(`${dateISO.slice(0, 10)}T00:00:00`)
  const auj = new Date(`${aujourdhuiISO()}T00:00:00`)
  return Math.round((cible - auj) / 86_400_000)
}

export function prochainExamen(eleve) {
  const auj = aujourdhuiISO()
  return (eleve?.examens || [])
    .filter((e) => e.date && e.date.slice(0, 10) >= auj)
    .sort((a, b) => a.date.localeCompare(b.date))[0]
}

/** Toutes les compétences, à plat, avec leur thème. */
export function toutesCompetences(referentiel, { avecArchivees = false } = {}) {
  if (!referentiel) return []
  return referentiel.themes.flatMap((theme) =>
    theme.competences
      .filter((c) => avecArchivees || !c.archive)
      .map((c) => ({ ...c, theme })),
  )
}

export function trouverCompetence(referentiel, id) {
  return toutesCompetences(referentiel, { avecArchivees: true }).find((c) => c.id === id)
}

export function niveauDe(suivi, id) {
  const c = suivi?.competences?.[id]
  return { lire: c?.lire ?? 0, ecrire: c?.ecrire ?? 0 }
}

/** Pourcentage de maîtrise d'un thème sur un axe (moyenne des niveaux / 4). */
export function progressionTheme(theme, suivi, axe) {
  const comps = theme.competences.filter((c) => !c.archive)
  if (!comps.length) return 0
  const somme = comps.reduce((s, c) => s + niveauDe(suivi, c.id)[axe], 0)
  return Math.round((somme / (comps.length * 4)) * 100)
}

export function resultatsExercice(suivi, exerciceId) {
  return (suivi?.resultats || [])
    .filter((r) => r.exercice === exerciceId)
    .sort((a, b) => a.date.localeCompare(b.date))
}

export function dernierResultat(suivi, exerciceId) {
  const liste = resultatsExercice(suivi, exerciceId)
  return liste[liste.length - 1] || null
}

/** à faire / réussi seule / à refaire */
export function statutExercice(suivi, exerciceId) {
  const dernier = dernierResultat(suivi, exerciceId)
  if (!dernier) return 'afaire'
  return dernier.resultat === 'seule' ? 'reussi' : 'arefaire'
}

/** Axe évalué par un type d'exercice. */
export function axeDuType(type) {
  return type === 'lire' || type === 'trace' ? 'lire' : 'ecrire'
}

/**
 * Niveau proposé après un résultat.
 * Réussi seule : +1 (au moins 3 si la compétence n'était pas encore vue).
 * Avec aide : au moins 2. Pas réussi : 1.
 */
export function niveauPropose(actuel, resultat) {
  if (resultat === 'seule') return actuel === 0 ? 3 : Math.min(4, actuel + 1)
  if (resultat === 'aide') return Math.max(actuel, 2)
  return 1
}

/** Applique un niveau et l'ajoute à l'historique. Renvoie un nouveau suivi. */
export function avecNiveau(suivi, competenceId, axe, nouveau) {
  const actuel = suivi.competences?.[competenceId] || { lire: 0, ecrire: 0, historique: [] }
  const ancien = actuel[axe] ?? 0
  if (ancien === nouveau) return suivi
  const date = maintenantISO()
  return {
    ...suivi,
    competences: {
      ...suivi.competences,
      [competenceId]: {
        lire: actuel.lire ?? 0,
        ecrire: actuel.ecrire ?? 0,
        ...actuel,
        [axe]: nouveau,
        maj: date,
        historique: [...(actuel.historique || []), { date, axe, ancien, nouveau }],
      },
    },
  }
}

export function suiviVide() {
  return { competences: {}, notes: [], resultats: [] }
}

export function seancesVides() {
  return { seances: [] }
}

export function trierParDateDesc(liste) {
  return [...liste].sort((a, b) => (b.date || '').localeCompare(a.date || ''))
}

export function copier(texte) {
  if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(texte)
  const zone = document.createElement('textarea')
  zone.value = texte
  document.body.appendChild(zone)
  zone.select()
  document.execCommand('copy')
  zone.remove()
  return Promise.resolve()
}
