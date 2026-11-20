import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Copy, ExternalLink, Plus, Trash2 } from 'lucide-react'
import { useStore } from '../store.jsx'
import { LONGUEUR_LIEN_MAX, lienBasthon, scriptExercice } from '../lib/basthon.js'
import {
  COULEUR_NOTE,
  COULEUR_RESULTAT,
  NIVEAU_COULEURS,
  RESULTATS,
  TYPES_EXERCICE,
  TYPES_NOTE,
  copier,
  dernierResultat,
  formatDateCourte,
} from '../lib/outils.js'

/* ---------- Typographie ---------- */

/** Espaces insécables du français : « guillemets », et avant : ; ! ? » */
export function typo(texte) {
  if (typeof texte !== 'string') return texte
  return texte.replace(/«\s+/g, '«\u00a0').replace(/\s+([»:;!?])/g, '\u00a0$1')
}

/* ---------- Mise en page ---------- */

export function Entete({ icone: Icone, couleur, titre, sousTitre, proprietes, children }) {
  return (
    <header className="entete">
      <div className="entete__gauche">
        {Icone && (
          <div
            className="entete__icone"
            style={
              couleur
                ? { color: `color-mix(in srgb, ${couleur} 82%, black)`, background: `color-mix(in srgb, ${couleur} 11%, white)` }
                : undefined
            }
            aria-hidden="true"
          >
            <Icone size={24} className="icone" />
          </div>
        )}
        <h1>{titre}</h1>
        {sousTitre && <p className="entete__sous">{typo(sousTitre)}</p>}
        {proprietes && <div className="proprietes">{proprietes}</div>}
      </div>
      {children && <div className="entete__actions">{children}</div>}
    </header>
  )
}

export function Carte({ titre, icone: Icone, action, children, flush = false, className = '', ...reste }) {
  return (
    <section className={`carte ${className}`} {...reste}>
      {(titre || action) && (
        <div className="carte__tete">
          {titre && (
            <h2 className="carte__titre">
              {Icone && <Icone size={17} className="icone" aria-hidden="true" />}
              {titre}
            </h2>
          )}
          {action}
        </div>
      )}
      <div className={flush ? 'carte__corps carte__corps--flush' : 'carte__corps'}>{children}</div>
    </section>
  )
}

export function LienCarte({ to, children }) {
  return (
    <Link className="carte__lien" to={to}>
      {children}
      <ChevronRight size={14} className="icone" aria-hidden="true" />
    </Link>
  )
}

export function Fil({ liens }) {
  return (
    <nav className="fil no-print" aria-label="Fil d’Ariane">
      {liens.map((l, i) => (
        <span key={i} style={{ display: 'contents' }}>
          {i > 0 && <ChevronRight size={14} className="icone" aria-hidden="true" />}
          {l.to ? <Link to={l.to}>{l.label}</Link> : <span>{l.label}</span>}
        </span>
      ))}
    </nav>
  )
}

export function Repli({ titre, children, ouvert = false }) {
  return (
    <details className="repli" open={ouvert || undefined}>
      <summary>
        <ChevronRight size={16} className="icone" aria-hidden="true" />
        {titre}
      </summary>
      <div className="repli__corps">{children}</div>
    </details>
  )
}

/* ---------- Niveaux ---------- */

function nomNiveau(niveaux, v) {
  return niveaux?.find((n) => n.valeur === v)?.label ?? ''
}

/** Échelle en lecture seule. mini : sans libellé, pour les listes. */
export function Niveau({ valeur, niveaux, axe, mini = false }) {
  const nomAxe = axe === 'lire' ? 'Lire' : axe === 'ecrire' ? 'Écrire' : null
  const label = nomNiveau(niveaux, valeur)
  return (
    <span
      className={`niveau${mini ? ' niveau--mini' : ''}`}
      style={{ '--lv': NIVEAU_COULEURS[valeur] }}
      title={nomAxe ? `${nomAxe} : ${label}` : label}
      role="img"
      aria-label={nomAxe ? `${nomAxe} : ${label}` : label}
    >
      {nomAxe && <span className={mini ? 'niveau__axe niveau__axe--mini' : 'niveau__axe'}>{nomAxe}</span>}
      <span className="niveau__barre">
        {[1, 2, 3, 4].map((n) => (
          <span key={n} className={`niveau__seg${n <= valeur ? ' on' : ''}`} />
        ))}
      </span>
      {!mini && <span className="niveau__label">{label}</span>}
    </span>
  )
}

/** Échelle cliquable. Clic = fixe le niveau, re-clic sur le niveau choisi = « pas vu ». */
export function Echelle({ axe, valeur, onChange, niveaux, libelleCompetence }) {
  const nomAxe = axe === 'lire' ? 'Lire' : 'Écrire'
  return (
    <div
      className="niveau"
      style={{ '--lv': NIVEAU_COULEURS[valeur] }}
      role="group"
      aria-label={`${nomAxe} : ${libelleCompetence}`}
    >
      <span className="niveau__axe">{nomAxe}</span>
      <span className="niveau__barre">
        {[1, 2, 3, 4].map((n) => {
          const nom = nomNiveau(niveaux, n)
          return (
            <button
              key={n}
              type="button"
              className={`niveau__seg${n <= valeur ? ' on' : ''}`}
              aria-pressed={n === valeur}
              aria-label={`${nomAxe} : ${nom}`}
              title={n === valeur ? `${nom} — cliquer pour remettre à « pas vu »` : nom}
              onClick={() => onChange(n === valeur ? 0 : n)}
            />
          )
        })}
      </span>
      <span className="niveau__label">{nomNiveau(niveaux, valeur)}</span>
    </div>
  )
}

export function LegendeNiveaux({ niveaux }) {
  return (
    <div className="legende" aria-label="Légende des niveaux">
      {niveaux.map((n) => (
        <span key={n.valeur}>
          <span className="carre" style={{ '--lv': NIVEAU_COULEURS[n.valeur] }} aria-hidden="true" />
          {n.label}
        </span>
      ))}
    </div>
  )
}

export function BarreProgression({ valeur, couleur, label }) {
  return (
    <div className="barre-prog">
      <div
        className="barre-prog__fond"
        role="progressbar"
        aria-valuenow={valeur}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <div className="barre-prog__plein" style={{ width: `${valeur}%`, '--c': couleur }} />
      </div>
      <span className="barre-prog__val">{valeur} %</span>
    </div>
  )
}

/* ---------- Étiquettes ---------- */

export function Tag({ couleur = '', children, grand = false, ...reste }) {
  return (
    <span className={`tag${couleur ? ` tag--${couleur}` : ''}${grand ? ' tag--grand' : ''}`} {...reste}>
      {children}
    </span>
  )
}

export function Difficulte({ valeur }) {
  return (
    <span className="difficulte" role="img" aria-label={`Difficulté ${valeur} sur 3`} title={`Difficulté ${valeur}/3`}>
      {[1, 2, 3].map((i) => (
        <span key={i} className={i <= valeur ? 'on' : ''} />
      ))}
    </span>
  )
}

export function Resultat({ resultat, avecDate = false }) {
  if (!resultat) return <span className="tag tag--contour">À faire</span>
  return (
    <span className="boutons" style={{ gap: 6, flexWrap: 'nowrap' }}>
      <Tag couleur={COULEUR_RESULTAT[resultat.resultat]}>{RESULTATS[resultat.resultat]}</Tag>
      {avecDate && resultat.date && (
        <span className="petit discret" style={{ whiteSpace: 'nowrap' }}>
          {formatDateCourte(resultat.date)}
        </span>
      )}
    </span>
  )
}

export function TypeExercice({ type }) {
  return <Tag>{TYPES_EXERCICE[type] || type}</Tag>
}

export function EtiquetteTheme({ theme }) {
  if (!theme) return null
  return (
    <span className="tag tag--theme" style={{ '--c': theme.couleur }}>
      {theme.court}
    </span>
  )
}

/** Ligne de liste : exercice et son dernier résultat. */
export function LigneExercice({ exercice, suivi }) {
  if (!exercice) return null
  return (
    <li>
      <Link className="ligne__titre" to={`/exercices/${exercice.id}`}>
        <span className="id">{exercice.id}</span>
        <span>{exercice.titre}</span>
      </Link>
      <Resultat resultat={dernierResultat(suivi, exercice.id)} />
    </li>
  )
}

/* ---------- Contenu ---------- */

/** Énoncé : texte simple, blocs ``` en police code, lignes « - » en liste, `code` en ligne. */
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
  return texte.split(/(`[^`]+`)/).map((p, i) =>
    p.startsWith('`') && p.endsWith('`') && p.length > 1 ? (
      <code className="inline" key={i}>
        {p.slice(1, -1)}
      </code>
    ) : (
      typo(p)
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
    <div className="pile" style={{ gap: 12 }}>
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
            Ouvrir dans Basthon
            <ExternalLink size={15} className="icone" aria-hidden="true" />
          </a>
        )}
        <button
          type="button"
          className="btn btn--clair"
          onClick={() => copier(exercice.langage === 'sql' ? script : exercice.code).then(() => flash('Code copié'))}
        >
          <Copy size={15} className="icone" aria-hidden="true" />
          Copier le code
        </button>
        {exercice.tests?.trim() && (
          <button type="button" className="btn btn--clair" onClick={() => copier(exercice.tests).then(() => flash('Tests copiés'))}>
            <Copy size={15} className="icone" aria-hidden="true" />
            Copier les tests
          </button>
        )}
        <span className="petit discret" role="status">
          {message}
        </span>
      </div>
      {tropLong && (
        <p className="petit discret">
          Le lien est long ({lien.length} caractères) : s’il ne s’ouvre pas, copie le code et colle-le dans Basthon.
        </p>
      )}
      {exercice.langage === 'sql' && (
        <p className="petit discret">
          Basthon s’ouvre en mode SQL avec la base déjà créée. Écris tes requêtes sous la ligne « Tes requêtes ».
        </p>
      )}
    </div>
  )
}

/* ---------- Notes ---------- */

export function Note({ note, competence, avecCompetence = false, onResolue, onSupprimer }) {
  return (
    <div className={`note${note.resolue ? ' note--resolue' : ''}`}>
      <div>
        <div className="note__tete">
          <Tag couleur={COULEUR_NOTE[note.type]}>{TYPES_NOTE[note.type] || note.type}</Tag>
          {avecCompetence && competence && <span className="petit discret">{competence.label}</span>}
          <span className="note__meta">{formatDateCourte(note.date)}</span>
        </div>
        <div className="note__texte">{typo(note.texte)}</div>
      </div>
      <div className="note__actions">
        {note.type === 'blocage' && onResolue && (
          <label className="case petit">
            <input type="checkbox" checked={!!note.resolue} onChange={(e) => onResolue(e.target.checked)} />
            Résolu
          </label>
        )}
        {onSupprimer && (
          <button
            type="button"
            className="btn btn--fantome btn--icone"
            onClick={onSupprimer}
            aria-label="Supprimer la note"
            title="Supprimer la note"
          >
            <Trash2 size={15} className="icone" aria-hidden="true" />
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
  const cle = competenceFixe || seanceId

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
          <label htmlFor={`comp-${cle}`}>Compétence</label>
          <select id={`comp-${cle}`} value={competence} onChange={(e) => setCompetence(e.target.value)}>
            <option value="">Générale</option>
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
        <label htmlFor={`type-${cle}`}>Type</label>
        <select id={`type-${cle}`} value={type} onChange={(e) => setType(e.target.value)}>
          {Object.entries(TYPES_NOTE).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
      </div>
      <div className="champ">
        <label htmlFor={`texte-${cle}`}>Note</label>
        <input
          id={`texte-${cle}`}
          type="text"
          value={texte}
          onChange={(e) => setTexte(e.target.value)}
          placeholder="Ex. confond = et == dans les if"
        />
      </div>
      <button type="submit" className="btn" disabled={!texte.trim()}>
        <Plus size={15} className="icone" aria-hidden="true" />
        Ajouter
      </button>
    </form>
  )
}
