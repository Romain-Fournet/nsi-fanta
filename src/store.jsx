// Store de l'application : charge les fichiers de data/, applique les
// modifications et les enregistre automatiquement ~500 ms après la dernière.
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { ecrireJSON, lireJSON } from './lib/api.js'
import { seancesVides, suiviVide } from './lib/outils.js'

const DELAI_SAUVEGARDE = 500
const CLE_ELEVE = 'cahier-nsi:eleve'

const StoreContext = createContext(null)

function cheminDe(cle, eleveId) {
  switch (cle) {
    case 'referentiel':
      return 'referentiel.json'
    case 'exercices':
      return 'exercices.json'
    case 'eleves':
      return 'eleves.json'
    case 'suivi':
      return `eleves/${eleveId}/suivi.json`
    case 'seances':
      return `eleves/${eleveId}/seances.json`
    default:
      throw new Error(`Fichier inconnu : ${cle}`)
  }
}

function lireEleveMemorise() {
  try {
    return localStorage.getItem(CLE_ELEVE)
  } catch {
    return null
  }
}

export function StoreProvider({ children }) {
  const [donnees, setDonnees] = useState({
    referentiel: null,
    exercices: null,
    eleves: null,
    suivi: null,
    seances: null,
  })
  const donneesRef = useRef(donnees)
  const [eleveId, setEleveIdState] = useState(null)
  const eleveIdRef = useRef(null)
  const [chargement, setChargement] = useState({ etat: 'chargement', message: '' })
  const [sauvegarde, setSauvegarde] = useState({ etat: 'ok', message: '' })

  // chemin -> { timer, valeur }
  const enAttente = useRef(new Map())
  const enCours = useRef(0)

  const majEtatSauvegarde = useCallback((erreur) => {
    if (erreur) {
      setSauvegarde({ etat: 'erreur', message: erreur.message })
    } else if (enAttente.current.size > 0) {
      setSauvegarde({ etat: 'attente', message: '' })
    } else if (enCours.current > 0) {
      setSauvegarde({ etat: 'enregistrement', message: '' })
    } else {
      setSauvegarde({ etat: 'ok', message: '' })
    }
  }, [])

  const envoyer = useCallback(
    async (chemin, valeur, options) => {
      enCours.current += 1
      majEtatSauvegarde()
      try {
        await ecrireJSON(chemin, valeur, options)
        enCours.current -= 1
        majEtatSauvegarde()
      } catch (e) {
        enCours.current -= 1
        majEtatSauvegarde(e)
      }
    },
    [majEtatSauvegarde],
  )

  const planifier = useCallback(
    (chemin, valeur) => {
      const precedent = enAttente.current.get(chemin)
      if (precedent) clearTimeout(precedent.timer)
      const timer = setTimeout(() => {
        enAttente.current.delete(chemin)
        envoyer(chemin, valeur)
      }, DELAI_SAUVEGARDE)
      enAttente.current.set(chemin, { timer, valeur })
      majEtatSauvegarde()
    },
    [envoyer, majEtatSauvegarde],
  )

  const viderAttente = useCallback(
    (options) => {
      for (const [chemin, { timer, valeur }] of enAttente.current) {
        clearTimeout(timer)
        envoyer(chemin, valeur, options)
      }
      enAttente.current.clear()
    },
    [envoyer],
  )

  /** Modifie un fichier : cle = referentiel | exercices | eleves | suivi | seances. */
  const modifier = useCallback(
    (cle, fn) => {
      const ancien = donneesRef.current[cle]
      const nouveau = typeof fn === 'function' ? fn(ancien) : fn
      if (nouveau === ancien) return
      donneesRef.current = { ...donneesRef.current, [cle]: nouveau }
      setDonnees(donneesRef.current)
      planifier(cheminDe(cle, eleveIdRef.current), nouveau)
    },
    [planifier],
  )

  // Chargement du contenu commun.
  useEffect(() => {
    let annule = false
    ;(async () => {
      try {
        const [referentiel, exercices, eleves] = await Promise.all([
          lireJSON('referentiel.json'),
          lireJSON('exercices.json'),
          lireJSON('eleves.json'),
        ])
        if (annule) return
        if (!referentiel) throw new Error('data/referentiel.json est introuvable.')
        const listeEleves = eleves || { eleves: [] }
        donneesRef.current = {
          ...donneesRef.current,
          referentiel,
          exercices: exercices || { bases: {}, exercices: [] },
          eleves: listeEleves,
        }
        setDonnees(donneesRef.current)
        const memorise = lireEleveMemorise()
        const choisi = listeEleves.eleves.find((e) => e.id === memorise) || listeEleves.eleves[0]
        if (choisi) {
          setEleveIdState(choisi.id)
        } else {
          setChargement({ etat: 'pret', message: '' })
        }
      } catch (e) {
        if (!annule) setChargement({ etat: 'erreur', message: e.message })
      }
    })()
    return () => {
      annule = true
    }
  }, [])

  // Chargement du suivi de l'élève choisi.
  useEffect(() => {
    if (!eleveId) return
    let annule = false
    eleveIdRef.current = eleveId
    try {
      localStorage.setItem(CLE_ELEVE, eleveId)
    } catch {
      /* stockage indisponible : sans conséquence */
    }
    setChargement({ etat: 'chargement', message: '' })
    ;(async () => {
      try {
        const [suivi, seances] = await Promise.all([
          lireJSON(`eleves/${eleveId}/suivi.json`),
          lireJSON(`eleves/${eleveId}/seances.json`),
        ])
        if (annule) return
        donneesRef.current = {
          ...donneesRef.current,
          suivi: { ...suiviVide(), ...(suivi || {}) },
          seances: { ...seancesVides(), ...(seances || {}) },
        }
        setDonnees(donneesRef.current)
        setChargement({ etat: 'pret', message: '' })
      } catch (e) {
        if (!annule) setChargement({ etat: 'erreur', message: e.message })
      }
    })()
    return () => {
      annule = true
    }
  }, [eleveId])

  const choisirEleve = useCallback(
    (id) => {
      if (id === eleveIdRef.current) return
      viderAttente() // les modifications en cours partent vers l'ancien élève
      setEleveIdState(id)
    },
    [viderAttente],
  )

  // Ne rien perdre si on ferme l'onglet juste après une modification.
  useEffect(() => {
    const avantFermeture = (e) => {
      if (enAttente.current.size > 0) {
        viderAttente({ keepalive: true })
        e.preventDefault()
      }
    }
    window.addEventListener('beforeunload', avantFermeture)
    return () => window.removeEventListener('beforeunload', avantFermeture)
  }, [viderAttente])

  const eleve = donnees.eleves?.eleves.find((e) => e.id === eleveId) || null

  const valeur = {
    ...donnees,
    eleveId,
    eleve,
    chargement,
    sauvegarde,
    modifier,
    choisirEleve,
  }

  return <StoreContext.Provider value={valeur}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore doit être utilisé dans <StoreProvider>')
  return ctx
}
