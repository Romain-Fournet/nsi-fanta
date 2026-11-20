# Cahier NSI — suivi d'élève

Site local pour suivre une élève de terminale NSI : compétences évaluées en lecture et en écriture,
notes du prof, exercices progressifs à ouvrir dans [Basthon](https://basthon.fr), séances et bilan imprimable.

React 19 + Vite, en JavaScript, sans base de données : tout est dans des fichiers JSON du dossier `data/`.

## Installation et lancement

```bash
npm install
npm run dev
```

Puis ouvrir <http://localhost:5173>. Les modifications sont enregistrées automatiquement
(≈ 500 ms après la dernière), l'indicateur en bas de la barre latérale affiche « Enregistré » ou l'erreur.

Au premier lancement, si `data/eleves.json` n'existe pas, l'élève d'exemple de `data/exemple/` est copié.

Vérifier le contenu pédagogique (corrections Python exécutées avec leurs tests, requêtes SQL lancées sur SQLite) :

```bash
npm run check
```

Il faut `python3` dans le PATH.

## Pages

| Page | Adresse | Contenu |
| --- | --- | --- |
| Tableau de bord | `/` | Compte à rebours, prochaine séance, progression par thème, à retravailler, acquis récents |
| Compétences | `/competences` | Niveaux Lire / Écrire (clic sur une case, re-clic = « pas vu »), notes, historique |
| Séances | `/seances` | Préparation et bilan de chaque séance, note rapide |
| Exercices | `/exercices`, `/exercices/:id` | Banque filtrable, détail, lien Basthon, résultat, éditeur |
| Mémo | `/memo` | Fiche de syntaxe imprimable |
| Bilan | `/bilan` | Synthèse imprimable, sans barre latérale |

## Fichiers de données

```
data/
  referentiel.json        compétences par thème (versionné)
  exercices.json          bases SQL et exercices (versionné)
  exemple/                élève fictif, copié au premier lancement (versionné)
  eleves.json             liste des élèves (hors git)
  eleves/<id>/suivi.json  niveaux, notes, résultats (hors git)
  eleves/<id>/seances.json
  _sauvegardes/<date>/    copie de chaque fichier avant sa première écriture du jour (hors git)
```

Le serveur Vite expose `GET` et `PUT /api/data/<chemin>.json` (plugin `vite-plugin-json-storage.js`).
Seuls les chemins faits de lettres, chiffres, `-` et `_` sont acceptés, un JSON invalide est refusé
et l'écriture est atomique (fichier temporaire puis renommage).

### Valeurs fermées

- Niveau (`lire`, `ecrire`) : 0 pas vu, 1 bloque, 2 fragile, 3 en cours, 4 maîtrisé.
- Type d'exercice : `lire`, `trace`, `bug`, `completer`, `ecrire`, `sql`, `papier`.
- Langage : `python`, `sql`, `texte`.
- Type de note : `blocage`, `erreur`, `declic`, `astuce`, `remarque`.
- Résultat : `seule`, `aide`, `echec`. Mode : `basthon`, `papier`.

### `eleves.json`

```json
{
  "eleves": [
    {
      "id": "fanta",
      "prenom": "Fanta",
      "classe": "Terminale",
      "examens": [
        { "id": "bac-blanc", "titre": "Bac blanc NSI", "date": "2026-12-09", "format": "Écrit, 3 h 30" }
      ],
      "profil": "…"
    }
  ]
}
```

Le compte à rebours vise le prochain examen daté.

### `suivi.json`

```json
{
  "competences": {
    "py-boucles": {
      "lire": 4, "ecrire": 2, "maj": "2026-11-14T17:30:00.000Z",
      "historique": [{ "date": "…", "axe": "ecrire", "ancien": 0, "nouveau": 2 }]
    }
  },
  "notes": [
    { "id": "…", "date": "…", "competence": "py-dict-acces", "seance": "seance-1",
      "type": "blocage", "texte": "Confond d[cle] et d.cle", "resolue": false }
  ],
  "resultats": [
    { "id": "…", "date": "…", "exercice": "py-00", "resultat": "seule", "mode": "basthon",
      "duree": 8, "commentaire": "" }
  ]
}
```

### `seances.json`

```json
{
  "seances": [
    { "id": "seance-1", "numero": 1, "date": "2026-11-25", "titre": "…", "examen": "bac-blanc",
      "objectifs": ["…"], "competences": ["py-boucles"], "exercices": ["py-00"], "devoirs": ["py-03"],
      "faite": false, "bilan": "" }
  ]
}
```

### `exercices.json`

```json
{
  "bases": { "bibliotheque": { "titre": "Bibliothèque", "schema": "…", "script": "CREATE TABLE …" } },
  "exercices": [
    { "id": "py-07", "theme": "python", "competences": ["py-structures"], "titre": "…",
      "type": "ecrire", "langage": "python", "difficulte": 3, "duree": 30,
      "enonce": "…", "code": "…", "tests": "assert …", "indice": "…", "correction": "…",
      "base": null, "papier": true }
  ]
}
```

Dans `enonce`, un bloc de code s'écrit entre deux lignes ` ``` `, une liste avec des lignes `- `.

## Ajouter un élève

1. Ajouter une entrée dans `data/eleves.json` (un `id` en minuscules, sans espace).
2. Recharger la page et le choisir dans la barre latérale : son dossier `data/eleves/<id>/`
   est créé à la première modification.

## Ajouter un exercice

Depuis le site : **Exercices → + Nouvel exercice** (ou **Modifier** sur un exercice). L'éditeur écrit
dans `data/exercices.json`. Lancer ensuite `npm run check` pour vérifier que la correction passe les tests.

## Liens Basthon

Chaque exercice s'ouvre par un lien `https://console.basthon.fr/?script=<code>` : le code est compressé
en zlib (`CompressionStream('deflate')`) puis encodé en base64 « url », sans `=` final.

- Python : code de départ, puis `# ---------- Tests ----------`, puis les `assert`.
- SQL : `kernel=sql` en plus, le script crée la base Bibliothèque puis laisse la zone de requêtes.
- Lire et trace : le code tel quel, pour vérifier une prédiction faite à la main.

Si un lien est trop long, les boutons « Copier le code » et « Copier les tests » restent disponibles.
