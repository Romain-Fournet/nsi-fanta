// Liens Basthon : https://console.basthon.fr/?script=<code>
// Le code est compressé en zlib (CompressionStream('deflate')) puis encodé
// en base64 « url » (- et _), sans = final — comme le bouton « Partager ».

export const SEPARATEUR_TESTS = '# ---------- Tests ----------'
export const SEPARATEUR_SQL = '-- ---------- Tes requêtes ----------'

async function zlibBase64Url(texte) {
  const flux = new Blob([new TextEncoder().encode(texte)])
    .stream()
    .pipeThrough(new CompressionStream('deflate'))
  const octets = new Uint8Array(await new Response(flux).arrayBuffer())
  let binaire = ''
  for (let i = 0; i < octets.length; i += 0x8000) {
    binaire += String.fromCharCode(...octets.subarray(i, i + 0x8000))
  }
  return btoa(binaire).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

/** Le script envoyé à Basthon pour un exercice, selon son type. */
export function scriptExercice(exercice, bases = {}) {
  const code = exercice.code || ''
  if (exercice.langage === 'sql') {
    const base = bases[exercice.base]
    const creation = base ? base.script.trim() : ''
    return `${creation}\n\n${SEPARATEUR_SQL}\n\n${code}`.trim() + '\n'
  }
  if (exercice.type === 'lire' || exercice.type === 'trace' || !exercice.tests?.trim()) {
    return code
  }
  return `${code.replace(/\s+$/, '')}\n\n\n${SEPARATEUR_TESTS}\n${exercice.tests.trim()}\nprint("Tous les tests passent !")\n`
}

export async function lienBasthon(script, { langage = 'python' } = {}) {
  const params = new URLSearchParams()
  if (langage === 'sql') params.set('kernel', 'sql')
  params.set('script', await zlibBase64Url(script))
  // URLSearchParams n'encode pas - et _ : le lien reste lisible par Basthon.
  return `https://console.basthon.fr/?${params.toString()}`
}

/** Au-delà, certains navigateurs ou serveurs refusent le lien : on propose la copie. */
export const LONGUEUR_LIEN_MAX = 8000
