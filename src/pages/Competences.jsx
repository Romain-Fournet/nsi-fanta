import { useState } from 'react'
import { ChevronRight, Target } from 'lucide-react'
import { useStore } from '../store.jsx'
import { useActions } from '../actions.js'
import { Echelle, Entete, FormulaireNote, LegendeNiveaux, LigneExercice, Note, Tag } from '../components/ui.jsx'
import { formatDateCourte, niveauDe, progressionTheme, trierParDateDesc } from '../lib/outils.js'

const FILTRES = [
  { id: 'tout', label: 'Toutes' },
  { id: 'retravailler', label: 'À retravailler' },
  { id: 'pasvu', label: 'Pas vues' },
  { id: 'maitrise', label: 'Maîtrisées' },
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
          <ChevronRight size={15} className="icone" aria-hidden="true" />
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
        <span className="comp__nb">
          {blocages > 0 ? (
            <Tag couleur="rouge">
              {blocages} blocage{blocages > 1 ? 's' : ''}
            </Tag>
          ) : notes.length > 0 ? (
            <Tag>
              {notes.length} note{notes.length > 1 ? 's' : ''}
            </Tag>
          ) : null}
        </span>
      </div>

      {ouvert && (
        <div className="comp__detail" id={idDetail}>
          <div>
            <div className="sous-titre">Notes</div>
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
          <div className="pile" style={{ gap: 22 }}>
            <div>
              <div className="sous-titre">Exercices liés</div>
              {lies.length === 0 ? (
                <p className="vide">Aucun exercice.</p>
              ) : (
                <ul className="lignes">
                  {lies.map((e) => (
                    <LigneExercice key={e.id} exercice={e} suivi={suivi} />
                  ))}
                </ul>
              )}
            </div>
            <div>
              <div className="sous-titre">Historique des niveaux</div>
              {historique.length === 0 ? (
                <p className="vide">Pas encore évaluée.</p>
              ) : (
                <ul className="lignes petit">
                  {historique.map((h, i) => (
                    <li key={i}>
                      <span>
                        <span className="discret">{h.axe === 'lire' ? 'Lire' : 'Écrire'} · </span>
                        {labelNiveau(h.ancien)} → <strong style={{ fontWeight: 600 }}>{labelNiveau(h.nouveau)}</strong>
                      </span>
                      <span className="discret">{formatDateCourte(h.date)}</span>
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
  const actives = referentiel.themes.flatMap((t) => t.competences.filter((c) => !c.archive))
  const compte = (f) => actives.filter((c) => garder(f, niveauDe(suivi, c.id))).length

  const themes = referentiel.themes
    .map((theme) => ({ theme, comps: theme.competences.filter((c) => !c.archive && garder(filtre, niveauDe(suivi, c.id))) }))
    .filter((t) => t.comps.length)

  return (
    <>
      <Entete
        icone={Target}
        titre="Compétences"
        sousTitre={`${actives.length} compétences, chacune évaluée sur deux axes : lire du code et en écrire. Clique un segment pour fixer le niveau de ${eleve.prenom}, reclique-le pour revenir à « pas vu ».`}
        proprietes={<LegendeNiveaux niveaux={referentiel.niveaux} />}
      />

      <div className="vues no-print" role="group" aria-label="Filtrer les compétences">
        {FILTRES.map((f) => (
          <button key={f.id} type="button" aria-pressed={filtre === f.id} onClick={() => setFiltre(f.id)}>
            {f.label}
            <span className="vues__compte">{compte(f.id)}</span>
          </button>
        ))}
      </div>

      {themes.map(({ theme, comps }) => (
        <section key={theme.id} className="carte theme-carte" style={{ '--c': theme.couleur }} aria-labelledby={`t-${theme.id}`}>
          <div className="carte__tete">
            <h2 className="carte__titre" id={`t-${theme.id}`}>
              <span className="theme-carte__icone" aria-hidden="true">
                <span className="point" />
              </span>
              {theme.titre}
            </h2>
            <span className="petit discret tnum">
              Lire {progressionTheme(theme, suivi, 'lire')} % · Écrire {progressionTheme(theme, suivi, 'ecrire')} %
            </span>
          </div>
          <div className="comp-entetes" aria-hidden="true">
            <span>Compétence</span>
            <span>Lire</span>
            <span>Écrire</span>
            <span style={{ justifySelf: 'end' }}>Notes</span>
          </div>
          {comps.map((c) => (
            <LigneCompetence key={c.id} competence={c} />
          ))}
        </section>
      ))}
      {themes.length === 0 && (
        <div className="carte" style={{ padding: '28px 24px' }}>
          <p className="vide">Aucune compétence dans cette vue.</p>
        </div>
      )}
    </>
  )
}
