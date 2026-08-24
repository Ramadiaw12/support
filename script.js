document.addEventListener('DOMContentLoaded', () => {
  const treeContainer = document.getElementById('tree-container');
  const searchInput = document.getElementById('search');
  const contentDisplay = document.getElementById('content-display');
  const pageTitle = document.getElementById('page-title');
  const pageSubtitle = document.getElementById('page-subtitle');
  const breadcrumbPath = document.getElementById('breadcrumb-path');
  const totalCategories = document.getElementById('total-categories');
  const totalLinks = document.getElementById('total-links');

  // Éléments du menu burger (mobile)
  const sidebar = document.querySelector('.sidebar');
  const sidebarToggle = document.getElementById('sidebarToggle');
  const sidebarOverlay = document.getElementById('sidebarOverlay');

  let allData = null;
  let linkCount = 0;
  let categoryCount = 0;

  //  MENU BURGER (mobile) 
  function openSidebar() {
    if (!sidebar) return;
    sidebar.classList.add('open');
    sidebarToggle?.classList.add('active');
    sidebarOverlay?.classList.add('active');
    sidebarToggle?.setAttribute('aria-label', 'Fermer le menu');
  }

  function closeSidebar() {
    if (!sidebar) return;
    sidebar.classList.remove('open');
    sidebarToggle?.classList.remove('active');
    sidebarOverlay?.classList.remove('active');
    sidebarToggle?.setAttribute('aria-label', 'Ouvrir le menu');
  }

  if (sidebarToggle) {
    sidebarToggle.addEventListener('click', () => {
      sidebar.classList.contains('open') ? closeSidebar() : openSidebar();
    });
  }

  if (sidebarOverlay) {
    sidebarOverlay.addEventListener('click', closeSidebar);
  }

  // Ferme le menu avec la touche Échap
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeSidebar();
  });

  // Ferme le menu si on repasse en desktop
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) closeSidebar();
  });

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
    for (const [key, icon] of Object.entries(categoryIcons)) {
      if (categoryName.toLowerCase().includes(key.toLowerCase())) {
        return icon;
      }
    }
    return categoryIcons.default;
  }

 
  const NON_EMBEDDABLE_DOMAINS = [
    'github.com',
    'gist.github.com',
    'drive.google.com',
    'docs.google.com',
    'notion.so',
    'www.notion.so',
    'figma.com',
    'www.figma.com',
    'linkedin.com',
    'twitter.com',
    'x.com',
    'stackoverflow.com'
  ];

  function getDomainInfo(url) {
    try {
      const hostname = new URL(url).hostname.replace(/^www\./, '');
      const blocked = NON_EMBEDDABLE_DOMAINS.some(d =>
        hostname === d.replace(/^www\./, '') || hostname.endsWith('.' + d.replace(/^www\./, ''))
      );
      return { hostname, blocked };
    } catch {
      return { hostname: url, blocked: false };
    }
  }

  // Convertit certains liens Google Drive en version "preview" embarquable
  function toEmbeddableUrl(url) {
    const driveMatch = url.match(/drive\.google\.com\/file\/d\/([^/]+)/);
    if (driveMatch) {
      return `https://drive.google.com/file/d/${driveMatch[1]}/preview`;
    }
    return url;
  }

  function domainIconClass(hostname) {
    if (hostname.includes('github')) return 'fa-brands fa-github';
    if (hostname.includes('drive.google') || hostname.includes('docs.google')) return 'fa-brands fa-google-drive';
    if (hostname.includes('notion')) return 'fa-solid fa-file-lines';
    if (hostname.includes('figma')) return 'fa-brands fa-figma';
    if (hostname.includes('linkedin')) return 'fa-brands fa-linkedin';
    if (hostname.includes('stackoverflow')) return 'fa-brands fa-stack-overflow';
    return 'fa-solid fa-arrow-up-right-from-square';
  }

  // Charger le fichier JSON
  fetch('data/ressources.json')
    .then(res => res.json())
    .then(data => {
      allData = data;
      categoryCount = data.categories.length;
      linkCount = data.categories.reduce(
        (total, cat) => total + cat.sousCategories.reduce(
          (subTotal, sub) => subTotal + sub.liens.length, 0
        ), 0
      );

      if (totalCategories) totalCategories.textContent = categoryCount;
      if (totalLinks) totalLinks.textContent = linkCount;

      buildTree(data);
    })
    .catch(err => {
      treeContainer.innerHTML = '<p style="color:red; padding: 12px;">⚠️ Erreur chargement des ressources.</p>';
      console.error(err);
    });

  function selectLink(linkEl) {
    document.querySelectorAll('.link-item').forEach(el => el.classList.remove('active'));
    linkEl.classList.add('active');
    // Sur mobile, refermer le menu après sélection
    if (window.innerWidth <= 768) closeSidebar();
  }

  function buildTree(data) {
    treeContainer.innerHTML = '';

    data.categories.forEach((cat, catIndex) => {
      const catDiv = document.createElement('div');
      catDiv.className = 'category';

      // En-tête de catégorie
      const header = document.createElement('div');
      header.className = 'category-header';
      header.setAttribute('tabindex', '0');
      header.setAttribute('role', 'button');
      header.setAttribute('aria-expanded', 'false');

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
          linkEl.href = '#';
          linkEl.dataset.url = lien.url;
          linkEl.dataset.titre = lien.titre;
          linkEl.dataset.category = cat.nom;
          linkEl.dataset.subcategory = sub.nom;
          linkEl.dataset.isIntro = lien.isIntro || false;

          linkEl.addEventListener('click', (e) => {
            e.preventDefault();

            // Page d'introduction
            if (linkEl.dataset.isIntro === 'true') {
              pageTitle.textContent = "Introduction";
              pageSubtitle.textContent = "Bienvenue sur ma plateforme";
              breadcrumbPath.textContent = "Environnement de travail › Introduction";

              const contentHtml = lien.content || '<p>Contenu non disponible</p>';
              contentDisplay.innerHTML = `
                <div class="content-display-content">
                  ${contentHtml}
                </div>
              `;

              selectLink(linkEl);
              return;
            }

            // Lien normal
            pageTitle.textContent = lien.titre;
            pageSubtitle.textContent = `${cat.nom} › ${sub.nom}`;
            breadcrumbPath.textContent = `Uptime Formation › ${cat.nom}`;

            const { hostname, blocked } = getDomainInfo(lien.url);

            if (blocked) {
              // Le site refuse l'affichage en iframe (GitHub, LinkedIn, etc.)
              contentDisplay.innerHTML = `
                <div class="content-display-content">
                  <div class="external-link-card">
                    <i class="${domainIconClass(hostname)} external-link-card-icon"></i>
                    <h3>${lien.titre}</h3>
                    <p>${hostname} ne permet pas l'aperçu intégré pour des raisons de sécurité.</p>
                    <a class="external-link-card-btn" href="${lien.url}" target="_blank" rel="noopener noreferrer">
                      <i class="fas fa-external-link-alt"></i> Ouvrir ${hostname}
                    </a>
                  </div>
                </div>
              `;
            } else {
              const embedUrl = toEmbeddableUrl(lien.url);
              contentDisplay.innerHTML = `
                <div class="content-display-content">
                  <iframe src="${embedUrl}" loading="lazy" sandbox="allow-scripts allow-same-origin allow-forms"></iframe>
                  <div class="link-actions">
                    <a href="${lien.url}" target="_blank" rel="noopener noreferrer">
                      <i class="fas fa-external-link-alt"></i> Ouvrir dans un nouvel onglet
                    </a>
                  </div>
                </div>
              `;
            }

            selectLink(linkEl);
          });

          subDiv.appendChild(linkEl);
        });

        content.appendChild(subDiv);
      });

      // Gestion accordéon
      function toggleCategory() {
        const isOpen = content.classList.toggle('open');
        toggle.classList.toggle('rotated', isOpen);
        header.setAttribute('aria-expanded', String(isOpen));
      }

      header.addEventListener('click', toggleCategory);
      header.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleCategory();
        }
      });

      // Ouvrir la première catégorie par défaut
      if (catIndex === 0) {
        content.classList.add('open');
        toggle.classList.add('rotated');
        header.setAttribute('aria-expanded', 'true');
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

    document.querySelectorAll('.category-content').forEach(el => el.classList.add('open'));
    document.querySelectorAll('.category-toggle').forEach(el => el.classList.add('rotated'));
    document.querySelectorAll('.category-header').forEach(el => el.setAttribute('aria-expanded', 'true'));
  });
});