# Drop 📂

Plateforme de ressources pédagogiques — une bibliothèque de liens organisée par catégories, avec recherche instantanée et aperçu intégré.

Construit dans le cadre d'une formation IT !





---

## 📁 Structure du projet

```
.
├── index.html          # Structure de la page
├── design.css           # Tous les styles (thème, layout, responsive)
├── script.js            # Logique : arbre, recherche, aperçu, menu mobile
└── data/
    └── ressources.json   # Contenu — catégories, sous-catégories, liens
```







## ⚠️ Limitations connues

- Les sites qui envoient un en-tête `X-Frame-Options: deny` (GitHub, LinkedIn...) ne peuvent pas être prévisualisés en iframe — une carte de secours avec bouton "ouvrir" s'affiche à la place. Liste des domaines concernés modifiable dans `NON_EMBEDDABLE_DOMAINS` (`script.js`).


---

## 👤 Auteur

Construit par **SuperRama**, étudiant en dernière année d'ingénierie.

---

## 📄 Licence

Projet personnel / pédagogique — libre d'utilisation et d'adaptation.