import { useCallback } from 'react'
import { useStore } from './store.jsx'
import { avecNiveau, maintenantISO, nouvelId } from './lib/outils.js'

/** Actions de suivi partagées par les pages. */
export function useActions() {
  const { modifier } = useStore()

  const fixerNiveau = useCallback(
    (competenceId, axe, valeur) => modifier('suivi', (s) => avecNiveau(s, competenceId, axe, valeur)),
    [modifier],
  )

  const ajouterNote = useCallback(
    ({ competence, type, texte, seance }) =>
      modifier('suivi', (s) => ({
        ...s,
        notes: [
          ...s.notes,
          { id: nouvelId('note'), date: maintenantISO(), competence, seance: seance || null, type, texte, resolue: false },
        ],
      })),
    [modifier],
  )

  const modifierNote = useCallback(
    (id, champs) =>
      modifier('suivi', (s) => ({ ...s, notes: s.notes.map((n) => (n.id === id ? { ...n, ...champs } : n)) })),
    [modifier],
  )

  const supprimerNote = useCallback(
    (id) => modifier('suivi', (s) => ({ ...s, notes: s.notes.filter((n) => n.id !== id) })),
    [modifier],
  )

  const ajouterResultat = useCallback(
    (resultat) => {
      const r = { id: nouvelId('res'), date: maintenantISO(), ...resultat }
      modifier('suivi', (s) => ({ ...s, resultats: [...s.resultats, r] }))
      return r
    },
    [modifier],
  )

  const supprimerResultat = useCallback(
    (id) => modifier('suivi', (s) => ({ ...s, resultats: s.resultats.filter((r) => r.id !== id) })),
    [modifier],
  )

  return { fixerNiveau, ajouterNote, modifierNote, supprimerNote, ajouterResultat, supprimerResultat }
}
