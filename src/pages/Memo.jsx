import { BookOpen, Printer } from 'lucide-react'
import { BlocCode, Carte, Entete } from '../components/ui.jsx'

export default function Memo() {
  return (
    <>
      <Entete
        icone={BookOpen}
        titre="Mémo NSI"
        sousTitre="La fiche de syntaxe à garder à côté de soi : Python, les pièges, SQL, complexités, récursivité et dichotomie."
      >
        <button type="button" className="btn btn--clair" onClick={() => window.print()}>
          <Printer size={15} className="icone" aria-hidden="true" />
          Imprimer
        </button>
      </Entete>

      <div className="memo">
        <Carte titre="Variables et conditions">
          <BlocCode
            code={`age = 17              # affectation : =
nom = "Fanta"          # str
moyenne = 14.5         # float
admis = True           # bool

if moyenne >= 10:      # ==  !=  <  <=  >  >=
    print("admis")
elif moyenne >= 8:
    print("oral")
else:
    print("refusé")

# et / ou / non : and  or  not
# division entière // , reste % , puissance **`}
          />
        </Carte>

        <Carte titre="Boucles">
          <BlocCode
            code={`for i in range(5):         # 0, 1, 2, 3, 4
    print(i)

for i in range(2, 10, 2):  # 2, 4, 6, 8  (10 exclu)
    print(i)

for x in liste:            # chaque élément
    print(x)

for i in range(len(liste)):  # chaque indice
    print(i, liste[i])

n = 10
while n > 0:               # tant que…
    n = n // 2       # faire évoluer n !`}
          />
        </Carte>

        <Carte titre="Listes">
          <BlocCode
            code={`notes = [12, 8, 15]
notes[0]          # 12 (premier)
notes[-1]         # 15 (dernier)
len(notes)        # 3
notes.append(10)  # ajoute à la fin
notes[1] = 9      # modifie
14 in notes       # False

vide = []
carres = [x * x for x in range(4)]  # [0, 1, 4, 9]
pairs = [x for x in notes if x % 2 == 0]`}
          />
        </Carte>

        <Carte titre="Dictionnaires">
          <BlocCode
            code={`stock = {"pomme": 3, "kiwi": 5}
stock["pomme"]         # 3
stock["poire"] = 2     # ajoute une clé
stock["kiwi"] += 1     # modifie
"kiwi" in stock        # True (teste les clés)

for cle in stock:                 # les clés
    print(cle, stock[cle])
for valeur in stock.values():     # les valeurs
    print(valeur)
for cle, valeur in stock.items(): # les deux
    print(cle, valeur)

# compter
compte = {}
for m in mots:
    if m in compte:
        compte[m] += 1
    else:
        compte[m] = 1`}
          />
        </Carte>

        <Carte titre="Fonctions et assert">
          <BlocCode
            code={`def maximum(liste):
    """Renvoie le plus grand élément d'une liste non vide."""
    m = liste[0]
    for x in liste:
        if x > m:
            m = x
    return m          # renvoie le résultat

assert maximum([3, 9, 2]) == 9
assert maximum([-5]) == -5
# assert ne dit rien si c'est vrai,
# lève AssertionError si c'est faux.`}
          />
        </Carte>

        <Carte titre="Les pièges">
          <ul>
            <li>
              Les <code className="inline">:</code> oubliés après <code className="inline">if</code>,{' '}
              <code className="inline">for</code>, <code className="inline">while</code>,{' '}
              <code className="inline">def</code>.
            </li>
            <li>L’indentation : 4 espaces, le bloc s’arrête quand on revient à gauche.</li>
            <li>
              <code className="inline">=</code> range une valeur, <code className="inline">==</code> compare.
            </li>
            <li>
              <code className="inline">range(n)</code> s’arrête à <code className="inline">n - 1</code> ;{' '}
              <code className="inline">range(a, b)</code> exclut <code className="inline">b</code>.
            </li>
            <li>
              Modifier ou renvoyer : <code className="inline">liste.append(x)</code> modifie la liste et renvoie{' '}
              <code className="inline">None</code>. Une fonction sans <code className="inline">return</code> renvoie{' '}
              <code className="inline">None</code>.
            </li>
            <li>
              <code className="inline">print</code> affiche, <code className="inline">return</code> renvoie : les tests
              regardent ce qui est renvoyé.
            </li>
            <li>
              Un <code className="inline">return</code> dans une boucle arrête tout de suite la fonction.
            </li>
          </ul>
        </Carte>

        <Carte titre="SQL">
          <BlocCode
            code={`SELECT titre, annee FROM Livre
WHERE annee >= 2000 AND genre = 'Roman'
ORDER BY annee DESC;          -- ASC par défaut

SELECT DISTINCT ville FROM Adherent;

SELECT COUNT(*) FROM Emprunt
WHERE date_retour IS NULL;    -- pas = NULL !
-- aussi : SUM, AVG, MIN, MAX

SELECT Adherent.nom, Livre.titre
FROM Emprunt
JOIN Adherent ON Emprunt.id_adherent = Adherent.id_adherent
JOIN Livre ON Emprunt.id_livre = Livre.id_livre;

INSERT INTO Livre (id_livre, titre, auteur, annee, genre)
VALUES (20, 'Nouveau', 'Auteur', 2024, 'Roman');
UPDATE Livre SET annee = 2023 WHERE id_livre = 20;
DELETE FROM Livre WHERE id_livre = 20;
-- attention : sans WHERE, tout est supprimé`}
          />
          <p className="petit">
            Clé primaire : identifie chaque ligne, unique. Clé étrangère (#) : fait référence à la clé primaire d’une
            autre table.
          </p>
        </Carte>

        <Carte titre="Complexités à connaître">
          <ul>
            <li>
              <strong>O(1)</strong> : accès <code className="inline">liste[i]</code>, <code className="inline">dico[cle]</code>,{' '}
              <code className="inline">cle in dico</code>.
            </li>
            <li>
              <strong>O(log n)</strong> : recherche dichotomique (on coupe en deux à chaque tour).
            </li>
            <li>
              <strong>O(n)</strong> : un parcours, <code className="inline">x in liste</code>, minimum, maximum, somme.
            </li>
            <li>
              <strong>O(n²)</strong> : deux boucles imbriquées, tri par sélection, tri par insertion.
            </li>
          </ul>
        </Carte>

        <Carte titre="ord, chr et %">
          <BlocCode
            code={`ord("A")   # 65     ord("a")   # 97
chr(66)    # "B"    ord("0")   # 48
17 % 5     # 2  (reste de 17 divisé par 5)
17 // 5    # 3  (quotient)

def hachage(mot, taille):
    s = 0
    for c in mot:
        s = s + ord(c)
    return s % taille   # entre 0 et taille - 1`}
          />
        </Carte>

        <Carte titre="Fonction récursive">
          <BlocCode
            code={`def somme(n):
    if n == 0:               # cas de base
        return 0
    return n + somme(n - 1)  # appel plus petit

# somme(3) = 3 + somme(2)
#          = 3 + 2 + somme(1)
#          = 3 + 2 + 1 + somme(0) = 6`}
          />
        </Carte>

        <Carte titre="Dichotomie en [debut, fin[">
          <BlocCode
            code={`def dichotomie(liste, x):
    """liste triée. Renvoie un indice de x, ou -1."""
    debut = 0
    fin = len(liste)           # fin exclue
    while debut < fin:         # zone non vide
        milieu = (debut + fin) // 2
        if liste[milieu] == x:
            return milieu
        elif liste[milieu] < x:
            debut = milieu + 1  # à droite
        else:
            fin = milieu        # à gauche (fin exclue)
    return -1                   # absent ou liste vide`}
          />
        </Carte>
      </div>
    </>
  )
}
