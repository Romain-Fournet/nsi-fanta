import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FileQuestion, PenLine, Plus, SquareCode } from 'lucide-react'
import { useStore } from '../store.jsx'
import { Difficulte, Entete, EtiquetteTheme, Resultat, TypeExercice } from '../components/ui.jsx'
import { TYPES_EXERCICE, dernierResultat, statutExercice } from '../lib/outils.js'

const STATUTS = {
  tous: 'Tous',
  afaire: 'À faire',
  reussi: 'Réussis seule',
  arefaire: 'À refaire',
}

export default function Exercices() {
  const { referentiel, exercices, suivi } = useStore()
  const [theme, setTheme] = useState('')
  const [type, setType] = useState('')
  const [statut, setStatut] = useState('tous')

  const themes = Object.fromEntries(referentiel.themes.map((t) => [t.id, t]))
  const filtres = (s) =>
    exercices.exercices.filter(
      (e) =>
        (!theme || e.theme === theme) &&
        (!type || e.type === type) &&
        (s === 'tous' || statutExercice(suivi, e.id) === s),
    )
  const liste = filtres(statut)

  return (
    <>
      <Entete
        icone={SquareCode}
        titre="Exercices"
        sousTitre="Du plus simple au plus exigeant : lire et prédire, suivre une trace, trouver le bug, compléter, écrire."
      >
        <Link className="btn btn--clair" to="/exercices/nouveau">
          <Plus size={15} className="icone" aria-hidden="true" />
          Nouvel exercice
        </Link>
      </Entete>

      <div className="vues no-print" role="group" aria-label="Filtrer par statut">
        {Object.entries(STATUTS).map(([k, v]) => (
          <button key={k} type="button" aria-pressed={statut === k} onClick={() => setStatut(k)}>
            {v}
            <span className="vues__compte">{filtres(k).length}</span>
          </button>
        ))}
      </div>

      <section className="carte">
        <div className="filtres no-print">
          <label className="sr-only" htmlFor="f-theme">
            Thème
          </label>
          <select id="f-theme" value={theme} onChange={(e) => setTheme(e.target.value)}>
            <option value="">Tous les thèmes</option>
            {referentiel.themes.map((t) => (
              <option key={t.id} value={t.id}>
                {t.titre}
              </option>
            ))}
          </select>
          <label className="sr-only" htmlFor="f-type">
            Type
          </label>
          <select id="f-type" value={type} onChange={(e) => setType(e.target.value)}>
            <option value="">Tous les types</option>
            {Object.entries(TYPES_EXERCICE).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
          <span className="petit discret" style={{ marginLeft: 'auto' }}>
            {liste.length} exercice{liste.length > 1 ? 's' : ''}
          </span>
        </div>

        {liste.length === 0 ? (
          <div style={{ padding: '36px 20px', textAlign: 'center' }}>
            <FileQuestion size={22} className="icone discret" aria-hidden="true" />
            <p className="vide" style={{ marginTop: 8 }}>
              Aucun exercice ne correspond à ces filtres.
            </p>
          </div>
        ) : (
          <div className="defile">
            <table className="tableau">
              <thead>
                <tr>
                  <th>Exercice</th>
                  <th>Thème</th>
                  <th>Type</th>
                  <th>Difficulté</th>
                  <th className="num">Durée</th>
                  <th>Dernier résultat</th>
                </tr>
              </thead>
              <tbody>
                {liste.map((e) => (
                  <tr key={e.id}>
                    <td>
                      <span className="ligne__titre">
                        <span className="id">{e.id}</span>
                        <Link to={`/exercices/${e.id}`}>{e.titre}</Link>
                        {e.papier && (
                          <span title="Sur papier d’abord" aria-label="Sur papier d’abord" style={{ display: 'inline-flex' }}>
                            <PenLine size={14} className="icone discret" aria-hidden="true" />
                          </span>
                        )}
                      </span>
                    </td>
                    <td>
                      <EtiquetteTheme theme={themes[e.theme]} />
                    </td>
                    <td>
                      <TypeExercice type={e.type} />
                    </td>
                    <td>
                      <Difficulte valeur={e.difficulte} />
                    </td>
                    <td className="num discret">{e.duree} min</td>
                    <td>
                      <Resultat resultat={dernierResultat(suivi, e.id)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  )
}
