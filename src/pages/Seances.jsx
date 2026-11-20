import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarDays, Flag, Plus, Trash2, X } from 'lucide-react'
import { useStore } from '../store.jsx'
import { useActions } from '../actions.js'
import { Entete, FormulaireNote, Note, Resultat, Tag } from '../components/ui.jsx'
import { dernierResultat, formatDate, nouvelId, trierParDateDesc, trouverCompetence } from '../lib/outils.js'

/** Date de séance : « Date à fixer » tant qu'elle est vide, champ date au clic. */
function ChampDate({ id, valeur, onChange }) {
  const [edition, setEdition] = useState(false)
  if (!edition) {
    return (
      <button type="button" id={id} className="btn btn--fantome btn--petit" onClick={() => setEdition(true)}>
        {valeur ? formatDate(valeur, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : 'Date à fixer'}
      </button>
    )
  }
  return (
    <input
      id={id}
      className="en-ligne"
      type="date"
      autoFocus
      value={valeur || ''}
      onChange={(e) => onChange(e.target.value)}
      onClick={(e) => e.currentTarget.showPicker?.()}
      onBlur={() => setEdition(false)}
    />
  )
}

function ListeExercicesSeance({ titre, ids, onChange, idListe }) {
  const { exercices, suivi } = useStore()
  const parId = Object.fromEntries(exercices.exercices.map((e) => [e.id, e]))
  const disponibles = exercices.exercices.filter((e) => !ids.includes(e.id))

  return (
    <div>
      <div className="sous-titre" style={{ display: 'flex', justifyContent: 'space-between' }}>
        {titre}
        <span className="discret tnum" style={{ fontWeight: 400 }}>
          {ids.length}
        </span>
      </div>
      {ids.length === 0 && <p className="vide">Aucun exercice.</p>}
      <ul className="lignes">
        {ids.map((id) => {
          const ex = parId[id]
          return (
            <li key={id}>
              {ex ? (
                <Link className="ligne__titre" to={`/exercices/${id}`}>
                  <span className="id">{id}</span>
                  <span>{ex.titre}</span>
                </Link>
              ) : (
                <span className="ligne__titre discret">
                  <span className="id">{id}</span>
                  <span>Exercice supprimé</span>
                </span>
              )}
              <span className="boutons" style={{ flexWrap: 'nowrap', gap: 4 }}>
                <Resultat resultat={dernierResultat(suivi, id)} />
                <button
                  type="button"
                  className="btn btn--fantome btn--icone no-print"
                  aria-label={`Retirer ${id}`}
                  title="Retirer"
                  onClick={() => onChange(ids.filter((x) => x !== id))}
                >
                  <X size={15} className="icone" aria-hidden="true" />
                </button>
              </span>
            </li>
          )
        })}
      </ul>
      <div className="champ no-print" style={{ marginTop: 8 }}>
        <label htmlFor={idListe} className="sr-only">
          Ajouter un exercice : {titre}
        </label>
        <select id={idListe} value="" onChange={(e) => e.target.value && onChange([...ids, e.target.value])}>
          <option value="">Ajouter un exercice…</option>
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
    <section className={`carte seance${seance.faite ? ' seance--faite' : ''}`} aria-labelledby={`${idBase}-titre`}>
      <div className="seance__tete">
        <span className="seance__numero" id={`${idBase}-titre`} aria-label={`Séance ${seance.numero}`}>
          {seance.numero}
        </span>
        <div className="seance__titre">
          <label htmlFor={`${idBase}-nom`} className="sr-only">
            Titre de la séance
          </label>
          <textarea
            id={`${idBase}-nom`}
            className="en-ligne auto-hauteur"
            rows={1}
            value={seance.titre}
            onChange={(e) => maj({ titre: e.target.value.replace(/\n/g, ' ') })}
            onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}
          />
        </div>
        <label className="case">
          <input type="checkbox" checked={!!seance.faite} onChange={(e) => maj({ faite: e.target.checked })} />
          Faite
        </label>
      </div>

      <div className="seance__props">
        <span className="prop-inline">
          <CalendarDays size={15} className="icone" aria-hidden="true" />
          <span className="sr-only">Date :</span>
          <ChampDate id={`${idBase}-date`} valeur={seance.date} onChange={(date) => maj({ date })} />
        </span>
        {(eleve.examens || []).length > 0 && (
          <span className="prop-inline">
            <Flag size={15} className="icone" aria-hidden="true" />
            <label htmlFor={`${idBase}-examen`} className="sr-only">
              Examen visé
            </label>
            <select id={`${idBase}-examen`} className="en-ligne" value={seance.examen || ''} onChange={(e) => maj({ examen: e.target.value || null })}>
              <option value="">Aucun examen</option>
              {eleve.examens.map((x) => (
                <option key={x.id} value={x.id}>
                  {x.titre}
                </option>
              ))}
            </select>
          </span>
        )}
        <Tag couleur={seance.faite ? 'vert' : ''}>{seance.faite ? 'Faite' : 'À venir'}</Tag>
      </div>

      <div className="seance__corps">
        <div className="grille grille--2" style={{ gap: 28 }}>
          <div className="champ">
            <label htmlFor={`${idBase}-obj`}>Objectifs, un par ligne</label>
            <textarea
              id={`${idBase}-obj`}
              className="en-ligne auto-hauteur"
              rows={3}
              value={(seance.objectifs || []).join('\n')}
              onChange={(e) => maj({ objectifs: e.target.value.split('\n') })}
              onBlur={() => maj({ objectifs: (seance.objectifs || []).map((o) => o.trim()).filter(Boolean) })}
            />
          </div>
          <div className="champ">
            <span className="label" id={`${idBase}-comp`}>
              Compétences visées
            </span>
            <div className="boutons" style={{ gap: 6 }} role="list" aria-labelledby={`${idBase}-comp`}>
              {(seance.competences || []).map((cid) => {
                const c = trouverCompetence(referentiel, cid)
                return (
                  <span key={cid} role="listitem" className="tag tag--theme" style={{ '--c': c?.theme.couleur || '#787774' }}>
                    {c ? c.label : cid}
                    <button
                      type="button"
                      className="tag__retirer no-print"
                      aria-label={`Retirer ${c?.label || cid}`}
                      onClick={() => maj({ competences: seance.competences.filter((x) => x !== cid) })}
                    >
                      <X size={12} className="icone" aria-hidden="true" />
                    </button>
                  </span>
                )
              })}
              {(seance.competences || []).length === 0 && <span className="vide">Aucune.</span>}
            </div>
            <label htmlFor={`${idBase}-ajout-comp`} className="sr-only">
              Ajouter une compétence visée
            </label>
            <select
              id={`${idBase}-ajout-comp`}
              className="no-print"
              style={{ marginTop: 4 }}
              value=""
              onChange={(e) => e.target.value && maj({ competences: [...(seance.competences || []), e.target.value] })}
            >
              <option value="">Ajouter une compétence…</option>
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

        <div className="grille grille--2" style={{ gap: 28 }}>
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

        <div>
          <div className="sous-titre">Notes de la séance</div>
          {notes.length === 0 && <p className="vide">Aucune note. Ajoute un blocage ou un déclic sans quitter la page.</p>}
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

        <div className="champ">
          <label htmlFor={`${idBase}-bilan`}>Bilan de la séance</label>
          <textarea
            id={`${idBase}-bilan`}
            className="en-ligne auto-hauteur"
            rows={3}
            value={seance.bilan || ''}
            onChange={(e) => maj({ bilan: e.target.value })}
            placeholder="Ce qui a marché, ce qui reste à revoir, la suite."
          />
        </div>

        <div className="boutons no-print" style={{ justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn--danger btn--petit" onClick={onSupprimer}>
            <Trash2 size={14} className="icone" aria-hidden="true" />
            Supprimer la séance
          </button>
        </div>
      </div>
    </section>
  )
}

export default function Seances() {
  const { seances, modifier, eleve } = useStore()
  const liste = seances.seances
  const faites = liste.filter((s) => s.faite).length

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
      <Entete
        icone={CalendarDays}
        titre="Séances"
        sousTitre="Préparer chaque séance, noter ce qui se passe pendant, puis en faire le bilan."
        proprietes={
          <Tag grand>
            {faites} faite{faites > 1 ? 's' : ''} sur {liste.length}
          </Tag>
        }
      >
        <button type="button" className="btn" onClick={ajouter}>
          <Plus size={15} className="icone" aria-hidden="true" />
          Ajouter une séance
        </button>
      </Entete>
      {liste.length === 0 && (
        <div className="carte" style={{ padding: '28px 24px' }}>
          <p className="vide">Aucune séance. Ajoute la première.</p>
        </div>
      )}
      {liste.map((s) => (
        <Seance key={s.id} seance={s} onChange={changer} onSupprimer={() => supprimer(s)} />
      ))}
    </>
  )
}
