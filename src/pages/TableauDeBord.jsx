import { Link } from 'react-router-dom'
import { CalendarDays, CircleAlert, History, LayoutGrid, Sparkles, TrendingUp } from 'lucide-react'
import { useStore } from '../store.jsx'
import {
  BarreProgression,
  Carte,
  Entete,
  LienCarte,
  LigneExercice,
  Niveau,
  Resultat,
  Tag,
  typo,
} from '../components/ui.jsx'
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
  const niveaux = referentiel.niveaux
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
      <Entete
        icone={LayoutGrid}
        titre={`Bonjour ${eleve.prenom}`}
        sousTitre="Où tu en es en NSI, ce qui arrive et ce qui reste à retravailler."
        proprietes={
          <>
            {examen && (
              <Tag couleur="bleu" grand title={formatDate(examen.date)}>
                {jours === 0 ? 'Aujourd’hui' : `J-${jours}`} · {examen.titre}
              </Tag>
            )}
            {eleve.classe && <Tag grand>{eleve.classe}</Tag>}
          </>
        }
      />

      <div className="grille grille--3">
        <Carte
          className="large-2"
          titre="Prochaine séance"
          icone={CalendarDays}
          action={<LienCarte to="/seances">Préparer</LienCarte>}
        >
          {prochaine ? (
            <div className="pile" style={{ gap: 16 }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <span className="seance__numero">{prochaine.numero}</span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 650, fontSize: '1.02rem' }}>{prochaine.titre}</div>
                  <div className="petit discret">{prochaine.date ? formatDate(prochaine.date) : 'Date à fixer'}</div>
                </div>
              </div>
              {prochaine.objectifs?.filter(Boolean).length > 0 && (
                <ul style={{ margin: 0, paddingLeft: '1.2em', color: 'var(--encre-2)', fontSize: '0.92rem' }}>
                  {prochaine.objectifs.filter(Boolean).map((o, i) => (
                    <li key={i} style={{ marginTop: i ? 3 : 0 }}>
                      {o}
                    </li>
                  ))}
                </ul>
              )}
              {(prochaine.exercices || []).length > 0 && (
                <div>
                  <div className="sous-titre">Exercices en séance</div>
                  <ul className="lignes">
                    {prochaine.exercices.map((id) => (
                      <LigneExercice key={id} exercice={parId[id]} suivi={suivi} />
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <p className="vide">
              Toutes les séances sont faites. <Link to="/seances">Ajouter une séance</Link>
            </p>
          )}
        </Carte>

        <Carte titre="À retravailler" icone={CircleAlert} action={<LienCarte to="/competences">Voir</LienCarte>}>
          {aRetravailler.length === 0 && blocages.length === 0 ? (
            <p className="vide">Rien de signalé pour l’instant. Les compétences notées « bloque » ou « fragile » apparaîtront ici.</p>
          ) : (
            <div className="pile" style={{ gap: 18 }}>
              {blocages.length > 0 && (
                <div className="callout callout--rouge">
                  <CircleAlert size={17} className="icone" aria-hidden="true" />
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontWeight: 600 }}>
                      {blocages.length} blocage{blocages.length > 1 ? 's' : ''} non résolu{blocages.length > 1 ? 's' : ''}
                    </div>
                    {blocages.map((n) => (
                      <div key={n.id} style={{ marginTop: 6 }}>
                        <div>{typo(n.texte)}</div>
                        <div className="petit" style={{ opacity: 0.8 }}>
                          {trouverCompetence(referentiel, n.competence)?.label || 'Général'} · {formatDateCourte(n.date)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {aRetravailler.length > 0 && (
                <ul className="lignes">
                  {aRetravailler.map((c) => {
                    const n = niveauDe(suivi, c.id)
                    return (
                      <li key={c.id} style={{ alignItems: 'flex-start' }}>
                        <span style={{ minWidth: 0 }}>
                          <span style={{ display: 'block', fontSize: '0.9rem' }}>{c.label}</span>
                          <span className="petit discret">{c.theme.court}</span>
                        </span>
                        <span style={{ display: 'grid', gap: 4, justifyItems: 'end', paddingTop: 3 }}>
                          <Niveau mini axe="lire" valeur={n.lire} niveaux={niveaux} />
                          <Niveau mini axe="ecrire" valeur={n.ecrire} niveaux={niveaux} />
                        </span>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          )}
        </Carte>
      </div>

      <Carte
        titre="Progression par thème"
        icone={TrendingUp}
        action={<LienCarte to="/bilan">Bilan</LienCarte>}
        flush
        style={{ marginTop: 20 }}
      >
        <div className="progression__ligne progression__entete">
          <span>Thème</span>
          <span>Lire</span>
          <span>Écrire</span>
        </div>
        {referentiel.themes.map((t) => (
          <div key={t.id} className="progression__ligne">
            <div className="progression__theme">
              <span className="point" style={{ '--c': t.couleur }} aria-hidden="true" />
              {t.court}
            </div>
            <BarreProgression valeur={progressionTheme(t, suivi, 'lire')} couleur={t.couleur} label={`${t.court}, lire`} />
            <BarreProgression valeur={progressionTheme(t, suivi, 'ecrire')} couleur={t.couleur} label={`${t.court}, écrire`} />
          </div>
        ))}
      </Carte>

      <div className="grille grille--2" style={{ marginTop: 20 }}>
        <Carte titre="Acquis récents" icone={Sparkles}>
          {acquis.length === 0 ? (
            <p className="vide">Pas encore de déclic noté ni de compétence maîtrisée.</p>
          ) : (
            <ul className="lignes">
              {acquis.map((a, i) =>
                a.genre === 'declic' ? (
                  <li key={i}>
                    <span style={{ minWidth: 0 }}>
                      <span style={{ display: 'block', fontSize: '0.92rem' }}>{a.note.texte}</span>
                      {a.note.competence && (
                        <span className="petit discret">{trouverCompetence(referentiel, a.note.competence)?.label}</span>
                      )}
                    </span>
                    <span className="boutons" style={{ flexWrap: 'nowrap' }}>
                      <Tag couleur="vert">Déclic</Tag>
                      <span className="petit discret">{formatDateCourte(a.date)}</span>
                    </span>
                  </li>
                ) : (
                  <li key={i}>
                    <span style={{ minWidth: 0 }}>
                      <span style={{ display: 'block', fontSize: '0.92rem' }}>{a.competence?.label}</span>
                      <span className="petit discret">Maîtrisé en {a.axe === 'lire' ? 'lecture' : 'écriture'}</span>
                    </span>
                    <span className="boutons" style={{ flexWrap: 'nowrap' }}>
                      <Niveau mini valeur={4} niveaux={niveaux} />
                      <span className="petit discret">{formatDateCourte(a.date)}</span>
                    </span>
                  </li>
                ),
              )}
            </ul>
          )}
        </Carte>

        <Carte titre="Derniers exercices" icone={History} action={<LienCarte to="/exercices">Tous</LienCarte>}>
          {derniers.length === 0 ? (
            <p className="vide">Aucun exercice noté. Les résultats s’ajoutent depuis la page d’un exercice.</p>
          ) : (
            <ul className="lignes">
              {derniers.map((r) => (
                <li key={r.id}>
                  <Link className="ligne__titre" to={`/exercices/${r.exercice}`}>
                    <span className="id">{r.exercice}</span>
                    <span>{parId[r.exercice]?.titre || r.exercice}</span>
                  </Link>
                  <Resultat resultat={r} avecDate />
                </li>
              ))}
            </ul>
          )}
        </Carte>
      </div>
    </>
  )
}
