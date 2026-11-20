import { NavLink, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import {
  BookOpen,
  CalendarDays,
  ChevronsUpDown,
  CircleAlert,
  FileText,
  LayoutGrid,
  NotebookPen,
  SquareCode,
  Target,
} from 'lucide-react'
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
  { to: '/', label: 'Tableau de bord', icone: LayoutGrid, end: true },
  { to: '/competences', label: 'Compétences', icone: Target },
  { to: '/seances', label: 'Séances', icone: CalendarDays },
  { to: '/exercices', label: 'Exercices', icone: SquareCode },
  { to: '/memo', label: 'Mémo', icone: BookOpen },
  { to: '/bilan', label: 'Bilan', icone: FileText },
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

function Echeance() {
  const { eleve } = useStore()
  const examen = prochainExamen(eleve)
  if (!examen) return null
  const jours = joursAvant(examen.date)
  return (
    <div className="echeance" title={`${examen.titre} — ${formatDate(examen.date)}`}>
      <span className="echeance__jours">{jours === 0 ? 'J' : `J-${jours}`}</span>
      <span className="echeance__titre">{examen.titre}</span>
      <span className="echeance__date">{formatDate(examen.date, { weekday: 'long', day: 'numeric', month: 'long' })}</span>
    </div>
  )
}

function Barre() {
  const { eleves, eleveId, eleve, choisirEleve } = useStore()
  return (
    <aside className="barre">
      <NavLink to="/" className="espace" aria-label="Cahier NSI, tableau de bord">
        <span className="espace__logo" aria-hidden="true">
          <NotebookPen size={15} className="icone" />
        </span>
        <span>
          <span className="espace__nom" style={{ display: 'block' }}>
            Cahier NSI
          </span>
          <span className="espace__sous">Terminale · {new Date().getFullYear()}</span>
        </span>
      </NavLink>

      <div className="eleve-choix">
        <label className="sr-only" htmlFor="choix-eleve">
          Élève
        </label>
        <span className="eleve-choix__avatar" aria-hidden="true">
          {eleve?.prenom?.[0] ?? '?'}
        </span>
        <select id="choix-eleve" value={eleveId || ''} onChange={(e) => choisirEleve(e.target.value)}>
          {(eleves?.eleves || []).map((e) => (
            <option key={e.id} value={e.id}>
              {e.prenom}
            </option>
          ))}
        </select>
        <ChevronsUpDown size={14} className="icone eleve-choix__chevron" aria-hidden="true" />
      </div>

      <Echeance />

      <nav className="nav" aria-label="Pages">
        {PAGES.map(({ to, label, icone: Icone, end }) => (
          <NavLink key={to} to={to} end={end}>
            <Icone size={17} className="icone" aria-hidden="true" />
            {label}
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
    <div className="carte" style={{ padding: 28, maxWidth: 520 }}>
      <h1 style={{ fontSize: '1.5rem', marginBottom: 8 }}>Page introuvable</h1>
      <p className="discret">
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
        <div className="carte">
          <div className="alerte">
            <CircleAlert size={18} className="icone" aria-hidden="true" />
            <div>
              <strong>Chargement impossible.</strong>
              <p style={{ margin: '4px 0 0' }}>{chargement.message}</p>
            </div>
          </div>
          <p className="petit discret" style={{ marginTop: 14 }}>
            Vérifie que le site est lancé avec « npm run dev » et que le dossier data/ existe.
          </p>
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
        <div className="carte">
          <h1 style={{ fontSize: '1.4rem', marginBottom: 8 }}>Aucun élève</h1>
          <p className="discret">
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
