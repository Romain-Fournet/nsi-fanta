// Petit plugin Vite : lit et écrit les fichiers JSON de data/ via
//   GET /api/data/<chemin>.json   et   PUT /api/data/<chemin>.json
// Règles : chemins data/…/*.json seulement (lettres, chiffres, -, _), pas de ..,
// JSON invalide refusé, écriture atomique (fichier temporaire + renommage),
// copie du fichier dans data/_sauvegardes/<date>/ avant la première écriture du jour.
import fs from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'

const CHEMIN_VALIDE = /^[A-Za-z0-9_-]+(\/[A-Za-z0-9_-]+)*\.json$/
const PREFIXE = '/api/data/'

function aujourdhui() {
  const d = new Date()
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

function lireCorps(req) {
  return new Promise((resolve, reject) => {
    let corps = ''
    req.setEncoding('utf8')
    req.on('data', (morceau) => {
      corps += morceau
      if (corps.length > 20_000_000) reject(new Error('Fichier trop gros'))
    })
    req.on('end', () => resolve(corps))
    req.on('error', reject)
  })
}

function repondre(res, statut, objet) {
  res.statusCode = statut
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Cache-Control', 'no-store')
  res.end(typeof objet === 'string' ? objet : JSON.stringify(objet))
}

async function copierDossier(source, cible) {
  await fs.mkdir(cible, { recursive: true })
  for (const entree of await fs.readdir(source, { withFileTypes: true })) {
    const s = path.join(source, entree.name)
    const c = path.join(cible, entree.name)
    if (entree.isDirectory()) await copierDossier(s, c)
    else if (!existsSync(c)) await fs.copyFile(s, c)
  }
}

// Premier lancement : si data/eleves.json manque, on copie l'élève d'exemple.
async function initialiserDepuisExemple(dataDir) {
  const eleves = path.join(dataDir, 'eleves.json')
  const exemple = path.join(dataDir, 'exemple')
  if (existsSync(eleves) || !existsSync(path.join(exemple, 'eleves.json'))) return
  await fs.copyFile(path.join(exemple, 'eleves.json'), eleves)
  if (existsSync(path.join(exemple, 'eleves'))) {
    await copierDossier(path.join(exemple, 'eleves'), path.join(dataDir, 'eleves'))
  }
  console.log('[json-storage] data/eleves.json absent : élève d’exemple copié.')
}

export default function jsonStorage({ dataDir = 'data' } = {}) {
  let racine
  return {
    name: 'json-storage',
    config() {
      // Sans ça, chaque sauvegarde rechargerait la page.
      return { server: { watch: { ignored: [`**/${dataDir}/**`] } } }
    },
    configResolved(config) {
      racine = path.resolve(config.root, dataDir)
    },
    async configureServer(server) {
      await initialiserDepuisExemple(racine)

      server.middlewares.use(async (req, res, next) => {
        if (!req.url || !req.url.startsWith(PREFIXE)) return next()
        const relatif = decodeURIComponent(req.url.slice(PREFIXE.length).split('?')[0])
        if (!CHEMIN_VALIDE.test(relatif) || relatif.includes('..')) {
          return repondre(res, 400, { erreur: 'Chemin refusé' })
        }
        if (relatif.split('/')[0] === '_sauvegardes') {
          return repondre(res, 403, { erreur: 'Dossier protégé' })
        }
        const fichier = path.join(racine, relatif)
        if (!fichier.startsWith(racine + path.sep)) {
          return repondre(res, 400, { erreur: 'Chemin refusé' })
        }

        try {
          if (req.method === 'GET') {
            if (!existsSync(fichier)) return repondre(res, 404, { erreur: 'Fichier absent' })
            return repondre(res, 200, await fs.readFile(fichier, 'utf8'))
          }

          if (req.method === 'PUT') {
            const corps = await lireCorps(req)
            let donnees
            try {
              donnees = JSON.parse(corps)
            } catch {
              return repondre(res, 400, { erreur: 'JSON invalide, fichier non modifié' })
            }
            await fs.mkdir(path.dirname(fichier), { recursive: true })

            // Copie de sécurité avant la première écriture de la journée.
            if (existsSync(fichier)) {
              const copie = path.join(racine, '_sauvegardes', aujourdhui(), relatif)
              if (!existsSync(copie)) {
                await fs.mkdir(path.dirname(copie), { recursive: true })
                await fs.copyFile(fichier, copie)
              }
            }

            const temporaire = `${fichier}.${process.pid}.${Date.now()}.tmp`
            await fs.writeFile(temporaire, JSON.stringify(donnees, null, 2) + '\n', 'utf8')
            await fs.rename(temporaire, fichier)
            return repondre(res, 200, { ok: true })
          }

          res.setHeader('Allow', 'GET, PUT')
          return repondre(res, 405, { erreur: 'Méthode non permise' })
        } catch (e) {
          console.error('[json-storage]', e)
          return repondre(res, 500, { erreur: e.message })
        }
      })
    },
  }
}
