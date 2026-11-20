// Accès aux fichiers JSON de data/ via le plugin Vite.

export async function lireJSON(chemin) {
  const rep = await fetch(`/api/data/${chemin}`, { cache: 'no-store' })
  if (rep.status === 404) return null
  if (!rep.ok) throw new Error(`Lecture de ${chemin} impossible (${rep.status})`)
  return rep.json()
}

export async function ecrireJSON(chemin, donnees, { keepalive = false } = {}) {
  const rep = await fetch(`/api/data/${chemin}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(donnees),
    keepalive,
  })
  if (!rep.ok) {
    let message = `Erreur ${rep.status}`
    try {
      message = (await rep.json()).erreur || message
    } catch {
      /* corps illisible : on garde le code */
    }
    throw new Error(`${chemin} : ${message}`)
  }
}
