# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Romain, le prof** : donne des cours particuliers de NSI en visio à Fanta. Il s'en sert pendant les séances (noter un blocage, un déclic, un résultat d'exercice, ajuster un niveau) et après (préparer la séance suivante, faire le bilan).
- **Fanta, l'élève de terminale** : le site est fait pour travailler avec elle et lui est spécifiquement lié. Elle clonera le dépôt sur son propre PC et l'utilisera elle-même : ouvrir les exercices dans Basthon, voir ce qu'elle maîtrise et ce qui bloque, relire le mémo.

## Product Purpose

Suivre Fanta en NSI sur toute l'année : d'abord les 3 séances d'1 h 30 avant le bac blanc (semaine du 9 décembre 2026), puis jusqu'au bac. Le site montre à tout moment ce qui bloque et ce qu'elle maîtrise, compétence par compétence, sur deux axes : lire du code et en écrire. Réussite : Fanta passe du « je lis et je comprends » au « j'écris seule », et arrive au bac blanc en sachant où elle en est.

## Positioning

Ce n'est pas un LMS ni une banque d'exercices générique : c'est le cahier de suivi d'une élève précise, fondé sur son profil (elle lit bien le code, a du mal à l'écrire, syntaxe Python à consolider). Chaque exercice va du « lire » vers l'« écrire » et s'ouvre en un clic dans Basthon, l'outil qu'elle utilise déjà.

## Operating Context

- Séances d'1 h 30 en visio ; Fanta n'a jamais eu de cours en présentiel.
- Basthon (console.basthon.fr) dans le navigateur pour exécuter Python et SQL.
- Le bac blanc est écrit, sur papier, sans calculatrice, 3 h 30, trois exercices indépendants : certains exercices se font d'abord sur feuille.
- Thèmes : bases de données, SQL, Python (listes et dictionnaires), algorithmique et complexité, hachage, récursivité et dichotomie.
- Bilan imprimable pour Fanta ou ses parents ; mémo de syntaxe imprimable.

## Capabilities and Constraints

- Application locale React 19 + Vite en JavaScript, lancée avec `npm run dev`, sans compte ni déploiement. Données en fichiers JSON dans `data/`, lues et écrites par un plugin Vite, sauvegarde automatique.
- Dépôt GitHub privé. Le suivi réel (`data/eleves.json`, `data/eleves/`) est hors git ; au premier lancement d'un clone, l'élève d'exemple est copié.
- Ouvert : comment le suivi circule entre le PC du prof et celui de Fanta, puisqu'elle clone le dépôt et que son suivi n'y est pas versionné.
- Le contenu (31 compétences, 27 exercices, 3 séances) et la structure doivent pouvoir évoluer depuis l'interface, sans toucher au code.
- Terminologie : compétence, niveau (pas vu, bloque, fragile, en cours, maîtrisé), axes Lire et Écrire, note (blocage, erreur fréquente, déclic, astuce, remarque), séance, devoirs, résultat (réussi seule, avec aide, pas réussi), mode (Basthon ou papier).

## Brand Commitments

- Tout en français, tutoiement envers Fanta.
- Thème clair uniquement (décision du prof).
- L'ancien univers « cahier d'écolier » (carreaux, marge rouge, notes manuscrites) est abandonné à la demande du prof.

## Evidence on Hand

- Spec : https://claude.ai/artifact/GF9Ci63YhUcSXSgDKQFhk7
- Contenu pédagogique réel : `data/referentiel.json`, `data/exercices.json` (vérifié par `npm run check`).
- Aucun témoignage, chiffre ou résultat d'élève à inventer.

## Product Principles

1. Ce qui bloque se voit tout de suite : les blocages non résolus et les niveaux faibles ne se cachent jamais derrière un clic.
2. Partir de la lecture pour amener à l'écriture : l'ordre lire → trace → bug → compléter → écrire structure les exercices et la progression.
3. Saisir pendant la séance sans casser son rythme : une note ou un niveau se pose en un geste, sans changer de page.
4. Bienveillant et factuel : on constate où elle en est, sans note sur 20 ni culpabilisation.

## Accessibility & Inclusion

Utilisable sur tablette, focus clavier visible, lisibilité forte (texte et code).
