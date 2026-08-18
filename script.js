document.addEventListener('DOMContentLoaded', () => {
  const treeContainer = document.getElementById('tree-container');
  const searchInput = document.getElementById('search');
  const contentDisplay = document.getElementById('content-display');
  const selectedTitle = document.getElementById('selected-title');

  let allData = null;

  // Mapping des icônes par catégorie
  const categoryIcons = {
    "DevOps": "fa-solid fa-server",
    "Data": "fa-solid fa-database",
    "Langages": "fa-solid fa-code",
    "Cloud": "fa-solid fa-cloud",
    "Sécurité": "fa-solid fa-shield-halved",
    "Réseaux": "fa-solid fa-network-wired",
    "IA": "fa-solid fa-brain",
    "Web": "fa-solid fa-globe",
    "Mobile": "fa-solid fa-mobile-screen",
    "Bases de données": "fa-solid fa-table",
    "Conteneurs": "fa-solid fa-cubes",
    "CI/CD": "fa-solid fa-arrows-rotate",
    "Monitoring": "fa-solid fa-chart-line",
    "Linux": "fa-brands fa-linux",
    "Windows": "fa-brands fa-windows",
    "Git": "fa-brands fa-git-alt",
    "Docker": "fa-brands fa-docker",
    "Python": "fa-brands fa-python",
    "JavaScript": "fa-brands fa-js",
    "Java": "fa-brands fa-java",
    "default": "fa-solid fa-folder"
  };

  function getIconForCategory(categoryName) {
    // Cherche une correspondance partielle
    for (let [key, icon] of Object.entries(categoryIcons)) {
      if (categoryName.toLowerCase().includes(key.toLowerCase())) {
        return icon;
      }
    }
    return categoryIcons.default;
  }

  // Charger le fichier JSON
  fetch('data/ressources.json')
    .then(res => res.json())
    .then(data => {
      allData = data;
      buildTree(data);
    })
    .catch(err => {
      treeContainer.innerHTML = '<p style="color:red;">⚠️ Erreur chargement des ressources.</p>';
      console.error(err);
    });

  // Construction de l'arborescence avec accordéon
  function buildTree(data) {
    treeContainer.innerHTML = '';
    
    data.categories.forEach((cat, catIndex) => {
      const catDiv = document.createElement('div');
      catDiv.className = 'category';

      //  EN-TÊTE DE CATÉGORIE (cliquable) 
      const header = document.createElement('div');
      header.className = 'category-header';
      
      // Icône
      const icon = document.createElement('i');
      icon.className = getIconForCategory(cat.nom);
      icon.style.cssText = 'font-size: 1.3rem; width: 28px; color: #0f172a;';
      
      // Nom
      const name = document.createElement('span');
      name.className = 'category-name';
      name.textContent = cat.nom;
      
      // Flèche toggle
      const toggle = document.createElement('span');
      toggle.className = 'category-toggle';
      toggle.innerHTML = '▶';
      
      header.appendChild(icon);
      header.appendChild(name);
      header.appendChild(toggle);
      
      //  CONTENU DE LA CATÉGORIE 
      const content = document.createElement('div');
      content.className = 'category-content';
      
      cat.sousCategories.forEach(sub => {
        const subDiv = document.createElement('div');
        subDiv.className = 'subcategory';

        const subName = document.createElement('div');
        subName.className = 'subcategory-name';
        subName.textContent = sub.nom;
        subDiv.appendChild(subName);

        sub.liens.forEach(lien => {
          const linkEl = document.createElement('a');
          linkEl.className = 'link-item';
          linkEl.textContent = `• ${lien.titre}`;
          linkEl.dataset.url = lien.url;
          linkEl.dataset.titre = lien.titre;

          linkEl.addEventListener('click', (e) => {
            e.preventDefault();
            selectedTitle.textContent = lien.titre;
            contentDisplay.innerHTML = `
              <iframe src="${lien.url}" loading="lazy" sandbox="allow-scripts allow-same-origin"></iframe>
              <p style="margin-top: 16px; font-size: 0.9rem; color: #555;">
                🔗 <a href="${lien.url}" target="_blank">Ouvrir dans un nouvel onglet</a>
              </p>
            `;

            document.querySelectorAll('.link-item').forEach(el => el.classList.remove('active'));
            linkEl.classList.add('active');
          });

          subDiv.appendChild(linkEl);
        });

        content.appendChild(subDiv);
      });

      // GESTION DU CLIC SUR L'EN-TÊTE 
      let isOpen = false;
      header.addEventListener('click', () => {
        isOpen = !isOpen;
        content.classList.toggle('open', isOpen);
        toggle.classList.toggle('rotated', isOpen);
      });

      // Ouvrir la première catégorie par défaut
      if (catIndex === 0) {
        isOpen = true;
        content.classList.add('open');
        toggle.classList.add('rotated');
      }

      catDiv.appendChild(header);
      catDiv.appendChild(content);
      treeContainer.appendChild(catDiv);
    });
  }

  // === RECHERCHE AVEC FILTRE ===
  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    if (!allData) return;

    if (query === '') {
      buildTree(allData);
      return;
    }

    const filtered = {
      categories: allData.categories
        .map(cat => {
          const newCat = { ...cat, sousCategories: [] };
          cat.sousCategories.forEach(sub => {
            const matchedLiens = sub.liens.filter(l =>
              l.titre.toLowerCase().includes(query) ||
              sub.nom.toLowerCase().includes(query) ||
              cat.nom.toLowerCase().includes(query)
            );
            if (matchedLiens.length > 0) {
              newCat.sousCategories.push({ ...sub, liens: matchedLiens });
            }
          });
          return newCat;
        })
        .filter(cat => cat.sousCategories.length > 0)
    };

    buildTree(filtered);
    
    // Ouvrir automatiquement toutes les catégories lors de la recherche
    document.querySelectorAll('.category-content').forEach(el => {
      el.classList.add('open');
    });
    document.querySelectorAll('.category-toggle').forEach(el => {
      el.classList.add('rotated');
    });
  });
});