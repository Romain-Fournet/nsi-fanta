import { Link } from 'react-router-dom'
import { ArrowLeft, Printer } from 'lucide-react'
import { useStore } from '../store.jsx'
import { LegendeNiveaux, Niveau, Tag } from '../components/ui.jsx'
import { COULEUR_RESULTAT, RESULTATS, formatDate, niveauDe, toutesCompetences, trierParDateDesc, trouverCompetence } from '../lib/outils.js'

export default function Bilan() {
  const { referentiel, exercices, suivi, seances, eleve } = useStore()
  const niveaux = referentiel.niveaux
  const comps = toutesCompetences(referentiel)

  const forts = comps.filter((c) => {
    const n = niveauDe(suivi, c.id)
    return n.lire >= 3 && n.ecrire >= 3 && (n.lire === 4 || n.ecrire === 4)
  })
  const aTravailler = comps.filter((c) => {
    const n = niveauDe(suivi, c.id)
    return [1, 2].includes(n.lire) || [1, 2].includes(n.ecrire)
  })
  const blocages = trierParDateDesc(suivi.notes.filter((n) => n.type === 'blocage' && !n.resolue))

  // Exercices faits : on compte le dernier résultat de chaque exercice.
  const derniers = new Map()
  for (const r of [...suivi.resultats].sort((a, b) => a.date.localeCompare(b.date))) derniers.set(r.exercice, r)
  const compte = { seule: 0, aide: 0, echec: 0 }
  for (const r of derniers.values()) compte[r.resultat] = (compte[r.resultat] || 0) + 1
  const faites = [...seances.seances].filter((s) => s.faite).sort((a, b) => a.numero - b.numero)
  const parId = Object.fromEntries(exercices.exercices.map((e) => [e.id, e]))

  return (
    <div className="bilan-page">
      <div className="bilan__barre">
        <Link className="btn btn--fantome" to="/">
          <ArrowLeft size={15} className="icone" aria-hidden="true" />
          Retour au cahier
        </Link>
        <button type="button" className="btn" onClick={() => window.print()}>
          <Printer size={15} className="icone" aria-hidden="true" />
          Imprimer le bilan
        </button>
      </div>

      <article className="bilan">
        <header style={{ display: 'grid', gap: 10 }}>
          <h1>Bilan NSI de {eleve.prenom}</h1>
          <p className="discret" style={{ margin: 0 }}>
            {eleve.classe ? `${eleve.classe} · ` : ''}établi le {formatDate(new Date().toISOString())}
          </p>
          <LegendeNiveaux niveaux={niveaux} />
        </header>

        <h2>Compétences par thème</h2>
        {referentiel.themes.map((t) => (
          <section key={t.id}>
            <h3>
              <span className="point" style={{ '--c': t.couleur }} aria-hidden="true" />
              {t.titre}
            </h3>
            <div className="bilan-table">
              <table className="tableau">
                <thead>
                  <tr>
                    <th>Compétence</th>
                    <th style={{ width: '24%' }}>Lire</th>
                    <th style={{ width: '24%' }}>Écrire</th>
                  </tr>
                </thead>
                <tbody>
                  {t.competences
                    .filter((c) => !c.archive)
                    .map((c) => {
                      const n = niveauDe(suivi, c.id)
                      return (
                        <tr key={c.id}>
                          <td>{c.label}</td>
                          <td>
                            <Niveau valeur={n.lire} niveaux={niveaux} />
                          </td>
                          <td>
                            <Niveau valeur={n.ecrire} niveaux={niveaux} />
                          </td>
                        </tr>
                      )
                    })}
                </tbody>
              </table>
            </div>
          </section>
        ))}

        <h2>Points forts</h2>
        {forts.length === 0 ? (
          <p className="vide">Pas encore de compétence maîtrisée.</p>
        ) : (
          <ul>
            {forts.map((c) => (
              <li key={c.id}>
                {c.label} <span className="discret petit">· {c.theme.court}</span>
              </li>
            ))}
          </ul>
        )}

        <h2>Points à travailler</h2>
        {aTravailler.length === 0 ? (
          <p className="vide">Rien de signalé.</p>
        ) : (
          <ul>
            {aTravailler.map((c) => {
              const n = niveauDe(suivi, c.id)
              const axes = [[1, 2].includes(n.lire) && 'lire', [1, 2].includes(n.ecrire) && 'écrire'].filter(Boolean)
              return (
                <li key={c.id}>
                  {c.label}{' '}
                  <span className="discret petit">
                    · {c.theme.court}, {axes.join(' et ')}
                  </span>
                </li>
              )
            })}
          </ul>
        )}

        <h3>Blocages non résolus</h3>
        {blocages.length === 0 ? (
          <p className="vide">Aucun.</p>
        ) : (
          <ul>
            {blocages.map((n) => (
              <li key={n.id}>
                {n.texte}{' '}
                <span className="discret petit">
                  · {trouverCompetence(referentiel, n.competence)?.label || 'général'}, {formatDate(n.date)}
                </span>
              </li>
            ))}
          </ul>
        )}

        <h2>Exercices faits</h2>
        <p>
          {derniers.size} exercice{derniers.size > 1 ? 's' : ''} fait{derniers.size > 1 ? 's' : ''} sur {exercices.exercices.length}
          {derniers.size > 0 && (
            <>
              {'\u00a0'}: <strong style={{ color: 'var(--vert)', fontWeight: 600 }}>{compte.seule} réussi{compte.seule > 1 ? 's' : ''} seule</strong>,{' '}
              <strong style={{ color: 'var(--jaune)', fontWeight: 600 }}>{compte.aide} avec aide</strong>,{' '}
              <strong style={{ color: 'var(--rouge)', fontWeight: 600 }}>
                {compte.echec} pas réussi{compte.echec > 1 ? 's' : ''}
              </strong>
              .
            </>
          )}
        </p>
        <p className="petit discret">
          Compté sur le dernier essai de chaque exercice ({suivi.resultats.length} essai
          {suivi.resultats.length > 1 ? 's' : ''} en tout).
        </p>
        {derniers.size > 0 && (
          <div className="bilan-table" style={{ marginTop: 12 }}>
            <table className="tableau">
              <thead>
                <tr>
                  <th>Exercice</th>
                  <th>Dernier résultat</th>
                  <th className="num">Date</th>
                </tr>
              </thead>
              <tbody>
                {[...derniers.values()].map((r) => (
                  <tr key={r.exercice}>
                    <td>
                      <span className="ligne__titre">
                        <span className="id">{r.exercice}</span>
                        <span>{parId[r.exercice]?.titre}</span>
                      </span>
                    </td>
                    <td>
                      <Tag couleur={COULEUR_RESULTAT[r.resultat]}>{RESULTATS[r.resultat]}</Tag>
                    </td>
                    <td className="num discret">{formatDate(r.date, { day: 'numeric', month: 'short' })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <h2>Séances</h2>
        {faites.length === 0 ? (
          <p className="vide">Aucune séance faite pour l’instant.</p>
        ) : (
          faites.map((s) => (
            <section key={s.id} style={{ marginBottom: 18, breakInside: 'avoid' }}>
              <h3>
                Séance {s.numero} · {s.titre}
                {s.date && <span className="discret petit" style={{ fontWeight: 400 }}>{formatDate(s.date)}</span>}
              </h3>
              {s.bilan ? <p style={{ whiteSpace: 'pre-wrap' }}>{s.bilan}</p> : <p className="vide">Pas de bilan écrit.</p>}
            </section>
          ))
        )}
      </article>
    </div>
  )
}
