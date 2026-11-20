import { NavLink, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { useStore } from './store.jsx'
import { formatDate, joursAvant, prochainExamen } from './lib/outils.js'
import TableauDeBord from './pages/TableauDeBord.jsx'
import Competences from './pages/Competences.jsx'
import Seances from './pages/Seances.jsx'
import Exercices from './pages/Exercices.jsx'
import Exercice from './pages/Exercice.jsx'
import EditeurExercice from './pages/EditeurExercice.jsx'
import Memo from './pages/Memo.jsx'
import Bilan from './pages/Bilan.jsx'

const PAGES = [
  { to: '/', label: 'Tableau de bord', end: true },
  { to: '/competences', label: 'Compétences' },
  { to: '/seances', label: 'Séances' },
  { to: '/exercices', label: 'Exercices' },
  { to: '/memo', label: 'Mémo' },
  { to: '/bilan', label: 'Bilan' },
]

function IndicateurSauvegarde() {
  const { sauvegarde } = useStore()
  const textes = {
    ok: 'Enregistré',
    attente: 'Modifié…',
    enregistrement: 'Enregistrement…',
    erreur: `Erreur : ${sauvegarde.message}`,
  }
  return (
    <div className={`sauvegarde sauvegarde--${sauvegarde.etat}`} role="status" aria-live="polite">
      <span className="sauvegarde__point" aria-hidden="true" />
      <span>{textes[sauvegarde.etat]}</span>
    </div>
  )
}

function CompteARebours() {
  const { eleve } = useStore()
  const examen = prochainExamen(eleve)
  if (!examen) {
    return (
      <div className="compte">
        <div className="compte__texte">Aucun examen daté.</div>
      </div>
    )
  }
  const jours = joursAvant(examen.date)
  return (
    <div className="compte">
      <div className="compte__nombre">{jours === 0 ? 'Jour J' : `J-${jours}`}</div>
      <div className="compte__texte">
        {examen.titre}
        <br />
        {formatDate(examen.date)}
      </div>
    </div>
  )
}

function Barre() {
  const { eleves, eleveId, choisirEleve } = useStore()
  return (
    <aside className="barre">
      <NavLink to="/" className="barre__titre">
        Cahier NSI <span>suivi</span>
      </NavLink>

      <div className="barre__bloc">
        <label className="barre__label" htmlFor="choix-eleve">
          Élève
        </label>
        <select id="choix-eleve" value={eleveId || ''} onChange={(e) => choisirEleve(e.target.value)}>
          {(eleves?.eleves || []).map((e) => (
            <option key={e.id} value={e.id}>
              {e.prenom}
              {e.classe ? ` — ${e.classe}` : ''}
            </option>
          ))}
        </select>
      </div>

      <div className="barre__bloc">
        <span className="barre__label">Prochain examen</span>
        <CompteARebours />
      </div>

      <nav className="nav" aria-label="Pages">
        {PAGES.map((p) => (
          <NavLink key={p.to} to={p.to} end={p.end}>
            {p.label}
          </NavLink>
        ))}
      </nav>

      <IndicateurSauvegarde />
    </aside>
  )
}

function Mise() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return (
    <div className="app">
      <Barre />
      <main className="page" id="contenu">
        <div className="page__contenu">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

function PageIntrouvable() {
  return (
    <div className="feuille">
      <h1>Page introuvable</h1>
      <p>
        Cette adresse ne correspond à aucune page. <NavLink to="/">Retour au tableau de bord</NavLink>
      </p>
    </div>
  )
}

export default function App() {
  const { chargement, eleve, eleves } = useStore()

  if (chargement.etat === 'erreur') {
    return (
      <div className="ecran-centre">
        <div className="alerte">
          <strong>Chargement impossible.</strong>
          <p>{chargement.message}</p>
          <p className="petit">Vérifie que le site est lancé avec « npm run dev » et que le dossier data/ existe.</p>
        </div>
      </div>
    )
  }
  if (chargement.etat === 'chargement') {
    return (
      <div className="ecran-centre discret" role="status">
        Ouverture du cahier…
      </div>
    )
  }
  if (!eleve) {
    return (
      <div className="ecran-centre">
        <div className="feuille">
          <h1>Aucun élève</h1>
          <p>
            Ajoute un élève dans <code className="inline">data/eleves.json</code>
            {eleves?.eleves?.length === 0 ? ' (la liste est vide)' : ''}, puis recharge la page.
          </p>
        </div>
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/bilan" element={<Bilan />} />
      <Route element={<Mise />}>
        <Route index element={<TableauDeBord />} />
        <Route path="competences" element={<Competences />} />
        <Route path="seances" element={<Seances />} />
        <Route path="exercices" element={<Exercices />} />
        <Route path="exercices/nouveau" element={<EditeurExercice />} />
        <Route path="exercices/:id" element={<Exercice />} />
        <Route path="exercices/:id/modifier" element={<EditeurExercice />} />
        <Route path="memo" element={<Memo />} />
        <Route path="*" element={<PageIntrouvable />} />
      </Route>
    </Routes>
  )
}
