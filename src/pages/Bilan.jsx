import { Link } from 'react-router-dom'
import { useStore } from '../store.jsx'
import { LegendeNiveaux, Pastille } from '../components/ui.jsx'
import { formatDate, niveauDe, toutesCompetences, trierParDateDesc, trouverCompetence } from '../lib/outils.js'

function Niveau({ valeur, niveaux }) {
  const label = niveaux.find((n) => n.valeur === valeur)?.label
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <Pastille niveau={valeur} /> {label}
    </span>
  )
}

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
    <>
      <div className="bilan__barre">
        <Link to="/">← Retour au cahier</Link>
        <button type="button" className="btn" onClick={() => window.print()}>
          Imprimer le bilan
        </button>
      </div>

      <article className="bilan">
        <header>
          <h1 style={{ marginBottom: 4 }}>Bilan NSI — {eleve.prenom}</h1>
          <p className="discret">
            {eleve.classe ? `${eleve.classe} · ` : ''}établi le {formatDate(new Date().toISOString())}
          </p>
          <LegendeNiveaux niveaux={niveaux} />
        </header>

        <h2>Compétences par thème</h2>
        {referentiel.themes.map((t) => (
          <section key={t.id} style={{ marginBottom: 18 }}>
            <h3 style={{ color: t.couleur }}>{t.titre}</h3>
            <table className="tableau">
              <thead>
                <tr>
                  <th>Compétence</th>
                  <th style={{ width: '22%' }}>Lire</th>
                  <th style={{ width: '22%' }}>Écrire</th>
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
          </section>
        ))}

        <h2>Points forts</h2>
        {forts.length === 0 ? (
          <p className="vide">Pas encore de compétence maîtrisée.</p>
        ) : (
          <ul>
            {forts.map((c) => (
              <li key={c.id}>
                {c.label} <span className="discret petit">({c.theme.court})</span>
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
              const axes = [
                [1, 2].includes(n.lire) && 'lire',
                [1, 2].includes(n.ecrire) && 'écrire',
              ].filter(Boolean)
              return (
                <li key={c.id}>
                  {c.label} <span className="discret petit">({c.theme.court}, {axes.join(' et ')})</span>
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
                <span className="annotation">{n.texte}</span>
                <span className="discret petit">
                  {' '}
                  · {trouverCompetence(referentiel, n.competence)?.label || 'général'} · {formatDate(n.date)}
                </span>
              </li>
            ))}
          </ul>
        )}

        <h2>Exercices faits</h2>
        <div className="bilan-chiffres">
          <div>
            <strong>{derniers.size}</strong>
            <span className="discret">exercices sur {exercices.exercices.length}</span>
          </div>
          <div>
            <strong style={{ color: 'var(--maitrise)' }}>{compte.seule}</strong>
            <span className="discret">réussis seule</span>
          </div>
          <div>
            <strong style={{ color: '#a07f00' }}>{compte.aide}</strong>
            <span className="discret">réussis avec aide</span>
          </div>
          <div>
            <strong style={{ color: 'var(--stylo-rouge)' }}>{compte.echec}</strong>
            <span className="discret">pas réussis</span>
          </div>
        </div>
        <p className="petit discret" style={{ marginTop: 8 }}>
          Compté sur le dernier essai de chaque exercice ({suivi.resultats.length} essai
          {suivi.resultats.length > 1 ? 's' : ''} en tout).
        </p>
        {derniers.size > 0 && (
          <table className="tableau" style={{ marginTop: 8 }}>
            <thead>
              <tr>
                <th>Exercice</th>
                <th>Dernier résultat</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {[...derniers.values()].map((r) => (
                <tr key={r.exercice}>
                  <td>
                    <code className="inline">{r.exercice}</code> {parId[r.exercice]?.titre}
                  </td>
                  <td>{{ seule: 'Réussi seule', aide: 'Avec aide', echec: 'Pas réussi' }[r.resultat]}</td>
                  <td>{formatDate(r.date, { day: 'numeric', month: 'short' })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <h2>Séances</h2>
        {faites.length === 0 ? (
          <p className="vide">Aucune séance faite pour l’instant.</p>
        ) : (
          faites.map((s) => (
            <section key={s.id} style={{ marginBottom: 14, breakInside: 'avoid' }}>
              <h3>
                Séance {s.numero} — {s.titre}
                {s.date && <span className="discret petit"> · {formatDate(s.date)}</span>}
              </h3>
              {s.bilan ? <p style={{ whiteSpace: 'pre-wrap' }}>{s.bilan}</p> : <p className="vide">Pas de bilan écrit.</p>}
            </section>
          ))
        )}
      </article>
    </>
  )
}
