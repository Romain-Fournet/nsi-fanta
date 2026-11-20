import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Clock,
  Code2,
  FileText,
  Hash,
  Layers,
  ListChecks,
  PenLine,
  Pencil,
  Tag as TagIcone,
  Target,
  Trash2,
} from 'lucide-react'
import { useStore } from '../store.jsx'
import { useActions } from '../actions.js'
import {
  BlocCode,
  BoutonsBasthon,
  Carte,
  Difficulte,
  Enonce,
  EtiquetteTheme,
  Fil,
  Niveau,
  Repli,
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
    <form className="pile" style={{ gap: 14 }} onSubmit={valider}>
      <div className="champ">
        <span className="label" id="lbl-resultat">
          Résultat
        </span>
        <div className="segments segments--plein" role="group" aria-labelledby="lbl-resultat">
          {Object.entries(RESULTATS).map(([k, v]) => (
            <button key={k} type="button" aria-pressed={resultat === k} onClick={() => setResultat(k)}>
              {{ seule: 'Seule', aide: 'Avec aide', echec: 'Pas réussi' }[k]}
            </button>
          ))}
        </div>
      </div>
      <div className="grille grille--2" style={{ gap: 12 }}>
        <div className="champ">
          <span className="label" id="lbl-mode">
            Mode
          </span>
          <div className="segments segments--plein" role="group" aria-labelledby="lbl-mode">
            {Object.entries(MODES).map(([k, v]) => (
              <button key={k} type="button" aria-pressed={mode === k} onClick={() => setMode(k)}>
                {v}
              </button>
            ))}
          </div>
        </div>
        <div className="champ">
          <label htmlFor="duree">Durée (min)</label>
          <input id="duree" type="number" min="0" value={duree} onChange={(e) => setDuree(e.target.value)} />
        </div>
      </div>
      <div className="champ">
        <label htmlFor="commentaire">Commentaire</label>
        <input
          id="commentaire"
          type="text"
          value={commentaire}
          onChange={(e) => setCommentaire(e.target.value)}
          placeholder="Ex. trouvé seule après l’indice sur range"
        />
      </div>
      <button type="submit" className="btn" disabled={!resultat}>
        Enregistrer le résultat
      </button>
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
      <p className="petit discret">Proposé d’après ce résultat. Décoche ce que tu veux garder tel quel.</p>
      <ul className="lignes">
        {propositions.map((p, i) => (
          <li key={p.competence.id + p.axe}>
            <label className="case">
              <input
                type="checkbox"
                checked={choix[i]}
                disabled={p.propose === p.actuel}
                onChange={(e) => setChoix(choix.map((c, j) => (j === i ? e.target.checked : c)))}
              />
              <span>
                {p.competence.label} <span className="discret">· {p.axe === 'lire' ? 'Lire' : 'Écrire'}</span>
              </span>
            </label>
            <span className="petit" style={{ paddingLeft: 24, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <Niveau mini valeur={p.actuel} niveaux={niveaux} /> {label(p.actuel)}
              <ArrowRight size={13} className="icone discret" aria-hidden="true" />
              <Niveau mini valeur={p.propose} niveaux={niveaux} /> <strong style={{ fontWeight: 600 }}>{label(p.propose)}</strong>
            </span>
          </li>
        ))}
      </ul>
      <div className="boutons" style={{ marginTop: 12 }}>
        <button type="button" className="btn" disabled={!aChanger.length} onClick={() => onAppliquer(aChanger)}>
          Appliquer
        </button>
        <button type="button" className="btn btn--fantome" onClick={onIgnorer}>
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
      <div className="carte" style={{ padding: 28, maxWidth: 520 }}>
        <h1 style={{ fontSize: '1.5rem', marginBottom: 8 }}>Exercice introuvable</h1>
        <p className="discret">
          Aucun exercice « {id} ». <Link to="/exercices">Retour à la liste</Link>
        </p>
      </div>
    )
  }

  const niveaux = referentiel.niveaux
  const theme = referentiel.themes.find((t) => t.id === exercice.theme)
  const competences = (exercice.competences || []).map((c) => trouverCompetence(referentiel, c)).filter(Boolean)
  const essais = [...resultatsExercice(suivi, exercice.id)].reverse()
  const base = exercice.base ? exercices.bases?.[exercice.base] : null
  const axe = axeDuType(exercice.type)
  const index = exercices.exercices.indexOf(exercice)
  const suivant = exercices.exercices[index + 1]
  const precedent = exercices.exercices[index - 1]
  const correctionTexte =
    exercice.langage === 'texte' || exercice.type === 'lire' || exercice.type === 'trace' || exercice.type === 'papier'

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
      <Fil liens={[{ to: '/exercices', label: 'Exercices' }, { label: exercice.id }]} />

      <header className="entete" style={{ marginBottom: 20 }}>
        <div className="entete__gauche">
          <h1>{exercice.titre}</h1>
        </div>
        <div className="entete__actions">
          <Link className="btn btn--clair btn--petit" to={`/exercices/${exercice.id}/modifier`}>
            <Pencil size={14} className="icone" aria-hidden="true" />
            Modifier
          </Link>
        </div>
      </header>

      <dl className="props" style={{ marginBottom: 28 }}>
        <dt>
          <Layers size={15} className="icone" aria-hidden="true" />
          Thème
        </dt>
        <dd>
          <EtiquetteTheme theme={theme} />
        </dd>
        <dt>
          <TagIcone size={15} className="icone" aria-hidden="true" />
          Type
        </dt>
        <dd>
          <TypeExercice type={exercice.type} />
          <span className="petit discret">évalue l’axe {axe === 'lire' ? 'Lire' : 'Écrire'}</span>
        </dd>
        <dt>
          <BarChart3 size={15} className="icone" aria-hidden="true" />
          Difficulté
        </dt>
        <dd>
          <Difficulte valeur={exercice.difficulte} />
          <span className="petit discret">{exercice.difficulte} sur 3</span>
        </dd>
        <dt>
          <Clock size={15} className="icone" aria-hidden="true" />
          Durée
        </dt>
        <dd>{exercice.duree} min</dd>
        {exercice.papier && (
          <>
            <dt>
              <PenLine size={15} className="icone" aria-hidden="true" />
              Méthode
            </dt>
            <dd>Sur papier d’abord, puis vérifier dans Basthon</dd>
          </>
        )}
        <dt>
          <Hash size={15} className="icone" aria-hidden="true" />
          Identifiant
        </dt>
        <dd>
          <span className="id">{exercice.id}</span>
        </dd>
      </dl>

      <div className="grille grille--detail">
        <div className="pile">
          <Carte titre="Énoncé" icone={FileText}>
            <Enonce texte={exercice.enonce} />
            {base && (
              <div style={{ marginTop: 14 }}>
                <Repli titre={`Schéma de la base ${base.titre}`}>
                  <BlocCode code={base.schema} />
                </Repli>
              </div>
            )}
          </Carte>

          {exercice.code && (
            <Carte titre={exercice.type === 'lire' || exercice.type === 'trace' ? 'Code à lire' : 'Code de départ'} icone={Code2}>
              <BlocCode code={exercice.code} />
              <BoutonsBasthon exercice={exercice} bases={exercices.bases} />
            </Carte>
          )}

          {(exercice.indice || exercice.correction) && (
            <section className="carte">
              <div className="carte__corps" style={{ paddingTop: 8, paddingBottom: 8 }}>
                {exercice.indice && (
                  <Repli titre="Indice">
                    <Enonce texte={exercice.indice} />
                  </Repli>
                )}
                {exercice.correction && (
                  <Repli titre="Correction">
                    {correctionTexte ? <Enonce texte={exercice.correction} /> : <BlocCode code={exercice.correction} />}
                  </Repli>
                )}
              </div>
            </section>
          )}
        </div>

        <aside className="pile">
          <Carte titre="Noter un résultat" icone={ListChecks}>
            {propositions ? (
              <Propositions
                propositions={propositions}
                niveaux={niveaux}
                onAppliquer={(liste) => {
                  liste.forEach((p) => fixerNiveau(p.competence.id, p.axe, p.propose))
                  setPropositions(null)
                }}
                onIgnorer={() => setPropositions(null)}
              />
            ) : (
              <FormulaireResultat exercice={exercice} onEnregistre={enregistrer} />
            )}
          </Carte>

          <Carte titre="Compétences travaillées" icone={Target}>
            <ul className="lignes">
              {competences.map((c) => {
                const n = niveauDe(suivi, c.id)
                return (
                  <li key={c.id} style={{ alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '0.88rem' }}>{c.label}</span>
                    <span style={{ display: 'grid', gap: 4, justifyItems: 'end', paddingTop: 3 }}>
                      <Niveau mini axe="lire" valeur={n.lire} niveaux={niveaux} />
                      <Niveau mini axe="ecrire" valeur={n.ecrire} niveaux={niveaux} />
                    </span>
                  </li>
                )
              })}
            </ul>
          </Carte>

          <Carte titre="Essais" action={<span className="petit discret">{essais.length}</span>}>
            {essais.length === 0 ? (
              <p className="vide">Pas encore d’essai.</p>
            ) : (
              <ul className="lignes">
                {essais.map((r) => (
                  <li key={r.id} style={{ alignItems: 'flex-start' }}>
                    <div style={{ minWidth: 0 }}>
                      <Resultat resultat={r} />
                      <div className="petit discret" style={{ marginTop: 4 }}>
                        {formatDate(r.date, { day: 'numeric', month: 'short' })} · {MODES[r.mode] || r.mode}
                        {r.duree ? ` · ${r.duree} min` : ''}
                      </div>
                      {r.commentaire && <div style={{ fontSize: '0.88rem', marginTop: 4 }}>{r.commentaire}</div>}
                    </div>
                    <button
                      type="button"
                      className="btn btn--fantome btn--icone"
                      aria-label="Supprimer cet essai"
                      title="Supprimer cet essai"
                      onClick={() => window.confirm('Supprimer cet essai ?') && supprimerResultat(r.id)}
                    >
                      <Trash2 size={15} className="icone" aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Carte>
        </aside>
      </div>

      <nav className="pagination no-print" aria-label="Exercices voisins">
        {precedent ? (
          <Link to={`/exercices/${precedent.id}`}>
            <ArrowLeft size={15} className="icone" aria-hidden="true" />
            {precedent.titre}
          </Link>
        ) : (
          <span />
        )}
        {suivant && (
          <Link to={`/exercices/${suivant.id}`}>
            {suivant.titre}
            <ArrowRight size={15} className="icone" aria-hidden="true" />
          </Link>
        )}
      </nav>
    </>
  )
}
