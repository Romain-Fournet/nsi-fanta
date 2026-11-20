import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../store.jsx'
import { LONGUEUR_LIEN_MAX, lienBasthon, scriptExercice } from '../lib/basthon.js'
import {
  NIVEAU_COULEURS,
  RESULTATS,
  TYPES_EXERCICE,
  TYPES_NOTE,
  copier,
  dernierResultat,
  formatDate,
  formatDateCourte,
} from '../lib/outils.js'

/* ---------- Niveaux ---------- */

export function Pastille({ niveau, titre }) {
  return (
    <span
      className="pastille"
      style={{ background: NIVEAU_COULEURS[niveau] ?? NIVEAU_COULEURS[0] }}
      title={titre}
      aria-hidden={titre ? undefined : true}
    />
  )
}

/** 4 cases à colorier. Clic = fixe le niveau, re-clic sur la case choisie = « pas vu ». */
export function Echelle({ axe, valeur, onChange, niveaux, libelleCompetence }) {
  const nomAxe = axe === 'lire' ? 'Lire' : 'Écrire'
  const label = niveaux?.find((n) => n.valeur === valeur)?.label ?? ''
  return (
    <div className="echelle" role="group" aria-label={`${nomAxe} : ${libelleCompetence}`}>
      <span className="echelle__axe">{nomAxe}</span>
      <span className="echelle__cases">
        {[1, 2, 3, 4].map((n) => {
          const nom = niveaux?.find((x) => x.valeur === n)?.label ?? n
          return (
            <button
              key={n}
              type="button"
              className={`echelle__case${n <= valeur ? ' remplie' : ''}`}
              style={n <= valeur ? { background: NIVEAU_COULEURS[valeur] } : undefined}
              aria-pressed={n === valeur}
              aria-label={`${nomAxe} : ${nom}`}
              title={n === valeur ? `${nom} — cliquer pour remettre à « pas vu »` : nom}
              onClick={() => onChange(n === valeur ? 0 : n)}
            />
          )
        })}
      </span>
      <span className="echelle__label">{label}</span>
    </div>
  )
}

export function LegendeNiveaux({ niveaux }) {
  return (
    <div className="legende" aria-label="Légende des niveaux">
      {niveaux.map((n) => (
        <span key={n.valeur}>
          <Pastille niveau={n.valeur} />
          {n.label}
        </span>
      ))}
    </div>
  )
}

export function BarreProgression({ axe, valeur }) {
  return (
    <div className="barre-prog">
      <span>{axe === 'lire' ? 'Lire' : 'Écrire'}</span>
      <div
        className="barre-prog__fond"
        role="progressbar"
        aria-valuenow={valeur}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={axe === 'lire' ? 'Lire' : 'Écrire'}
      >
        <div
          className={`barre-prog__plein${axe === 'ecrire' ? ' barre-prog__plein--ecrire' : ''}`}
          style={{ width: `${valeur}%` }}
        />
      </div>
      <span className="barre-prog__val">{valeur} %</span>
    </div>
  )
}

/* ---------- Exercices ---------- */

export function Difficulte({ valeur }) {
  return (
    <span className="difficulte" aria-label={`Difficulté ${valeur} sur 3`} title={`Difficulté ${valeur}/3`}>
      {[1, 2, 3].map((i) => (
        <span key={i} className={i <= valeur ? '' : 'off'} aria-hidden="true">
          ●
        </span>
      ))}
    </span>
  )
}

export function Resultat({ resultat, court = false }) {
  if (!resultat) return <span className="res res--aucun">Pas encore fait</span>
  return (
    <span className={`res res--${resultat.resultat}`}>
      {RESULTATS[resultat.resultat]}
      {!court && resultat.date && <span className="discret petit"> · {formatDateCourte(resultat.date)}</span>}
    </span>
  )
}

export function TypeExercice({ type }) {
  return <span className="etiquette">{TYPES_EXERCICE[type] || type}</span>
}

export function EtiquetteTheme({ theme }) {
  if (!theme) return null
  return (
    <span className="etiquette etiquette--theme" style={{ color: theme.couleur }}>
      {theme.court}
    </span>
  )
}

/** Lien vers un exercice avec son dernier résultat. */
export function LigneExercice({ exercice, suivi }) {
  if (!exercice) return null
  return (
    <li>
      <Link to={`/exercices/${exercice.id}`}>
        <code className="inline">{exercice.id}</code> {exercice.titre}
      </Link>
      <Resultat resultat={dernierResultat(suivi, exercice.id)} />
    </li>
  )
}

/** Énoncé : texte simple, blocs ``` en police code, lignes « - » en liste. */
export function Enonce({ texte }) {
  if (!texte) return null
  const morceaux = texte.split(/```[a-z]*\n?/)
  return (
    <div className="enonce">
      {morceaux.map((m, i) =>
        i % 2 === 1 ? (
          <pre className="code" key={i}>
            <code>{m.replace(/\n$/, '')}</code>
          </pre>
        ) : (
          <TexteSimple key={i} texte={m} />
        ),
      )}
    </div>
  )
}

function enLigne(texte) {
  // `code` en ligne
  return texte.split(/(`[^`]+`)/).map((p, i) =>
    p.startsWith('`') && p.endsWith('`') && p.length > 1 ? (
      <code className="inline" key={i}>
        {p.slice(1, -1)}
      </code>
    ) : (
      p
    ),
  )
}

function TexteSimple({ texte }) {
  const blocs = []
  let liste = null
  let para = []
  const finirPara = () => {
    if (para.length) blocs.push({ type: 'p', lignes: para })
    para = []
  }
  for (const ligne of texte.split('\n')) {
    if (/^\s*[-•]\s+/.test(ligne)) {
      finirPara()
      if (!liste) {
        liste = { type: 'ul', items: [] }
        blocs.push(liste)
      }
      liste.items.push(ligne.replace(/^\s*[-•]\s+/, ''))
    } else if (!ligne.trim()) {
      finirPara()
      liste = null
    } else {
      liste = null
      para.push(ligne)
    }
  }
  finirPara()
  return blocs.map((b, i) =>
    b.type === 'ul' ? (
      <ul key={i}>
        {b.items.map((it, j) => (
          <li key={j}>{enLigne(it)}</li>
        ))}
      </ul>
    ) : (
      <p key={i}>{enLigne(b.lignes.join('\n'))}</p>
    ),
  )
}

export function BlocCode({ code }) {
  if (!code) return null
  return (
    <pre className="code">
      <code>{code}</code>
    </pre>
  )
}

/** Boutons « Ouvrir dans Basthon », « Copier le code », « Copier les tests ». */
export function BoutonsBasthon({ exercice, bases }) {
  const [lien, setLien] = useState(null)
  const [message, setMessage] = useState('')
  const script = scriptExercice(exercice, bases)
  const executable = exercice.langage === 'python' || exercice.langage === 'sql'

  useEffect(() => {
    let annule = false
    if (!executable || !script.trim()) {
      setLien(null)
      return undefined
    }
    lienBasthon(script, { langage: exercice.langage }).then(
      (url) => !annule && setLien(url),
      () => !annule && setLien(null),
    )
    return () => {
      annule = true
    }
  }, [script, exercice.langage, executable])

  const flash = (texte) => {
    setMessage(texte)
    setTimeout(() => setMessage(''), 2200)
  }

  if (!executable && !exercice.code) return null
  const tropLong = lien && lien.length > LONGUEUR_LIEN_MAX

  return (
    <div className="pile">
      <div className="boutons">
        {executable && (
          <a
            className="btn"
            href={lien || undefined}
            target="_blank"
            rel="noreferrer"
            aria-disabled={!lien}
            onClick={(e) => !lien && e.preventDefault()}
          >
            Ouvrir dans Basthon ↗
          </a>
        )}
        <button
          type="button"
          className="btn btn--clair"
          onClick={() => copier(exercice.langage === 'sql' ? script : exercice.code).then(() => flash('Code copié'))}
        >
          Copier le code
        </button>
        {exercice.tests?.trim() && (
          <button type="button" className="btn btn--clair" onClick={() => copier(exercice.tests).then(() => flash('Tests copiés'))}>
            Copier les tests
          </button>
        )}
        <span className="discret petit" role="status">
          {message}
        </span>
      </div>
      {tropLong && (
        <p className="info petit">
          Le lien est long ({lien.length} caractères) : s’il ne s’ouvre pas, copie le code et colle-le dans Basthon.
        </p>
      )}
      {exercice.langage === 'sql' && (
        <p className="discret petit">
          Basthon s’ouvre en mode SQL avec la base déjà créée. Écris tes requêtes sous la ligne « Tes requêtes ».
        </p>
      )}
    </div>
  )
}

/* ---------- Notes du prof ---------- */

export function Note({ note, competence, avecCompetence = false, onResolue, onSupprimer }) {
  return (
    <div className={`note${note.resolue ? ' note--resolue' : ''}`}>
      <span className={`type-note type-note--${note.type}`}>{TYPES_NOTE[note.type] || note.type}</span>
      <div>
        <div className="annotation">{note.texte}</div>
        {avecCompetence && competence && <div className="discret petit">{competence.label}</div>}
      </div>
      <div className="note__actions">
        <span className="note__meta">{formatDate(note.date, { day: 'numeric', month: 'short' })}</span>
        {note.type === 'blocage' && onResolue && (
          <label className="case petit">
            <input type="checkbox" checked={!!note.resolue} onChange={(e) => onResolue(e.target.checked)} />
            résolu
          </label>
        )}
        {onSupprimer && (
          <button
            type="button"
            className="btn btn--petit btn--clair"
            onClick={onSupprimer}
            aria-label="Supprimer la note"
            title="Supprimer la note"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  )
}

/** Formulaire de note. competenceFixe : la compétence est imposée (page Compétences). */
export function FormulaireNote({ competenceFixe, seanceId, onAjout }) {
  const { referentiel } = useStore()
  const [competence, setCompetence] = useState(competenceFixe || '')
  const [type, setType] = useState('blocage')
  const [texte, setTexte] = useState('')

  const valider = (e) => {
    e.preventDefault()
    if (!texte.trim()) return
    onAjout({ competence: competenceFixe || competence || null, type, texte: texte.trim(), seance: seanceId || null })
    setTexte('')
  }

  return (
    <form className={`formulaire-note${competenceFixe ? '' : ' formulaire-note--large'}`} onSubmit={valider}>
      {!competenceFixe && (
        <div className="champ">
          <label htmlFor={`comp-${seanceId}`}>Compétence</label>
          <select id={`comp-${seanceId}`} value={competence} onChange={(e) => setCompetence(e.target.value)}>
            <option value="">— Générale —</option>
            {referentiel.themes.map((t) => (
              <optgroup key={t.id} label={t.court}>
                {t.competences
                  .filter((c) => !c.archive)
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
              </optgroup>
            ))}
          </select>
        </div>
      )}
      <div className="champ">
        <label htmlFor={`type-${competenceFixe || seanceId}`}>Type</label>
        <select id={`type-${competenceFixe || seanceId}`} value={type} onChange={(e) => setType(e.target.value)}>
          {Object.entries(TYPES_NOTE).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
      </div>
      <div className="champ">
        <label htmlFor={`texte-${competenceFixe || seanceId}`}>Note</label>
        <input
          id={`texte-${competenceFixe || seanceId}`}
          type="text"
          value={texte}
          onChange={(e) => setTexte(e.target.value)}
          placeholder="Ex. confond = et == dans les if"
        />
      </div>
      <button type="submit" className="btn" disabled={!texte.trim()}>
        Ajouter
      </button>
    </form>
  )
}

export function Entete({ titre, sousTitre, children }) {
  return (
    <header className="entete">
      <div>
        <h1>{titre}</h1>
        {sousTitre && <p className="entete__sous">{sousTitre}</p>}
      </div>
      {children && <div className="boutons">{children}</div>}
    </header>
  )
}
