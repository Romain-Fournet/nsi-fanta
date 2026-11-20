import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../store.jsx'
import { Difficulte, Entete, EtiquetteTheme, Resultat, TypeExercice } from '../components/ui.jsx'
import { TYPES_EXERCICE, dernierResultat, statutExercice } from '../lib/outils.js'

const STATUTS = {
  tous: 'Tous',
  afaire: 'À faire',
  reussi: 'Réussi seule',
  arefaire: 'À refaire',
}

export default function Exercices() {
  const { referentiel, exercices, suivi } = useStore()
  const [theme, setTheme] = useState('')
  const [type, setType] = useState('')
  const [statut, setStatut] = useState('tous')

  const themes = Object.fromEntries(referentiel.themes.map((t) => [t.id, t]))
  const liste = exercices.exercices.filter(
    (e) =>
      (!theme || e.theme === theme) &&
      (!type || e.type === type) &&
      (statut === 'tous' || statutExercice(suivi, e.id) === statut),
  )

  return (
    <>
      <Entete titre="Exercices" sousTitre={`${exercices.exercices.length} exercices, du « lire » vers l’« écrire ».`}>
        <Link className="btn btn--clair" to="/exercices/nouveau">
          + Nouvel exercice
        </Link>
      </Entete>

      <div className="feuille">
        <div className="champs no-print" style={{ marginBottom: 14 }}>
          <div className="champ">
            <label htmlFor="f-theme">Thème</label>
            <select id="f-theme" value={theme} onChange={(e) => setTheme(e.target.value)}>
              <option value="">Tous les thèmes</option>
              {referentiel.themes.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.titre}
                </option>
              ))}
            </select>
          </div>
          <div className="champ">
            <label htmlFor="f-type">Type</label>
            <select id="f-type" value={type} onChange={(e) => setType(e.target.value)}>
              <option value="">Tous les types</option>
              {Object.entries(TYPES_EXERCICE).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </div>
          <div className="champ">
            <span className="petit discret" id="f-statut">
              Statut
            </span>
            <div className="segments" role="group" aria-labelledby="f-statut">
              {Object.entries(STATUTS).map(([k, v]) => (
                <button key={k} type="button" aria-pressed={statut === k} onClick={() => setStatut(k)}>
                  {v}
                </button>
              ))}
            </div>
          </div>
        </div>

        {liste.length === 0 ? (
          <p className="vide">Aucun exercice ne correspond à ces filtres.</p>
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
                      <Link to={`/exercices/${e.id}`}>
                        <code className="inline">{e.id}</code> {e.titre}
                      </Link>
                      {e.papier && <span className="etiquette" style={{ marginLeft: 6 }}>papier d’abord</span>}
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
                    <td className="num">{e.duree} min</td>
                    <td>
                      <Resultat resultat={dernierResultat(suivi, e.id)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}
