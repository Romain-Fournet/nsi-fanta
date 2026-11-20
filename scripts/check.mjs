// Vérification du contenu pédagogique : node scripts/check.mjs (ou npm run check).
// Node >= 20, ESM, sans dépendance npm. Nécessite python3 dans le PATH.
//
// Piste : @basthon/kernel-node pourrait remplacer python3 pour exécuter le code
// avec le même Python (Pyodide) que Basthon. À essayer.

import { readFileSync, writeFileSync, mkdtempSync, rmSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const racine = join(dirname(fileURLToPath(import.meta.url)), "..");
const ATTENDU = 27;
const TIMEOUT = 10_000;
const TYPES = ["lire", "trace", "bug", "completer", "ecrire", "sql", "papier"];
const LANGAGES = ["python", "sql", "texte"];
const CHAMPS = ["id", "theme", "competences", "titre", "type", "langage", "difficulte", "duree",
  "enonce", "code", "tests", "indice", "correction", "base", "papier"];
const SEPARATEUR = "\n\n# ---------- tests ----------\n";

const erreursGlobales = [];
const avertissementsGlobaux = [];

function charger(nom) {
  try {
    return JSON.parse(readFileSync(join(racine, "data", nom), "utf8"));
  } catch (e) {
    console.error(`✗ Impossible de lire data/${nom} : ${e.message}`);
    process.exit(1);
  }
}

const referentiel = charger("referentiel.json");
const contenu = charger("exercices.json");
const exercices = Array.isArray(contenu.exercices) ? contenu.exercices : [];
const bases = contenu.bases ?? {};

// Référentiel : thèmes et compétences (les compétences archivées sont ignorées).
const themes = new Map();
const competences = new Map(); // id -> { theme, archive }
for (const t of referentiel.themes ?? []) {
  themes.set(t.id, t);
  for (const c of t.competences ?? []) competences.set(c.id, { theme: t.id, archive: c.archive === true });
}

// ---------------------------------------------------------------- python3
const dossierTmp = mkdtempSync(join(tmpdir(), "nsi-check-"));
let compteurFichiers = 0;

function python(source, stdin) {
  const fichier = join(dossierTmp, `prog${compteurFichiers++}.py`);
  writeFileSync(fichier, source, "utf8");
  const r = spawnSync("python3", ["-I", fichier], {
    input: stdin ?? "",
    encoding: "utf8",
    timeout: TIMEOUT,
    env: { ...process.env, PYTHONIOENCODING: "utf-8" },
  });
  if (r.error && r.error.code === "ENOENT") {
    console.error("✗ python3 est introuvable : installe Python 3 pour lancer le check.");
    process.exit(1);
  }
  const delai = r.error?.code === "ETIMEDOUT" || r.signal === "SIGTERM";
  return { ok: r.status === 0 && !delai, delai, sortie: r.stdout ?? "", erreur: (r.stderr ?? "").trim() };
}

function derniereLigne(texte) {
  const lignes = texte.trim().split("\n");
  return lignes[lignes.length - 1] ?? "";
}

// Exécute le script d'une base puis chaque requête de la correction, une par une.
const EXECUTEUR_SQL = String.raw`
import sys, json, sqlite3
donnees = json.loads(sys.stdin.read())
con = sqlite3.connect(":memory:")
con.execute("PRAGMA foreign_keys = ON")
res = {"base_ok": True, "erreur_base": None, "requetes": []}
try:
    con.executescript(donnees["script"])
except Exception as e:
    res["base_ok"] = False
    res["erreur_base"] = str(e)
    print(json.dumps(res))
    sys.exit(0)
con.execute("PRAGMA foreign_keys = ON")

def sans_commentaires(req):
    return " ".join(l.strip() for l in req.split("\n") if l.strip() and not l.strip().startswith("--"))

tampon = ""
for ligne in donnees["requetes"].split("\n"):
    tampon += ligne + "\n"
    if sqlite3.complete_statement(tampon):
        req = sans_commentaires(tampon)
        tampon = ""
        if not req:
            continue
        info = {"requete": req}
        try:
            cur = con.execute(req)
            if cur.description is not None:
                info["lignes"] = len(cur.fetchall())
            else:
                info["modifiees"] = cur.rowcount
            con.commit()
        except Exception as e:
            info["erreur"] = str(e)
        res["requetes"].append(info)
reste = sans_commentaires(tampon)
if reste:
    res["requetes"].append({"requete": reste, "erreur": "requête incomplète (point-virgule manquant ?)"})
print(json.dumps(res))
`;

// ---------------------------------------------------------------- structure
console.log(`Exercices : ${exercices.length} (attendu : ${ATTENDU})${exercices.length === ATTENDU ? "" : "  ⚠"}`);
if (exercices.length !== ATTENDU) avertissementsGlobaux.push(`${exercices.length} exercices au lieu de ${ATTENDU}`);

const vus = new Set();
const couvertes = new Set();
const rapports = [];

for (const [i, ex] of exercices.entries()) {
  const id = typeof ex?.id === "string" ? ex.id : `#${i + 1}`;
  const rap = { id, erreurs: [], avert: [], infos: [] };
  rapports.push(rap);

  for (const champ of CHAMPS) if (!(champ in (ex ?? {}))) rap.erreurs.push(`champ manquant : ${champ}`);
  if (vus.has(id)) rap.erreurs.push("id en double");
  vus.add(id);

  if (!themes.has(ex.theme)) rap.erreurs.push(`thème inconnu : ${ex.theme}`);
  if (!Array.isArray(ex.competences) || ex.competences.length === 0) {
    rap.erreurs.push("competences doit être une liste non vide");
  } else {
    for (const c of ex.competences) {
      const comp = competences.get(c);
      if (!comp) rap.erreurs.push(`compétence inconnue : ${c}`);
      else {
        couvertes.add(c);
        if (comp.theme !== ex.theme) rap.avert.push(`compétence ${c} hors du thème ${ex.theme}`);
      }
    }
  }
  if (!TYPES.includes(ex.type)) rap.erreurs.push(`type invalide : ${ex.type}`);
  if (!LANGAGES.includes(ex.langage)) rap.erreurs.push(`langage invalide : ${ex.langage}`);
  if (![1, 2, 3].includes(ex.difficulte)) rap.erreurs.push(`difficulte doit valoir 1, 2 ou 3 : ${ex.difficulte}`);
  if (typeof ex.duree !== "number" || ex.duree <= 0) rap.erreurs.push(`duree invalide : ${ex.duree}`);
  if (typeof ex.papier !== "boolean") rap.erreurs.push("papier doit être true ou false");
  for (const champ of ["titre", "enonce", "code", "tests", "indice", "correction"]) {
    if (champ in ex && typeof ex[champ] !== "string") rap.erreurs.push(`${champ} doit être une chaîne`);
  }
  for (const champ of ["titre", "enonce", "indice", "correction"]) {
    if (typeof ex[champ] === "string" && !ex[champ].trim()) rap.erreurs.push(`${champ} est vide`);
  }
  if (ex.base !== null && ex.base !== undefined && !(ex.base in bases)) rap.erreurs.push(`base inconnue : ${ex.base}`);
  if (ex.langage === "sql" && !(ex.base in bases)) rap.erreurs.push("un exercice SQL doit indiquer sa base");
  if ((ex.type === "sql") !== (ex.langage === "sql")) rap.avert.push("type sql et langage sql devraient aller ensemble");
  if (ex.type === "papier" && !ex.papier) rap.avert.push("un exercice de type papier devrait avoir papier: true");
  const tout = `${ex.code ?? ""}\n${ex.correction ?? ""}`;
  if (ex.langage === "python" && /\bwhile\b/.test(tout) && !/infini/i.test(ex.enonce ?? "")) {
    rap.avert.push("boucle while sans avertissement « boucle infinie » dans l'énoncé");
  }
  if (/\binput\s*\(/.test(tout)) rap.avert.push("input() utilisé");
}

// Compétences non couvertes.
for (const [c, info] of competences) {
  if (!info.archive && !couvertes.has(c)) erreursGlobales.push(`compétence non couverte : ${c}`);
}

// ---------------------------------------------------------------- exécution
for (const [i, ex] of exercices.entries()) {
  const rap = rapports[i];
  if (rap.erreurs.length) continue; // structure invalide : on n'exécute pas
  const code = ex.code ?? "";
  const tests = ex.tests ?? "";

  if (ex.langage === "python") {
    if (["lire", "trace", "papier"].includes(ex.type)) {
      if (code.trim()) {
        const r = python(tests.trim() ? code + SEPARATEUR + tests : code);
        if (r.ok) rap.infos.push("le code s'exécute");
        else rap.erreurs.push(r.delai ? "code : délai de 10 s dépassé" : `code : ${derniereLigne(r.erreur)}`);
      } else rap.avert.push("pas de code à exécuter");
    } else {
      if (!tests.trim()) rap.avert.push("aucun test");
      const r = python(ex.correction + "\n" + SEPARATEUR + tests);
      if (r.ok) rap.infos.push("correction + tests OK");
      else rap.erreurs.push(r.delai ? "correction : délai de 10 s dépassé" : `correction : ${derniereLigne(r.erreur)}`);
      if (tests.trim()) {
        const d = python(code + "\n" + SEPARATEUR + tests);
        if (d.ok) rap.avert.push("le code de départ passe déjà les tests");
        else rap.infos.push("le code de départ échoue bien");
      }
    }
  } else if (ex.langage === "sql") {
    const base = bases[ex.base];
    const r = python(EXECUTEUR_SQL, JSON.stringify({ script: base.script ?? "", requetes: ex.correction }));
    if (!r.ok) {
      rap.erreurs.push(`exécuteur SQL : ${derniereLigne(r.erreur) || "échec"}`);
      continue;
    }
    const res = JSON.parse(r.sortie);
    if (!res.base_ok) {
      rap.erreurs.push(`script de la base ${ex.base} : ${res.erreur_base}`);
      continue;
    }
    if (res.requetes.length === 0) rap.erreurs.push("aucune requête dans la correction");
    for (const [n, q] of res.requetes.entries()) {
      const court = q.requete.length > 60 ? q.requete.slice(0, 57) + "..." : q.requete;
      if (q.erreur) rap.erreurs.push(`requête ${n + 1} : ${q.erreur}  [${court}]`);
      else if ("lignes" in q) {
        rap.infos.push(`requête ${n + 1} : ${q.lignes} ligne(s)`);
        if (q.lignes === 0) rap.avert.push(`requête ${n + 1} : SELECT sans résultat  [${court}]`);
      } else {
        rap.infos.push(`requête ${n + 1} : ${q.modifiees} ligne(s) modifiée(s)`);
        if (q.modifiees === 0) rap.avert.push(`requête ${n + 1} : aucune ligne modifiée  [${court}]`);
      }
    }
  }
}

rmSync(dossierTmp, { recursive: true, force: true });

// ---------------------------------------------------------------- résumé
let nbErreurs = erreursGlobales.length;
let nbAvert = avertissementsGlobaux.length;
console.log("");
for (const rap of rapports) {
  const ex = exercices.find((e) => e?.id === rap.id) ?? {};
  const signe = rap.erreurs.length ? "✗" : rap.avert.length ? "⚠" : "✓";
  console.log(`${signe} ${rap.id.padEnd(8)} ${String(ex.type ?? "?").padEnd(9)} ${rap.infos.join(" · ")}`);
  for (const e of rap.erreurs) console.log(`    ✗ ${e}`);
  for (const a of rap.avert) console.log(`    ⚠ ${a}`);
  nbErreurs += rap.erreurs.length;
  nbAvert += rap.avert.length;
}

const actives = [...competences.values()].filter((c) => !c.archive).length;
const couvertesActives = [...couvertes].filter((c) => !competences.get(c)?.archive).length;
console.log(`\nCompétences couvertes : ${couvertesActives}/${actives}`);
for (const e of erreursGlobales) console.log(`✗ ${e}`);
for (const a of avertissementsGlobaux) console.log(`⚠ ${a}`);

const ok = rapports.filter((r) => !r.erreurs.length).length;
console.log(`\n${ok}/${rapports.length} exercices sans erreur, ${nbErreurs} erreur(s), ${nbAvert} avertissement(s).`);
process.exit(nbErreurs > 0 ? 1 : 0);
