---
name: Cahier NSI
description: Espace de travail clair et aéré pour suivre une élève de NSI, compétence par compétence.
colors:
  fond: "#ffffff"
  fond-barre: "#f7f6f3"
  fond-doux: "#fbfbfa"
  survol: "rgba(55, 53, 47, 0.06)"
  actif: "rgba(55, 53, 47, 0.09)"
  encre: "#37352f"
  encre-2: "#5f5e5b"
  encre-3: "#73726e"
  encre-4: "#9b9a97"
  trait: "#e9e9e7"
  trait-fort: "#dcdbd8"
  bleu: "#1a6fcc"
  bleu-fonce: "#155aa8"
  bleu-doux: "#e7f3f8"
  gris: "#6f6e6a"
  gris-fond: "#f1f1ef"
  brun: "#8f5d47"
  brun-fond: "#f4eeee"
  orange: "#b5570a"
  orange-fond: "#fbecdd"
  jaune: "#94690f"
  jaune-fond: "#fbf3db"
  vert: "#3a7254"
  vert-fond: "#edf3ec"
  bleu-tag: "#28688f"
  violet: "#7a4f9f"
  violet-fond: "#f6f3f9"
  rose: "#a93d76"
  rose-fond: "#faf1f5"
  rouge: "#bf3a35"
  rouge-fond: "#fdebec"
  n0: "#e3e2e0"
  n1: "#e16259"
  n2: "#eb9a4a"
  n3: "#e5c04f"
  n4: "#5a9e73"
typography:
  display:
    fontFamily: "'Inter Variable', 'Inter', -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif"
    fontSize: "2.1rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.025em"
    fontFeature: "'cv11', 'ss01'"
  headline:
    fontFamily: "'Inter Variable', 'Inter', -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif"
    fontSize: "1.05rem"
    fontWeight: 650
    lineHeight: 1.3
    letterSpacing: "-0.01em"
    fontFeature: "'cv11', 'ss01'"
  title:
    fontFamily: "'Inter Variable', 'Inter', -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif"
    fontSize: "0.98rem"
    fontWeight: 650
    lineHeight: 1.3
    letterSpacing: "-0.01em"
    fontFeature: "'cv11', 'ss01'"
  body:
    fontFamily: "'Inter Variable', 'Inter', -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.55
    fontFeature: "'cv11', 'ss01'"
  label:
    fontFamily: "'Inter Variable', 'Inter', -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif"
    fontSize: "0.82rem"
    fontWeight: 500
    lineHeight: 1.3
    fontFeature: "'cv11', 'ss01'"
  code:
    fontFamily: "'Source Code Pro', ui-monospace, 'SFMono-Regular', Menlo, monospace"
    fontSize: "0.84rem"
    fontWeight: 400
    lineHeight: 1.6
    fontFeature: "'liga' 0, 'calt' 0"
rounded:
  xs: "4px"
  petit: "6px"
  r: "8px"
  carte: "12px"
  rond: "50%"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  gouttiere: "20px"
  section: "32px"
  page: "56px"
components:
  button-primary:
    backgroundColor: "{colors.bleu}"
    textColor: "{colors.fond}"
    typography: "{typography.label}"
    rounded: "{rounded.r}"
    padding: "0 14px"
    height: "34px"
  button-primary-hover:
    backgroundColor: "{colors.bleu-fonce}"
  button-clair:
    backgroundColor: "{colors.fond}"
    textColor: "{colors.encre}"
    rounded: "{rounded.r}"
    padding: "0 14px"
    height: "34px"
  button-clair-hover:
    backgroundColor: "{colors.fond-doux}"
  button-fantome:
    backgroundColor: "transparent"
    textColor: "{colors.encre-2}"
    rounded: "{rounded.r}"
    padding: "0 14px"
    height: "34px"
  button-fantome-hover:
    backgroundColor: "{colors.survol}"
    textColor: "{colors.encre}"
  button-danger:
    backgroundColor: "transparent"
    textColor: "{colors.rouge}"
    rounded: "{rounded.r}"
    padding: "0 14px"
    height: "34px"
  button-danger-hover:
    backgroundColor: "{colors.rouge-fond}"
  button-petit:
    rounded: "{rounded.r}"
    padding: "0 10px"
    height: "28px"
  carte:
    backgroundColor: "{colors.fond}"
    rounded: "{rounded.carte}"
    padding: "14px 20px 20px"
  tag:
    backgroundColor: "{colors.gris-fond}"
    textColor: "{colors.gris}"
    rounded: "{rounded.xs}"
    padding: "0 8px"
    height: "22px"
  tag-vert:
    backgroundColor: "{colors.vert-fond}"
    textColor: "{colors.vert}"
  tag-jaune:
    backgroundColor: "{colors.jaune-fond}"
    textColor: "{colors.jaune}"
  tag-rouge:
    backgroundColor: "{colors.rouge-fond}"
    textColor: "{colors.rouge}"
  tag-grand:
    padding: "0 10px"
    height: "26px"
  champ:
    backgroundColor: "{colors.fond}"
    textColor: "{colors.encre}"
    rounded: "{rounded.r}"
    padding: "6px 10px"
    height: "34px"
  nav-lien:
    backgroundColor: "transparent"
    textColor: "{colors.encre-2}"
    rounded: "{rounded.petit}"
    padding: "6px 10px"
  nav-lien-hover:
    backgroundColor: "{colors.survol}"
    textColor: "{colors.encre}"
  nav-lien-actif:
    backgroundColor: "{colors.actif}"
    textColor: "{colors.encre}"
  niveau-segment:
    backgroundColor: "{colors.n0}"
    rounded: "3px"
    width: "22px"
    height: "12px"
  niveau-segment-cliquable:
    width: "26px"
    height: "18px"
  callout:
    backgroundColor: "{colors.fond-barre}"
    rounded: "{rounded.r}"
    padding: "14px 16px"
---

# Design System: Cahier NSI

## Overview

**Creative North Star: "La page de travail partagée"**

Chaque écran est une page d'espace de travail, à la manière de Notion : une tuile d'icône, un grand titre, une ligne de propriétés, puis le contenu rangé dans des cartes blanches à bordure fine. Le prof et l'élève lisent la même page pendant la visio ; tout doit se comprendre d'un regard et se modifier en un geste, sans changer d'écran. La densité est celle d'un outil : texte de 15px, lignes de 9 à 10px de haut en bas, beaucoup de blanc entre les cartes (20px), aucun ornement.

La couleur ne décore pas, elle classe. L'encre est un brun-gris chaud, les surfaces sont blanches ou d'un gris papier très léger, et les seules taches de couleur sont les étiquettes douces (fond pâle, texte foncé), le bleu d'action et l'échelle de niveau du rouge au vert. Thème clair uniquement, par décision du prof.

Le système a remplacé, volontairement, l'ancien univers « cahier d'écolier » : plus de papier quadrillé, de marge rouge ni d'écriture manuscrite (Caveat). Il refuse aussi le tableau de bord à gros chiffres : la progression se lit dans des échelles et des barres fines, pas dans des compteurs géants.

**Key Characteristics:**
- Pages à en-tête (tuile d'icône 48px, titre 2.1rem, propriétés en étiquettes) ; contenu en cartes à bordure 1px.
- Encre chaude #37352f sur blanc, barre latérale #f7f6f3, traits #e9e9e7.
- Étiquettes douces en neuf teintes, toujours en couple texte foncé / fond pâle.
- Un seul bleu d'action ; tout le reste est neutre.
- Signature : l'échelle de niveau en quatre segments arrondis, du rouge au vert.
- Icônes Lucide au trait 1.75, tout en français.

## Colors

Une palette neutre et chaude, presque monochrome, où la couleur n'apparaît que pour porter une information : action, catégorie, niveau.

### Primary
- **Bleu action** (`bleu`) : fond du bouton principal, curseur de saisie, cases à cocher, anneau de focus, bordure d'un champ en focus. C'est la seule couleur qui signifie « tu peux agir ».
- **Bleu foncé** (`bleu-fonce`) : survol du bouton principal et texte bleu sur fond pâle (le compteur J-n de l'échéance, l'icône d'un encart bleu).
- **Bleu pâle** (`bleu-doux`) : fond du compteur d'échéance, des encarts d'information et des propositions.

### Neutral
- **Blanc page** (`fond`) : fond de l'application, des cartes, des champs.
- **Gris papier** (`fond-barre`) : barre latérale, encarts neutres, fond des écrans centrés et de la page Bilan autour de la feuille.
- **Blanc cassé** (`fond-doux`) : en-têtes de tableau, survol des lignes, blocs de code, détail déplié d'une compétence.
- **Voile de survol / d'actif** (`survol`, `actif`) : l'encre à 6 % et 9 %, posée sous tout élément cliquable au survol ou sélectionné. Jamais de couleur pour signaler un survol.
- **Encre** (`encre`) : texte principal, titres, logo de l'espace, soulignement de l'onglet actif.
- **Encre 2** (`encre-2`) : texte secondaire actif (liens de navigation au repos, libellés de champ, clés de propriétés).
- **Encre 3** (`encre-3`) : métadonnées, dates, en-têtes de colonnes, icônes au repos, textes vides.
- **Encre 4** (`encre-4`) : point coloré par défaut quand aucune couleur n'est donnée.
- **Trait** (`trait`) : bordures de carte, séparateurs de lignes, bordure de la barre latérale.
- **Trait fort** (`trait-fort`) : bordure des champs et du bouton clair, contour des étiquettes « à faire ».

### Étiquettes (couleurs de catégorie)
Neuf couples texte / fond : gris, brun, orange, jaune, vert, bleu (`bleu-tag` sur `bleu-doux`), violet, rose, rouge. Ils codent les types de note (blocage rouge, erreur fréquente orange, déclic vert, astuce bleu, remarque gris) et les résultats (réussi seule vert, avec aide jaune, pas réussi rouge). Les thèmes du référentiel portent leur propre couleur et en dérivent le couple par mélange : texte `color-mix(couleur 82 %, noir)`, fond `color-mix(couleur 11 %, blanc)`.

### Niveaux
- **Pas vu** (`n0`) : segment vide, gris.
- **Bloque** (`n1`) : rouge corail.
- **Fragile** (`n2`) : orange.
- **En cours** (`n3`) : jaune ; sert aussi au point « modification en attente » de l'indicateur d'enregistrement.
- **Maîtrisé** (`n4`) : vert ; sert aussi au point « enregistré ».

### Named Rules
**The Couleur-Information Rule.** Une couleur vive signifie toujours quelque chose : action (bleu), catégorie (étiquette), niveau (n1 à n4), erreur (rouge). Aucun aplat coloré décoratif.

**The Couple Doux Rule.** Une étiquette colorée est toujours un couple texte foncé sur fond pâle de la même teinte, jamais du texte blanc sur un aplat saturé.

**The Bleu Unique Rule.** Le bleu action est la seule couleur d'interaction. Le bleu des étiquettes (`bleu-tag`) est une catégorie, pas un lien, et ne remplace jamais le bleu action. Pour du texte bleu, utilise Bleu foncé, pas Bleu action.

## Typography

**Display Font:** Inter Variable (avec Inter, -apple-system, Segoe UI, Helvetica, Arial)
**Body Font:** Inter Variable, auto-hébergée via @fontsource-variable/inter
**Label/Mono Font:** Source Code Pro (400 et 600, auto-hébergée), ligatures désactivées

**Character:** Une seule famille d'interface, nette et neutre, avec les alternates `cv11` et `ss01` actives partout ; le code passe en Source Code Pro sans ligatures, pour que `==`, `!=` ou `<=` se lisent exactement comme Fanta doit les écrire.

### Hierarchy
- **Display** (700, 2.1rem, 1.2, -0.025em) : le titre de page, un seul par écran (1.7rem sous 760px).
- **Headline** (650, 1.05rem, 1.3) : titres h2 ; 1.25rem dans la feuille de Bilan.
- **Title** (650, 0.98rem, 1.3) : titre de carte, précédé d'une icône 17px en Encre 3.
- **Body** (400, 15px, 1.55) : texte courant ; énoncés à 0.95rem / 1.65, limités à 72ch ; sous-titre de page à 0.98rem, limité à 68ch.
- **Label** (500, 0.82rem) : libellés de champ ; métadonnées et en-têtes de colonnes à 0.78–0.8rem en Encre 3. Jamais en capitales.
- **Code** (400, 0.84rem, 1.6) : blocs `pre` sur Blanc cassé ; code en ligne à 0.86em, rouge brique sur voile gris ; identifiants d'exercice à 0.76rem.

### Named Rules
**The Graisse Intermédiaire Rule.** La hiérarchie passe par la graisse variable (500, 550, 600, 650, 700) et la taille, pas par les capitales ni l'espacement de lettres positif.

**The Chiffres Alignés Rule.** Tout nombre qui se compare (compteurs, pourcentages, J-n, numéros de séance, colonnes numériques) est en chiffres tabulaires.

**The Code Littéral Rule.** Le code s'affiche toujours en Source Code Pro avec `liga` et `calt` coupés.

## Layout

Coque en deux colonnes : barre latérale fixe de 252px (220px sous 1024px), collante sur toute la hauteur, puis la page. La page a un rembourrage de 44px 56px 96px (36px 32px sous 1180px, 28px 16px sous 760px) et un contenu centré limité à 1120px.

La barre latérale empile, avec 14px d'écart : l'espace (logo 26px + nom), le choix de l'élève (sélecteur avec avatar initiale), l'échéance (compteur J-n + titre + date), la navigation iconée, et l'indicateur d'enregistrement poussé en bas. Sous 760px, elle devient une barre compacte en haut : logo seul, élève, compteur J-n, puis la navigation sur une ligne défilante ; l'indicateur n'apparaît qu'en cas d'erreur.

Le contenu se range en grilles de cartes à 20px d'écart : deux ou trois colonnes égales, ou une colonne de détail (contenu + 340px, 300px sous 1180px). Une carte peut occuper deux colonnes. Les grilles passent à deux colonnes sous 1024px et à une seule sous 760px. Le rythme vertical est 20px entre cartes, 24px entre séances, 32px sous l'en-tête de page.

Impression : barre latérale, boutons et actions disparaissent ; le Bilan et le Mémo (en deux colonnes) s'impriment à plat, sans ombre, avec les couleurs d'étiquettes et de niveaux conservées.

## Elevation & Depth

Le système est plat. La profondeur vient des bordures 1px en Trait et de l'alternance Blanc page / Gris papier / Blanc cassé. Une ombre quasi invisible accompagne les surfaces posées (cartes, bouton clair, sélecteur d'élève), et le seul relief réel est une réponse à l'état : segment de niveau survolé, segment sélectionné dans un contrôle segmenté.

### Shadow Vocabulary
- **Posée** (`box-shadow: 0 1px 2px rgba(15, 15, 15, 0.04)`) : cartes, feuille de Bilan, bouton clair, sélecteur d'élève.
- **Segment choisi** (`box-shadow: 0 1px 2px rgba(15, 15, 15, 0.1)`) : bouton actif d'un contrôle segmenté sur fond gris.
- **Soulèvement** (`box-shadow: 0 2px 4px rgba(15, 15, 15, 0.12)`, avec `translateY(-1px)`) : survol d'un segment de niveau cliquable.
- **Focus** (`box-shadow: 0 0 0 2px #fff, 0 0 0 4px rgba(35, 131, 226, 0.55)`) : anneau de focus clavier de tout élément ; les champs utilisent un halo de 3px à 18 % de bleu et une bordure Bleu action.

### Named Rules
**The Bordure-d'abord Rule.** Une surface se détache par sa bordure 1px, jamais par une ombre portée. L'ombre « posée » reste à 4 % d'opacité.

## Shapes

Des angles doucement arrondis, échelonnés selon la taille de l'objet : 4px pour les petites pastilles (étiquettes, identifiants, code en ligne), 6px pour les éléments de navigation et les tuiles d'icône de 26 à 28px, 8px pour les boutons, champs, encarts et blocs de code, 12px pour les cartes, la feuille de Bilan et la tuile d'icône de page. Les segments de niveau ont 3px (2px en mini) dans un rail à 7px. Les points d'état et l'avatar sont ronds. Les bordures font toujours 1px ; les contours d'étiquette sont des ombres internes de 1px, pour ne pas changer la taille.

## Components

### Buttons
Discrets et nets : une seule action pleine par zone, le reste en clair ou en fantôme.
- **Shape:** angles doux (8px), hauteur 34px, rembourrage 0 14px, texte 0.88rem en graisse 550, icône Lucide 15px à 6px du texte.
- **Primary:** Bleu action, texte blanc ; survol en Bleu foncé (transition 0.15s).
- **Clair:** fond blanc, bordure Trait fort, ombre posée ; survol en Blanc cassé.
- **Fantôme:** transparent, Encre 2 ; survol sur voile de survol et Encre.
- **Danger:** transparent, texte rouge ; survol sur Rouge pâle.
- **Petit / Icône:** 28px de haut (0 10px, 0.82rem) ; le bouton icône est carré, 28px.
- **Disabled:** opacité 0.45, curseur interdit.

### Chips (Étiquettes)
- **Style:** pastille de 22px (26px en grand), 0 8px, angles 4px, 0.8rem en 500 ; couple texte / fond d'une des neuf teintes, gris par défaut.
- **Variantes:** couleur de thème dérivée par `color-mix` ; contour (fond transparent, contour interne Trait fort, Encre 2) pour « à faire » ; bouton de retrait 16px intégré, à 70 % d'opacité.

### Cards / Containers
- **Corner Style:** 12px.
- **Background:** Blanc page.
- **Shadow Strategy:** ombre posée (voir Elevation & Depth).
- **Border:** 1px Trait.
- **Internal Padding:** tête 16px 20px 0, corps 14px 20px 20px ; corps « affleurant » 8px 0 6px quand il contient des lignes ou un tableau qui vont d'un bord à l'autre (lignes à 10px 20px). Titre en Title avec icône, lien « voir tout » à droite en Encre 3 avec chevron.
- **Encarts:** fond Gris papier (ou jaune, rouge, bleu pâles), angles 8px, 14px 16px, icône en tête dans la teinte forte.

### Inputs / Fields
- **Style:** fond blanc, bordure 1px Trait fort, angles 8px, 6px 10px, 34px min, 0.9rem ; libellé au-dessus à 6px (Label, Encre 2) ; sélecteurs avec chevron Lucide en image de fond.
- **Hover / Focus:** survol bordure #cfcdc9 ; focus bordure Bleu action et halo bleu de 3px.
- **En ligne:** un champ peut se lire comme du texte (bordure et fond transparents) jusqu'au survol (voile) et au focus (fond blanc, bordure bleue) ; c'est ainsi que se modifient les titres de séance.
- **Code:** zone de texte en Source Code Pro sur Blanc cassé, tabulation de 4.

### Navigation
- **Barre latérale:** liens 0.9rem en 500, Encre 2, icône Lucide 17px en Encre 3, 6px 10px, angles 6px ; survol voile + Encre ; actif voile d'actif, Encre, graisse 600, icône en Encre.
- **Onglets de vue:** boutons 0.88rem sur une ligne de base Trait ; actif souligné d'un trait d'Encre de 2px ; compteur en chiffres tabulaires.
- **Contrôle segmenté:** rail Gris-fond à 3px de marge, segment actif blanc avec ombre de segment choisi.
- **Fil d'Ariane:** 0.85rem en Encre 3, chevrons 14px, survol en voile.

### Niveau / Échelle (signature)
L'échelle de niveau en quatre segments arrondis, posés dans un rail Blanc cassé à contour interne Trait (3px de marge, 3px entre segments). Les segments jusqu'au niveau atteint prennent la couleur du niveau (`n1` à `n4`), les autres restent `n0`. Précédée de l'axe (« Lire » / « Écrire », 0.78rem Encre 3) et suivie du libellé du niveau. En lecture seule, segments de 22 × 12px ; cliquable (page Compétences), segments de 26 × 18px qui se soulèvent au survol, avec un anneau de la couleur du niveau sur le segment choisi ; recliquer le niveau choisi revient à « pas vu ». Version mini pour les listes : segments 12 × 7px, sans libellé. Couleurs et transformations en 0.35s sur `cubic-bezier(0.16, 1, 0.3, 1)`. La même échelle se retrouve partout (exercice, tableau de bord, bilan) ; la légende reprend les couleurs en carrés de 10px.

### Repli
Bloc repliable à filets Trait en haut (et en bas pour le dernier) ; titre 0.92rem en 600 précédé d'un chevron qui pivote de 90° à l'ouverture (0.25s, même courbe) ; corps décalé de 28px.

### Note
Ligne de note : étiquette de type, compétence et date en tête, texte à 0.92rem, actions à droite (case « Résolu » pour un blocage, bouton fantôme icône pour supprimer). Une note résolue passe en Encre 3, barrée d'un trait léger.

### Barre de progression
Rail de 6px en Gris-fond, angles 6px, remplissage à la couleur du thème (bleu par défaut), valeur en pourcentage à droite en chiffres tabulaires ; largeur animée en 0.6s.

## Do's and Don'ts

### Do:
- **Do** construire chaque écran comme une page : tuile d'icône 48px, titre Display, sous-titre en Encre 3, ligne de propriétés en étiquettes, puis des cartes.
- **Do** ranger le contenu dans des cartes blanches à bordure 1px Trait et angles 12px, espacées de 20px.
- **Do** signaler le survol par le voile d'encre (`survol`, 6 %) et la sélection par `actif` (9 %), jamais par une couleur.
- **Do** reprendre l'échelle de niveau en quatre segments chaque fois qu'un niveau s'affiche, en mini dans les listes.
- **Do** utiliser les icônes Lucide au trait 1.75, à 14–17px dans l'interface et 24px dans la tuile de page.
- **Do** garder l'anneau de focus visible sur tout élément interactif.
- **Do** écrire toute l'interface en français, avec espaces insécables avant « : ; ! ? » et dans les guillemets.
- **Do** mettre les nombres comparés en chiffres tabulaires.

### Don't:
- **Don't** réintroduire le cahier d'écolier : ni papier quadrillé, ni marge rouge, ni police manuscrite (Caveat).
- **Don't** ajouter de thème sombre : le thème est clair uniquement.
- **Don't** afficher la progression en gros chiffres de tableau de bord ; elle se lit dans les échelles et les barres.
- **Don't** utiliser d'aplat saturé avec texte blanc pour une étiquette.
- **Don't** introduire une deuxième couleur d'action à côté du bleu.
- **Don't** composer de titres ou libellés en capitales espacées.
- **Don't** afficher du code avec des ligatures.
