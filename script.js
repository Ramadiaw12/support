document.addEventListener('DOMContentLoaded', () => {
  const treeContainer = document.getElementById('tree-container');
  const searchInput = document.getElementById('search');
  const contentDisplay = document.getElementById('content-display');
  const pageTitle = document.getElementById('page-title');
  const pageSubtitle = document.getElementById('page-subtitle');
  const breadcrumbPath = document.getElementById('breadcrumb-path');
  const totalCategories = document.getElementById('total-categories');
  const totalLinks = document.getElementById('total-links');

  let allData = null;
  let linkCount = 0;
  let categoryCount = 0;

  // Mapping des icônes
  const categoryIcons = {
    "Environnement de travail": "fa-solid fa-laptop-code",
    "IA pour les devs": "fa-solid fa-brain",
    "DevOps": "fa-solid fa-server",
    "Data": "fa-solid fa-database",
    "Langages": "fa-solid fa-code",
    "Cloud": "fa-solid fa-cloud",
    "Sécurité": "fa-solid fa-shield-halved",
    "Réseaux": "fa-solid fa-network-wired",
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
      // Compter les éléments
      data.categories.forEach(cat => {
        categoryCount++;
        cat.sousCategories.forEach(sub => {
          linkCount += sub.liens.length;
        });
      });
      totalCategories.textContent = categoryCount;
      totalLinks.textContent = linkCount;
      buildTree(data);
    })
    .catch(err => {
      treeContainer.innerHTML = '<p style="color:red; padding: 12px;">⚠️ Erreur chargement des ressources.</p>';
      console.error(err);
    });

  function buildTree(data) {
    treeContainer.innerHTML = '';
    
    data.categories.forEach((cat, catIndex) => {
      const catDiv = document.createElement('div');
      catDiv.className = 'category';

      // En-tête de catégorie
      const header = document.createElement('div');
      header.className = 'category-header';
      
      const icon = document.createElement('i');
      icon.className = getIconForCategory(cat.nom);
      icon.style.cssText = 'font-size: 1rem; width: 24px; color: #495057;';
      
      const name = document.createElement('span');
      name.className = 'category-name';
      name.textContent = cat.nom;
      
      const toggle = document.createElement('span');
      toggle.className = 'category-toggle';
      toggle.innerHTML = '▶';
      
      header.appendChild(icon);
      header.appendChild(name);
      header.appendChild(toggle);
      
      // Contenu
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
          linkEl.textContent = lien.titre;
          linkEl.dataset.url = lien.url;
          linkEl.dataset.titre = lien.titre;
          linkEl.dataset.category = cat.nom;
          linkEl.dataset.subcategory = sub.nom;
          linkEl.dataset.isIntro = lien.isIntro || false;
          linkEl.dataset.content = lien.content || '';

          linkEl.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Si c'est la page d'introduction
            if (linkEl.dataset.isIntro === 'true') {
              pageTitle.textContent = "Introduction";
              pageSubtitle.textContent = "Bienvenue sur ma plateforme";
              breadcrumbPath.textContent = "Environnement de travail › Introduction";
              
              // Afficher le contenu personnalisé
              const contentHtml = linkEl.dataset.content || '<p>Contenu non disponible</p>';
              contentDisplay.innerHTML = `
                <div class="content-display-content">
                  ${contentHtml}
                </div>
              `;
              
              document.querySelectorAll('.link-item').forEach(el => el.classList.remove('active'));
              linkEl.classList.add('active');
              return;
            }

            // Mettre à jour le panneau droit pour les liens normaux
            pageTitle.textContent = lien.titre;
            pageSubtitle.textContent = `${cat.nom} › ${sub.nom}`;
            breadcrumbPath.textContent = `Uptime Formation › ${cat.nom}`;
            
            contentDisplay.innerHTML = `
              <div class="content-display-content">
                <iframe src="${lien.url}" loading="lazy" sandbox="allow-scripts allow-same-origin allow-forms"></iframe>
                <div class="link-actions">
                  <a href="${lien.url}" target="_blank">
                    <i class="fas fa-external-link-alt"></i> Ouvrir dans un nouvel onglet
                  </a>
                </div>
              </div>
            `;

            document.querySelectorAll('.link-item').forEach(el => el.classList.remove('active'));
            linkEl.classList.add('active');
          });

          subDiv.appendChild(linkEl);
        });

        content.appendChild(subDiv);
      });

      // Gestion accordéon
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

  // Recherche
  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    if (!allData) return;

    if (query === '') {
      buildTree(allData);
      // Réouvrir la première catégorie
      const firstContent = document.querySelector('.category-content');
      const firstToggle = document.querySelector('.category-toggle');
      if (firstContent) {
        firstContent.classList.add('open');
        firstToggle.classList.add('rotated');
      }
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
    
    // Ouvrir toutes les catégories lors de la recherche
    document.querySelectorAll('.category-content').forEach(el => {
      el.classList.add('open');
    });
    document.querySelectorAll('.category-toggle').forEach(el => {
      el.classList.add('rotated');
    });
  });
});


 const sidebar = document.querySelector('.sidebar');
  const toggle = document.getElementById('sidebarToggle');
  const overlay = document.getElementById('sidebarOverlay');

  function openSidebar() {
    sidebar.classList.add('open');
    toggle.classList.add('active');
    overlay.classList.add('active');
    toggle.setAttribute('aria-label', 'Fermer le menu');
  }

  function closeSidebar() {
    sidebar.classList.remove('open');
    toggle.classList.remove('active');
    overlay.classList.remove('active');
    toggle.setAttribute('aria-label', 'Ouvrir le menu');
  }

  toggle.addEventListener('click', () => {
    sidebar.classList.contains('open') ? closeSidebar() : openSidebar();
  });

  overlay.addEventListener('click', closeSidebar);

  // Ferme le menu automatiquement quand on clique un lien
  document.querySelectorAll('.link-item').forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 768) closeSidebar();
    });
  });

  // Ferme le menu si on repasse en desktop
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) closeSidebar();
  });