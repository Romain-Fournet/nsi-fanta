import { Link } from 'react-router-dom'
import { useStore } from '../store.jsx'
import { useActions } from '../actions.js'
import { Entete, FormulaireNote, Note, Resultat } from '../components/ui.jsx'
import { dernierResultat, nouvelId, trierParDateDesc, trouverCompetence } from '../lib/outils.js'

function ListeExercicesSeance({ titre, ids, onChange, idListe }) {
  const { exercices, suivi } = useStore()
  const parId = Object.fromEntries(exercices.exercices.map((e) => [e.id, e]))
  const disponibles = exercices.exercices.filter((e) => !ids.includes(e.id))

  return (
    <div>
      <h3>{titre}</h3>
      {ids.length === 0 && <p className="vide">Aucun exercice.</p>}
      <ul className="liste-simple">
        {ids.map((id) => {
          const ex = parId[id]
          return (
            <li key={id}>
              <span>
                {ex ? (
                  <Link to={`/exercices/${id}`}>
                    <code className="inline">{id}</code> {ex.titre}
                  </Link>
                ) : (
                  <span className="discret">
                    <code className="inline">{id}</code> (exercice supprimé)
                  </span>
                )}
              </span>
              <span className="boutons">
                <Resultat resultat={dernierResultat(suivi, id)} />
                <button
                  type="button"
                  className="btn btn--petit btn--clair no-print"
                  aria-label={`Retirer ${id}`}
                  title="Retirer"
                  onClick={() => onChange(ids.filter((x) => x !== id))}
                >
                  ✕
                </button>
              </span>
            </li>
          )
        })}
      </ul>
      <div className="champ no-print" style={{ marginTop: 6 }}>
        <label htmlFor={idListe} className="sr-only">
          Ajouter un exercice : {titre}
        </label>
        <select
          id={idListe}
          value=""
          onChange={(e) => e.target.value && onChange([...ids, e.target.value])}
        >
          <option value="">+ Ajouter un exercice…</option>
          {disponibles.map((e) => (
            <option key={e.id} value={e.id}>
              {e.id} — {e.titre}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}

function Seance({ seance, onChange, onSupprimer }) {
  const { referentiel, suivi, eleve } = useStore()
  const { ajouterNote, modifierNote, supprimerNote } = useActions()
  const maj = (champs) => onChange({ ...seance, ...champs })
  const notes = trierParDateDesc(suivi.notes.filter((n) => n.seance === seance.id))
  const idBase = `s-${seance.id}`

  return (
    <section className={`feuille seance${seance.faite ? ' seance--faite' : ''}`} aria-labelledby={`${idBase}-titre`}>
      <div className="seance__entete">
        <h2 id={`${idBase}-titre`} style={{ margin: 0, display: 'flex', alignItems: 'baseline', flex: '1 1 320px' }}>
          <span className="seance__numero">{seance.numero}.</span>
          <input
            type="text"
            aria-label="Titre de la séance"
            value={seance.titre}
            onChange={(e) => maj({ titre: e.target.value })}
            style={{ fontWeight: 700, fontSize: '1.1rem' }}
          />
        </h2>
        <div className="boutons">
          <div className="champ">
            <label htmlFor={`${idBase}-date`} className="sr-only">
              Date
            </label>
            <input id={`${idBase}-date`} type="date" value={seance.date || ''} onChange={(e) => maj({ date: e.target.value })} />
          </div>
          {(eleve.examens || []).length > 0 && (
            <div className="champ">
              <label htmlFor={`${idBase}-examen`} className="sr-only">
                Examen visé
              </label>
              <select id={`${idBase}-examen`} value={seance.examen || ''} onChange={(e) => maj({ examen: e.target.value || null })}>
                <option value="">Aucun examen</option>
                {eleve.examens.map((x) => (
                  <option key={x.id} value={x.id}>
                    {x.titre}
                  </option>
                ))}
              </select>
            </div>
          )}
          <label className="case">
            <input type="checkbox" checked={!!seance.faite} onChange={(e) => maj({ faite: e.target.checked })} />
            Faite
          </label>
        </div>
      </div>

      <div className="grille grille--2">
        <div className="champ">
          <label htmlFor={`${idBase}-obj`}>Objectifs (un par ligne)</label>
          <textarea
            id={`${idBase}-obj`}
            rows={4}
            value={(seance.objectifs || []).join('\n')}
            onChange={(e) => maj({ objectifs: e.target.value.split('\n') })}
            onBlur={() => maj({ objectifs: (seance.objectifs || []).map((o) => o.trim()).filter(Boolean) })}
          />
        </div>
        <div>
          <span className="petit discret" id={`${idBase}-comp`}>
            Compétences visées
          </span>
          <div className="boutons" style={{ marginTop: 4 }} aria-labelledby={`${idBase}-comp`}>
            {(seance.competences || []).map((cid) => {
              const c = trouverCompetence(referentiel, cid)
              return (
                <span key={cid} className="etiquette" style={{ color: c?.theme.couleur }}>
                  {c ? c.label : cid}
                  <button
                    type="button"
                    className="no-print"
                    style={{ border: 0, background: 'none', cursor: 'pointer', color: 'inherit', padding: '0 0 0 2px' }}
                    aria-label={`Retirer ${c?.label || cid}`}
                    onClick={() => maj({ competences: seance.competences.filter((x) => x !== cid) })}
                  >
                    ✕
                  </button>
                </span>
              )
            })}
          </div>
          <label htmlFor={`${idBase}-ajout-comp`} className="sr-only">
            Ajouter une compétence visée
          </label>
          <select
            id={`${idBase}-ajout-comp`}
            className="no-print"
            style={{ marginTop: 6 }}
            value=""
            onChange={(e) => e.target.value && maj({ competences: [...(seance.competences || []), e.target.value] })}
          >
            <option value="">+ Ajouter une compétence…</option>
            {referentiel.themes.map((t) => (
              <optgroup key={t.id} label={t.court}>
                {t.competences
                  .filter((c) => !c.archive && !(seance.competences || []).includes(c.id))
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
              </optgroup>
            ))}
          </select>
        </div>
      </div>

      <div className="grille grille--2" style={{ marginTop: 18 }}>
        <ListeExercicesSeance
          titre="En séance"
          idListe={`${idBase}-ex`}
          ids={seance.exercices || []}
          onChange={(exercices) => maj({ exercices })}
        />
        <ListeExercicesSeance
          titre="Devoirs"
          idListe={`${idBase}-dev`}
          ids={seance.devoirs || []}
          onChange={(devoirs) => maj({ devoirs })}
        />
      </div>

      <div style={{ marginTop: 18 }}>
        <h3>Notes de la séance</h3>
        {notes.length === 0 && <p className="vide">Aucune note.</p>}
        {notes.map((n) => (
          <Note
            key={n.id}
            note={n}
            avecCompetence
            competence={trouverCompetence(referentiel, n.competence)}
            onResolue={(v) => modifierNote(n.id, { resolue: v })}
            onSupprimer={() => window.confirm('Supprimer cette note ?') && supprimerNote(n.id)}
          />
        ))}
        <div className="no-print">
          <FormulaireNote seanceId={seance.id} onAjout={ajouterNote} />
        </div>
      </div>

      <div className="champ" style={{ marginTop: 18 }}>
        <label htmlFor={`${idBase}-bilan`}>Bilan de la séance</label>
        <textarea
          id={`${idBase}-bilan`}
          rows={4}
          value={seance.bilan || ''}
          onChange={(e) => maj({ bilan: e.target.value })}
          placeholder="Ce qui a marché, ce qui reste à revoir, la suite."
        />
      </div>

      <div className="boutons no-print" style={{ justifyContent: 'flex-end', marginTop: 12 }}>
        <button type="button" className="btn btn--danger btn--petit" onClick={onSupprimer}>
          Supprimer la séance
        </button>
      </div>
    </section>
  )
}

export default function Seances() {
  const { seances, modifier, eleve } = useStore()
  const liste = seances.seances

  const changer = (s) => modifier('seances', (d) => ({ ...d, seances: d.seances.map((x) => (x.id === s.id ? s : x)) }))

  const ajouter = () =>
    modifier('seances', (d) => {
      const numero = d.seances.reduce((m, s) => Math.max(m, s.numero || 0), 0) + 1
      const examen = [...(eleve.examens || [])].sort((a, b) => (a.date || '9').localeCompare(b.date || '9'))[0]
      return {
        ...d,
        seances: [
          ...d.seances,
          {
            id: nouvelId('seance'),
            numero,
            date: '',
            titre: `Séance ${numero}`,
            examen: examen?.id || null,
            objectifs: [],
            competences: [],
            exercices: [],
            devoirs: [],
            faite: false,
            bilan: '',
          },
        ],
      }
    })

  const supprimer = (s) => {
    if (!window.confirm(`Supprimer la séance ${s.numero} « ${s.titre} » ? Ses notes restent dans le suivi.`)) return
    modifier('seances', (d) => ({ ...d, seances: d.seances.filter((x) => x.id !== s.id) }))
  }

  return (
    <>
      <Entete titre="Séances" sousTitre="Préparer chaque séance, puis en faire le bilan.">
        <button type="button" className="btn" onClick={ajouter}>
          + Ajouter une séance
        </button>
      </Entete>
      {liste.length === 0 && <p className="vide">Aucune séance. Ajoute la première.</p>}
      {liste.map((s) => (
        <Seance key={s.id} seance={s} onChange={changer} onSupprimer={() => supprimer(s)} />
      ))}
    </>
  )
}
