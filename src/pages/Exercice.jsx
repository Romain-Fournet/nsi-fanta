import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useStore } from '../store.jsx'
import { useActions } from '../actions.js'
import {
  BlocCode,
  BoutonsBasthon,
  Difficulte,
  Enonce,
  Entete,
  EtiquetteTheme,
  Pastille,
  Resultat,
  TypeExercice,
} from '../components/ui.jsx'
import {
  MODES,
  RESULTATS,
  axeDuType,
  formatDate,
  niveauDe,
  niveauPropose,
  resultatsExercice,
  trouverCompetence,
} from '../lib/outils.js'

function FormulaireResultat({ exercice, onEnregistre }) {
  const [resultat, setResultat] = useState('')
  const [mode, setMode] = useState(exercice.papier || exercice.type === 'papier' ? 'papier' : 'basthon')
  const [duree, setDuree] = useState(exercice.duree || '')
  const [commentaire, setCommentaire] = useState('')

  const valider = (e) => {
    e.preventDefault()
    if (!resultat) return
    onEnregistre({
      exercice: exercice.id,
      resultat,
      mode,
      duree: duree === '' ? null : Number(duree),
      commentaire: commentaire.trim(),
    })
    setResultat('')
    setCommentaire('')
  }

  return (
    <form className="pile" onSubmit={valider}>
      <div className="boutons">
        <div className="segments" role="group" aria-label="Résultat">
          {Object.entries(RESULTATS).map(([k, v]) => (
            <button key={k} type="button" aria-pressed={resultat === k} onClick={() => setResultat(k)}>
              {v}
            </button>
          ))}
        </div>
        <div className="segments" role="group" aria-label="Mode">
          {Object.entries(MODES).map(([k, v]) => (
            <button key={k} type="button" aria-pressed={mode === k} onClick={() => setMode(k)}>
              {v}
            </button>
          ))}
        </div>
      </div>
      <div className="champs">
        <div className="champ" style={{ maxWidth: 140 }}>
          <label htmlFor="duree">Durée (min)</label>
          <input id="duree" type="number" min="0" value={duree} onChange={(e) => setDuree(e.target.value)} />
        </div>
        <div className="champ" style={{ gridColumn: 'span 3' }}>
          <label htmlFor="commentaire">Commentaire</label>
          <input
            id="commentaire"
            type="text"
            value={commentaire}
            onChange={(e) => setCommentaire(e.target.value)}
            placeholder="Ex. a trouvé seule après l’indice sur range"
          />
        </div>
      </div>
      <div>
        <button type="submit" className="btn" disabled={!resultat}>
          Enregistrer le résultat
        </button>
      </div>
    </form>
  )
}

function Propositions({ propositions, niveaux, onAppliquer, onIgnorer }) {
  const [choix, setChoix] = useState(() => propositions.map((p) => p.propose !== p.actuel))
  const label = (v) => niveaux.find((n) => n.valeur === v)?.label ?? v
  const aChanger = propositions.filter((p, i) => choix[i] && p.propose !== p.actuel)

  return (
    <div className="proposition" role="region" aria-label="Niveaux proposés">
      <h3>Mettre à jour les niveaux ?</h3>
      <ul className="liste-simple">
        {propositions.map((p, i) => (
          <li key={p.competence.id + p.axe} style={{ display: 'grid', gap: 2 }}>
            <label className="case">
              <input
                type="checkbox"
                checked={choix[i]}
                disabled={p.propose === p.actuel}
                onChange={(e) => setChoix(choix.map((c, j) => (j === i ? e.target.checked : c)))}
              />
              {p.competence.label}
              <span className="discret petit">({p.axe === 'lire' ? 'Lire' : 'Écrire'})</span>
            </label>
            <span className="petit" style={{ paddingLeft: 26 }}>
              <Pastille niveau={p.actuel} /> {label(p.actuel)} → <Pastille niveau={p.propose} /> <strong>{label(p.propose)}</strong>
            </span>
          </li>
        ))}
      </ul>
      <div className="boutons" style={{ marginTop: 10 }}>
        <button type="button" className="btn" disabled={!aChanger.length} onClick={() => onAppliquer(aChanger)}>
          Appliquer
        </button>
        <button type="button" className="btn btn--clair" onClick={onIgnorer}>
          Garder les niveaux actuels
        </button>
      </div>
    </div>
  )
}

// Une instance par exercice : les formulaires repartent à zéro quand on change d'exercice.
export default function Exercice() {
  const { id } = useParams()
  return <ExerciceDetail key={id} id={id} />
}

function ExerciceDetail({ id }) {
  const { referentiel, exercices, suivi } = useStore()
  const { ajouterResultat, supprimerResultat, fixerNiveau } = useActions()
  const [propositions, setPropositions] = useState(null)

  const exercice = exercices.exercices.find((e) => e.id === id)
  if (!exercice) {
    return (
      <div className="feuille">
        <h1>Exercice introuvable</h1>
        <p>
          Aucun exercice « {id} ». <Link to="/exercices">Retour à la liste</Link>
        </p>
      </div>
    )
  }

  const theme = referentiel.themes.find((t) => t.id === exercice.theme)
  const competences = (exercice.competences || []).map((c) => trouverCompetence(referentiel, c)).filter(Boolean)
  const essais = [...resultatsExercice(suivi, exercice.id)].reverse()
  const base = exercice.base ? exercices.bases?.[exercice.base] : null
  const axe = axeDuType(exercice.type)
  const index = exercices.exercices.indexOf(exercice)
  const suivant = exercices.exercices[index + 1]
  const precedent = exercices.exercices[index - 1]

  const enregistrer = (r) => {
    ajouterResultat(r)
    setPropositions(
      competences.map((c) => {
        const actuel = niveauDe(suivi, c.id)[axe]
        return { competence: c, axe, actuel, propose: niveauPropose(actuel, r.resultat) }
      }),
    )
  }

  return (
    <>
      <p className="petit no-print" style={{ margin: '0 0 8px' }}>
        <Link to="/exercices">← Tous les exercices</Link>
      </p>
      <Entete titre={exercice.titre}>
        <Link className="btn btn--clair btn--petit" to={`/exercices/${exercice.id}/modifier`}>
          Modifier
        </Link>
      </Entete>

      <div className="boutons" style={{ marginBottom: 16 }}>
        <code className="inline">{exercice.id}</code>
        <EtiquetteTheme theme={theme} />
        <TypeExercice type={exercice.type} />
        <Difficulte valeur={exercice.difficulte} />
        <span className="petit discret">{exercice.duree} min</span>
        {exercice.papier && <span className="etiquette">sur papier d’abord, puis vérifier dans Basthon</span>}
      </div>

      <div className="grille grille--detail">
        <div className="pile">
          <section className="feuille">
            <h2>Énoncé</h2>
            <Enonce texte={exercice.enonce} />
            {base && (
              <details className="repli">
                <summary>Schéma de la base {base.titre}</summary>
                <BlocCode code={base.schema} />
              </details>
            )}
          </section>

          {exercice.code && (
            <section className="feuille">
              <h2>{exercice.type === 'lire' || exercice.type === 'trace' ? 'Code à lire' : 'Code de départ'}</h2>
              <BlocCode code={exercice.code} />
              <BoutonsBasthon exercice={exercice} bases={exercices.bases} />
            </section>
          )}

          <section>
            {exercice.indice && (
              <details className="repli">
                <summary>Indice</summary>
                <Enonce texte={exercice.indice} />
              </details>
            )}
            {exercice.correction && (
              <details className="repli">
                <summary>Correction</summary>
                {exercice.langage === 'texte' || exercice.type === 'lire' || exercice.type === 'trace' || exercice.type === 'papier' ? (
                  <Enonce texte={exercice.correction} />
                ) : (
                  <BlocCode code={exercice.correction} />
                )}
              </details>
            )}
          </section>
        </div>

        <aside className="pile">
          <section className="feuille">
            <h3>Compétences travaillées</h3>
            <ul className="liste-simple">
              {competences.map((c) => {
                const n = niveauDe(suivi, c.id)
                return (
                  <li key={c.id}>
                    <span>{c.label}</span>
                    <span title="Lire / Écrire">
                      <Pastille niveau={n.lire} titre="Lire" /> <Pastille niveau={n.ecrire} titre="Écrire" />
                    </span>
                  </li>
                )
              })}
            </ul>
            <p className="petit discret" style={{ marginTop: 8 }}>
              Ce type d’exercice évalue l’axe <strong>{axe === 'lire' ? 'Lire' : 'Écrire'}</strong>.
            </p>
          </section>

          <section className="feuille">
            <h3>Noter un résultat</h3>
            {propositions ? (
              <Propositions
                propositions={propositions}
                niveaux={referentiel.niveaux}
                onAppliquer={(liste) => {
                  liste.forEach((p) => fixerNiveau(p.competence.id, p.axe, p.propose))
                  setPropositions(null)
                }}
                onIgnorer={() => setPropositions(null)}
              />
            ) : (
              <FormulaireResultat exercice={exercice} onEnregistre={enregistrer} />
            )}
          </section>

          <section className="feuille">
            <h3>Essais</h3>
            {essais.length === 0 ? (
              <p className="vide">Pas encore d’essai.</p>
            ) : (
              <ul className="liste-simple">
                {essais.map((r) => (
                  <li key={r.id} style={{ display: 'block' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                      <Resultat resultat={r} court />
                      <span className="petit discret">
                        {formatDate(r.date, { day: 'numeric', month: 'short' })} · {MODES[r.mode] || r.mode}
                        {r.duree ? ` · ${r.duree} min` : ''}
                      </span>
                    </div>
                    {r.commentaire && <div className="annotation">{r.commentaire}</div>}
                    <button
                      type="button"
                      className="btn btn--petit btn--clair"
                      style={{ marginTop: 4 }}
                      onClick={() => window.confirm('Supprimer cet essai ?') && supprimerResultat(r.id)}
                    >
                      Supprimer
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </aside>
      </div>

      <div className="boutons no-print" style={{ justifyContent: 'space-between', marginTop: 20 }}>
        {precedent ? <Link to={`/exercices/${precedent.id}`}>← {precedent.titre}</Link> : <span />}
        {suivant && <Link to={`/exercices/${suivant.id}`}>{suivant.titre} →</Link>}
      </div>
    </>
  )
}
