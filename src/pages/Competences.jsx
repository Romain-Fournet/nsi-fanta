import { useState } from 'react'
import { useStore } from '../store.jsx'
import { useActions } from '../actions.js'
import { Echelle, Entete, FormulaireNote, LegendeNiveaux, LigneExercice, Note } from '../components/ui.jsx'
import { formatDate, niveauDe, trierParDateDesc } from '../lib/outils.js'

const FILTRES = [
  { id: 'tout', label: 'Tout' },
  { id: 'retravailler', label: 'À retravailler' },
  { id: 'pasvu', label: 'Pas vu' },
  { id: 'maitrise', label: 'Maîtrisé' },
]

function garder(filtre, niv) {
  if (filtre === 'retravailler') return [1, 2].includes(niv.lire) || [1, 2].includes(niv.ecrire)
  if (filtre === 'pasvu') return niv.lire === 0 && niv.ecrire === 0
  if (filtre === 'maitrise') return niv.lire === 4 && niv.ecrire === 4
  return true
}

function LigneCompetence({ competence }) {
  const { referentiel, suivi, exercices } = useStore()
  const { fixerNiveau, ajouterNote, modifierNote, supprimerNote } = useActions()
  const [ouvert, setOuvert] = useState(false)
  const niv = niveauDe(suivi, competence.id)
  const notes = trierParDateDesc(suivi.notes.filter((n) => n.competence === competence.id))
  const blocages = notes.filter((n) => n.type === 'blocage' && !n.resolue).length
  const lies = exercices.exercices.filter((e) => e.competences?.includes(competence.id))
  const historique = [...(suivi.competences[competence.id]?.historique || [])].reverse()
  const labelNiveau = (v) => referentiel.niveaux.find((n) => n.valeur === v)?.label ?? v
  const idDetail = `detail-${competence.id}`

  return (
    <div className="comp">
      <div className="comp__ligne">
        <button
          type="button"
          className="comp__libelle"
          aria-expanded={ouvert}
          aria-controls={idDetail}
          onClick={() => setOuvert(!ouvert)}
        >
          {competence.label}
        </button>
        <Echelle
          axe="lire"
          valeur={niv.lire}
          niveaux={referentiel.niveaux}
          libelleCompetence={competence.label}
          onChange={(v) => fixerNiveau(competence.id, 'lire', v)}
        />
        <Echelle
          axe="ecrire"
          valeur={niv.ecrire}
          niveaux={referentiel.niveaux}
          libelleCompetence={competence.label}
          onChange={(v) => fixerNiveau(competence.id, 'ecrire', v)}
        />
        <span className={`comp__nb${blocages ? ' comp__nb--blocage' : ''}`}>
          {notes.length === 0
            ? 'aucune note'
            : `${notes.length} note${notes.length > 1 ? 's' : ''}${blocages ? ` · ${blocages} bloc.` : ''}`}
        </span>
      </div>

      {ouvert && (
        <div className="comp__detail" id={idDetail}>
          <div>
            <h4>Notes</h4>
            {notes.length === 0 && <p className="vide">Aucune note pour l’instant.</p>}
            {notes.map((n) => (
              <Note
                key={n.id}
                note={n}
                onResolue={(v) => modifierNote(n.id, { resolue: v })}
                onSupprimer={() => {
                  if (window.confirm('Supprimer cette note ?')) supprimerNote(n.id)
                }}
              />
            ))}
            <FormulaireNote competenceFixe={competence.id} onAjout={ajouterNote} />
          </div>
          <div className="pile">
            <div>
              <h4>Exercices liés</h4>
              {lies.length === 0 ? (
                <p className="vide">Aucun exercice.</p>
              ) : (
                <ul className="liste-simple">
                  {lies.map((e) => (
                    <LigneExercice key={e.id} exercice={e} suivi={suivi} />
                  ))}
                </ul>
              )}
            </div>
            <div>
              <h4>Historique des niveaux</h4>
              {historique.length === 0 ? (
                <p className="vide">Pas encore évaluée.</p>
              ) : (
                <ul className="liste-simple petit">
                  {historique.map((h, i) => (
                    <li key={i}>
                      <span>
                        {h.axe === 'lire' ? 'Lire' : 'Écrire'} : {labelNiveau(h.ancien)} → <strong>{labelNiveau(h.nouveau)}</strong>
                      </span>
                      <span className="discret">{formatDate(h.date, { day: 'numeric', month: 'short' })}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function Competences() {
  const { referentiel, suivi, eleve } = useStore()
  const [filtre, setFiltre] = useState('tout')
  const total = referentiel.themes.reduce((s, t) => s + t.competences.filter((c) => !c.archive).length, 0)

  return (
    <>
      <Entete
        titre="Compétences"
        sousTitre={`${total} compétences évaluées sur deux axes, lire et écrire, pour ${eleve.prenom}.`}
      />

      <div className="boutons no-print" style={{ justifyContent: 'space-between', marginBottom: 16 }}>
        <div className="segments" role="group" aria-label="Filtrer les compétences">
          {FILTRES.map((f) => (
            <button key={f.id} type="button" aria-pressed={filtre === f.id} onClick={() => setFiltre(f.id)}>
              {f.label}
            </button>
          ))}
        </div>
        <LegendeNiveaux niveaux={referentiel.niveaux} />
      </div>

      {referentiel.themes.map((theme) => {
        const comps = theme.competences.filter((c) => !c.archive && garder(filtre, niveauDe(suivi, c.id)))
        if (!comps.length) return null
        return (
          <section key={theme.id} className="feuille theme-bloc" style={{ '--couleur': theme.couleur }}>
            <h2 className="theme-bloc__titre">{theme.titre}</h2>
            {comps.map((c) => (
              <LigneCompetence key={c.id} competence={c} />
            ))}
          </section>
        )
      })}
      {referentiel.themes.every(
        (t) => !t.competences.some((c) => !c.archive && garder(filtre, niveauDe(suivi, c.id))),
      ) && <p className="vide">Aucune compétence dans ce filtre.</p>}
    </>
  )
}
