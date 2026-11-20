import { Link } from 'react-router-dom'
import { useStore } from '../store.jsx'
import { BarreProgression, Entete, LigneExercice, Note, Pastille, Resultat } from '../components/ui.jsx'
import {
  formatDate,
  formatDateCourte,
  joursAvant,
  niveauDe,
  prochainExamen,
  progressionTheme,
  toutesCompetences,
  trierParDateDesc,
  trouverCompetence,
} from '../lib/outils.js'

export default function TableauDeBord() {
  const { referentiel, exercices, suivi, seances, eleve } = useStore()
  const examen = prochainExamen(eleve)
  const jours = examen ? joursAvant(examen.date) : null
  const prochaine = [...seances.seances]
    .filter((s) => !s.faite)
    .sort((a, b) => (a.date || '9999').localeCompare(b.date || '9999') || a.numero - b.numero)[0]
  const parId = Object.fromEntries(exercices.exercices.map((e) => [e.id, e]))

  const comps = toutesCompetences(referentiel)
  const aRetravailler = comps.filter((c) => {
    const n = niveauDe(suivi, c.id)
    return [1, 2].includes(n.lire) || [1, 2].includes(n.ecrire)
  })
  const blocages = trierParDateDesc(suivi.notes.filter((n) => n.type === 'blocage' && !n.resolue))

  // Acquis récents : déclics et passages au niveau 4, les plus récents d'abord.
  const declics = suivi.notes.filter((n) => n.type === 'declic').map((n) => ({ genre: 'declic', date: n.date, note: n }))
  const passages4 = Object.entries(suivi.competences).flatMap(([cid, c]) =>
    (c.historique || [])
      .filter((h) => h.nouveau === 4)
      .map((h) => ({ genre: 'niveau', date: h.date, competence: trouverCompetence(referentiel, cid), axe: h.axe })),
  )
  const acquis = trierParDateDesc([...declics, ...passages4]).slice(0, 6)
  const derniers = trierParDateDesc(suivi.resultats).slice(0, 5)

  return (
    <>
      <Entete titre={`Bonjour ${eleve.prenom}`} sousTitre={eleve.classe ? `${eleve.classe} · NSI` : 'NSI'} />

      <div className="grille grille--3">
        <section className="feuille">
          <h2>Compte à rebours</h2>
          {examen ? (
            <>
              <div className="chiffre-cle">{jours === 0 ? 'Jour J' : `${jours} jour${jours > 1 ? 's' : ''}`}</div>
              <p style={{ marginTop: 6 }}>
                avant <strong>{examen.titre}</strong>, le {formatDate(examen.date)}.
              </p>
              {examen.format && <p className="petit discret">{examen.format}</p>}
            </>
          ) : (
            <p className="vide">Aucun examen à venir avec une date.</p>
          )}
        </section>

        <section className="feuille" style={{ gridColumn: 'span 2' }}>
          <h2>Prochaine séance</h2>
          {prochaine ? (
            <>
              <p>
                <span className="seance__numero" style={{ fontSize: '1.6rem' }}>
                  {prochaine.numero}.
                </span>{' '}
                <strong>{prochaine.titre}</strong>
                <span className="discret"> · {prochaine.date ? formatDate(prochaine.date) : 'date à fixer'}</span>
              </p>
              {prochaine.objectifs?.length > 0 && (
                <ul style={{ margin: '0 0 10px', paddingLeft: '1.2em' }}>
                  {prochaine.objectifs.filter(Boolean).map((o, i) => (
                    <li key={i}>{o}</li>
                  ))}
                </ul>
              )}
              <ul className="liste-simple">
                {(prochaine.exercices || []).map((id) => (
                  <LigneExercice key={id} exercice={parId[id]} suivi={suivi} />
                ))}
              </ul>
              <p className="petit" style={{ marginTop: 8 }}>
                <Link to="/seances">Préparer la séance →</Link>
              </p>
            </>
          ) : (
            <p className="vide">
              Toutes les séances sont faites. <Link to="/seances">Ajouter une séance</Link>
            </p>
          )}
        </section>
      </div>

      <section className="feuille" style={{ marginTop: 16 }}>
        <h2>Progression par thème</h2>
        <div className="progression">
          {referentiel.themes.map((t) => (
            <div key={t.id} style={{ display: 'contents' }}>
              <div className="progression__theme">
                <span className="pastille" style={{ background: t.couleur }} aria-hidden="true" />
                <Link to="/competences" style={{ color: 'inherit', textDecoration: 'none' }}>
                  {t.court}
                </Link>
              </div>
              <div className="progression__barres">
                <BarreProgression axe="lire" valeur={progressionTheme(t, suivi, 'lire')} />
                <BarreProgression axe="ecrire" valeur={progressionTheme(t, suivi, 'ecrire')} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="grille grille--2" style={{ marginTop: 16 }}>
        <section className="feuille">
          <h2>À retravailler</h2>
          {aRetravailler.length === 0 && blocages.length === 0 && (
            <p className="vide">Rien de signalé pour l’instant.</p>
          )}
          {aRetravailler.length > 0 && (
            <ul className="liste-simple">
              {aRetravailler.map((c) => {
                const n = niveauDe(suivi, c.id)
                return (
                  <li key={c.id}>
                    <span>
                      {c.label} <span className="petit discret">· {c.theme.court}</span>
                    </span>
                    <span>
                      <Pastille niveau={n.lire} titre="Lire" /> <Pastille niveau={n.ecrire} titre="Écrire" />
                    </span>
                  </li>
                )
              })}
            </ul>
          )}
          {blocages.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <h3>Blocages non résolus</h3>
              {blocages.map((n) => (
                <Note key={n.id} note={n} avecCompetence competence={trouverCompetence(referentiel, n.competence)} />
              ))}
            </div>
          )}
        </section>

        <section className="feuille">
          <h2>Acquis récents</h2>
          {acquis.length === 0 ? (
            <p className="vide">Pas encore de déclic noté ni de compétence maîtrisée.</p>
          ) : (
            <ul className="liste-simple">
              {acquis.map((a, i) =>
                a.genre === 'declic' ? (
                  <li key={i}>
                    <span>
                      <span className="annotation">{a.note.texte}</span>
                      {a.note.competence && (
                        <span className="petit discret"> · {trouverCompetence(referentiel, a.note.competence)?.label}</span>
                      )}
                    </span>
                    <span className="petit discret">{formatDateCourte(a.date)}</span>
                  </li>
                ) : (
                  <li key={i}>
                    <span>
                      <Pastille niveau={4} /> <strong>{a.competence?.label}</strong>{' '}
                      <span className="petit discret">maîtrisé en {a.axe === 'lire' ? 'lecture' : 'écriture'}</span>
                    </span>
                    <span className="petit discret">{formatDateCourte(a.date)}</span>
                  </li>
                ),
              )}
            </ul>
          )}

          <h3 style={{ marginTop: 18 }}>Derniers exercices</h3>
          {derniers.length === 0 ? (
            <p className="vide">Aucun exercice noté.</p>
          ) : (
            <ul className="liste-simple">
              {derniers.map((r) => (
                <li key={r.id}>
                  <Link to={`/exercices/${r.exercice}`}>{parId[r.exercice]?.titre || r.exercice}</Link>
                  <Resultat resultat={r} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  )
}
