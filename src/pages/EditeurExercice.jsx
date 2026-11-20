import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useStore } from '../store.jsx'
import { Entete } from '../components/ui.jsx'
import { TYPES_EXERCICE } from '../lib/outils.js'

const VIDE = {
  id: '',
  theme: '',
  competences: [],
  titre: '',
  type: 'ecrire',
  langage: 'python',
  difficulte: 1,
  duree: 15,
  enonce: '',
  code: '',
  tests: '',
  indice: '',
  correction: '',
  base: null,
  papier: false,
}

const ID_VALIDE = /^[a-z0-9]+(-[a-z0-9]+)*$/

function Zone({ id, label, valeur, onChange, code = false, lignes = 6, aide }) {
  return (
    <div className="champ">
      <label htmlFor={id}>{label}</label>
      <textarea
        id={id}
        className={code ? 'code' : undefined}
        rows={lignes}
        value={valeur}
        spellCheck={!code}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={
          code
            ? (e) => {
                // Tab insère 4 espaces dans les zones de code.
                if (e.key === 'Tab' && !e.shiftKey) {
                  e.preventDefault()
                  const t = e.currentTarget
                  const { selectionStart: a, selectionEnd: b } = t
                  const nouveau = `${t.value.slice(0, a)}    ${t.value.slice(b)}`
                  onChange(nouveau)
                  requestAnimationFrame(() => t.setSelectionRange(a + 4, a + 4))
                }
              }
            : undefined
        }
      />
      {aide && <span className="petit discret">{aide}</span>}
    </div>
  )
}

export default function EditeurExercice() {
  const { id } = useParams()
  const { referentiel, exercices, modifier } = useStore()
  const navigate = useNavigate()
  const existant = id ? exercices.exercices.find((e) => e.id === id) : null
  const [ex, setEx] = useState(() => ({ ...VIDE, ...(existant || {}) }))
  const [erreur, setErreur] = useState('')

  if (id && !existant) {
    return (
      <div className="feuille">
        <h1>Exercice introuvable</h1>
        <Link to="/exercices">Retour à la liste</Link>
      </div>
    )
  }

  const maj = (champ) => (valeur) => setEx((e) => ({ ...e, [champ]: valeur }))
  const theme = referentiel.themes.find((t) => t.id === ex.theme)
  const bases = Object.entries(exercices.bases || {})

  const enregistrer = (e) => {
    e.preventDefault()
    const propre = { ...ex, id: ex.id.trim(), titre: ex.titre.trim() }
    if (!ID_VALIDE.test(propre.id)) return setErreur('Identifiant : minuscules, chiffres et tirets (ex. py-11).')
    if (!existant || existant.id !== propre.id) {
      if (exercices.exercices.some((x) => x.id === propre.id)) return setErreur(`L’identifiant ${propre.id} existe déjà.`)
    }
    if (!propre.titre) return setErreur('Le titre est obligatoire.')
    if (!propre.theme) return setErreur('Choisis un thème.')
    if (!propre.competences.length) return setErreur('Coche au moins une compétence.')
    propre.difficulte = Number(propre.difficulte) || 1
    propre.duree = Number(propre.duree) || 0
    if (propre.langage !== 'sql') propre.base = null

    modifier('exercices', (data) => ({
      ...data,
      exercices: existant
        ? data.exercices.map((x) => (x.id === existant.id ? propre : x))
        : [...data.exercices, propre],
    }))
    navigate(`/exercices/${propre.id}`)
  }

  const supprimer = () => {
    if (!window.confirm(`Supprimer définitivement l’exercice ${existant.id} ? Les résultats déjà notés restent dans le suivi.`)) return
    modifier('exercices', (data) => ({ ...data, exercices: data.exercices.filter((x) => x.id !== existant.id) }))
    navigate('/exercices')
  }

  const basculerCompetence = (cid) =>
    setEx((e) => ({
      ...e,
      competences: e.competences.includes(cid) ? e.competences.filter((c) => c !== cid) : [...e.competences, cid],
    }))

  return (
    <>
      <p className="petit" style={{ margin: '0 0 8px' }}>
        <Link to={existant ? `/exercices/${existant.id}` : '/exercices'}>← Retour</Link>
      </p>
      <Entete titre={existant ? `Modifier ${existant.id}` : 'Nouvel exercice'} sousTitre="Enregistré dans data/exercices.json." />

      <form className="pile" onSubmit={enregistrer}>
        <section className="feuille pile">
          <div className="champs">
            <div className="champ">
              <label htmlFor="e-id">Identifiant</label>
              <input id="e-id" type="text" value={ex.id} onChange={(e) => maj('id')(e.target.value)} placeholder="py-11" />
            </div>
            <div className="champ" style={{ gridColumn: 'span 2' }}>
              <label htmlFor="e-titre">Titre</label>
              <input id="e-titre" type="text" value={ex.titre} onChange={(e) => maj('titre')(e.target.value)} />
            </div>
          </div>
          <div className="champs">
            <div className="champ">
              <label htmlFor="e-theme">Thème</label>
              <select
                id="e-theme"
                value={ex.theme}
                onChange={(e) => setEx((x) => ({ ...x, theme: e.target.value, competences: [] }))}
              >
                <option value="">—</option>
                {referentiel.themes.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.titre}
                  </option>
                ))}
              </select>
            </div>
            <div className="champ">
              <label htmlFor="e-type">Type</label>
              <select id="e-type" value={ex.type} onChange={(e) => maj('type')(e.target.value)}>
                {Object.entries(TYPES_EXERCICE).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
            <div className="champ">
              <label htmlFor="e-langage">Langage</label>
              <select id="e-langage" value={ex.langage} onChange={(e) => maj('langage')(e.target.value)}>
                <option value="python">Python</option>
                <option value="sql">SQL</option>
                <option value="texte">Texte (pas de code)</option>
              </select>
            </div>
            <div className="champ">
              <label htmlFor="e-diff">Difficulté (1–3)</label>
              <select id="e-diff" value={ex.difficulte} onChange={(e) => maj('difficulte')(Number(e.target.value))}>
                <option value={1}>1</option>
                <option value={2}>2</option>
                <option value={3}>3</option>
              </select>
            </div>
            <div className="champ">
              <label htmlFor="e-duree">Durée (min)</label>
              <input id="e-duree" type="number" min="0" value={ex.duree} onChange={(e) => maj('duree')(e.target.value)} />
            </div>
            {ex.langage === 'sql' && (
              <div className="champ">
                <label htmlFor="e-base">Base</label>
                <select id="e-base" value={ex.base || ''} onChange={(e) => maj('base')(e.target.value || null)}>
                  <option value="">—</option>
                  {bases.map(([k, b]) => (
                    <option key={k} value={k}>
                      {b.titre}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
          <label className="case">
            <input type="checkbox" checked={!!ex.papier} onChange={(e) => maj('papier')(e.target.checked)} />
            À faire sur papier d’abord, puis vérifier dans Basthon
          </label>
        </section>

        <section className="feuille">
          <h2>Compétences</h2>
          {!theme ? (
            <p className="vide">Choisis d’abord un thème.</p>
          ) : (
            <div className="grille grille--2">
              {theme.competences
                .filter((c) => !c.archive || ex.competences.includes(c.id))
                .map((c) => (
                  <label key={c.id} className="case">
                    <input type="checkbox" checked={ex.competences.includes(c.id)} onChange={() => basculerCompetence(c.id)} />
                    {c.label}
                  </label>
                ))}
            </div>
          )}
        </section>

        <section className="feuille pile">
          <Zone
            id="e-enonce"
            label="Énoncé"
            valeur={ex.enonce}
            onChange={maj('enonce')}
            lignes={8}
            aide="Texte simple. Un bloc de code entre deux lignes ```, une liste avec des lignes « - », du `code` entre accents graves."
          />
          <Zone
            id="e-code"
            label={ex.langage === 'sql' ? 'Zone de requêtes de départ' : 'Code de départ (ou code à lire)'}
            valeur={ex.code}
            onChange={maj('code')}
            code
            lignes={10}
          />
          {ex.langage === 'python' && (
            <Zone
              id="e-tests"
              label="Tests (assert)"
              valeur={ex.tests}
              onChange={maj('tests')}
              code
              lignes={6}
              aide="Collés sous le code dans Basthon, après « # ---------- Tests ---------- »."
            />
          )}
          <Zone id="e-indice" label="Indice" valeur={ex.indice} onChange={maj('indice')} lignes={3} />
          <Zone
            id="e-correction"
            label="Correction"
            valeur={ex.correction}
            onChange={maj('correction')}
            code={ex.langage !== 'texte' && ex.type !== 'lire' && ex.type !== 'trace' && ex.type !== 'papier'}
            lignes={10}
            aide="Vérifiée par « npm run check » : la correction Python doit passer les tests, la correction SQL doit tourner sur SQLite."
          />
        </section>

        {erreur && (
          <p className="alerte" role="alert">
            {erreur}
          </p>
        )}
        <div className="boutons" style={{ justifyContent: 'space-between' }}>
          <div className="boutons">
            <button type="submit" className="btn">
              Enregistrer
            </button>
            <Link className="btn btn--clair" to={existant ? `/exercices/${existant.id}` : '/exercices'}>
              Annuler
            </Link>
          </div>
          {existant && (
            <button type="button" className="btn btn--danger" onClick={supprimer}>
              Supprimer l’exercice
            </button>
          )}
        </div>
      </form>
    </>
  )
}
