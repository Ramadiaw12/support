document.addEventListener('DOMContentLoaded', () => {
  const treeContainer = document.getElementById('tree-container');
  const searchInput = document.getElementById('search');
  const contentDisplay = document.getElementById('content-display');
  const selectedTitle = document.getElementById('selected-title');

  let allData = null;

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

  // Construction de l'arborescence
  function buildTree(data) {
    treeContainer.innerHTML = '';
    data.categories.forEach(cat => {
      const catDiv = document.createElement('div');
      catDiv.className = 'category';

      const catName = document.createElement('div');
      catName.className = 'category-name';
      catName.textContent = cat.nom;
      catDiv.appendChild(catName);

      cat.sousCategories.forEach(sub => {
        const subDiv = document.createElement('div');
        subDiv.className = 'subcategory';

        const subName = document.createElement('div');
        subName.className = 'subcategory-name';
        subName.textContent = `▸ ${sub.nom}`;
        subDiv.appendChild(subName);

        sub.liens.forEach(lien => {
          const linkEl = document.createElement('a');
          linkEl.className = 'link-item';
          linkEl.textContent = `• ${lien.titre}`;
          linkEl.dataset.url = lien.url;
          linkEl.dataset.titre = lien.titre;

          linkEl.addEventListener('click', (e) => {
            e.preventDefault();
            // Mettre à jour l'affichage
            selectedTitle.textContent = lien.titre;
            contentDisplay.innerHTML = `
              <iframe src="${lien.url}" loading="lazy"></iframe>
              <p style="margin-top: 16px; font-size: 0.9rem; color: #555;">
                🔗 <a href="${lien.url}" target="_blank">Ouvrir dans un nouvel onglet</a>
              </p>
            `;

            // Retirer la classe active de tous les liens
            document.querySelectorAll('.link-item').forEach(el => el.classList.remove('active'));
            linkEl.classList.add('active');
          });

          subDiv.appendChild(linkEl);
        });

        catDiv.appendChild(subDiv);
      });

      treeContainer.appendChild(catDiv);
    });
  }

  // Filtre de recherche (recherche dans titres + catégories)
  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    if (!allData) return;

    if (query === '') {
      buildTree(allData);
      return;
    }

    // Reconstruire l'arbre en filtrant
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
  });
});