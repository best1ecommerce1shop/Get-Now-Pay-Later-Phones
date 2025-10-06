const catalog = [
  {
    image: "https://i.ibb.co/QvL4N88s/Frame-42.png",
    id: 'ember-phone',
    name: 'Ember Phone 14',
    tag: 'Flagship device',
    colors: [
      { label: 'Crimson', value: '#d32f2f' },
      { label: 'Slate', value: '#2c2c2e' },
      { label: 'Ice', value: '#f5f5f7' }
    ],
    storage: [128, 256, 512]
  },
  {
    image: "https://i.ibb.co/spqvyGc9/Frame-41.png",
    id: 'ember-plus',
    name: 'Ember Phone 14 Plus',
    tag: 'Wide display',
    colors: [
      { label: 'Vermilion', value: '#ff4d6d' },
      { label: 'Shadow', value: '#1a1a1c' },
      { label: 'Sand', value: '#d6c8b4' }
    ],
    storage: [128, 256, 512]
  },
  {
    image: "https://i.ibb.co/Y4b4ZsnC/Frame-40.png",
    id: 'ember-fold',
    name: 'Ember Fold X',
    tag: 'Foldable series',
    colors: [
      { label: 'Aurora', value: '#ff6f91' },
      { label: 'Carbon', value: '#101012' },
      { label: 'Frost', value: '#eaeaef' }
    ],
    storage: [128, 256, 512]
  },
  {
    image: "https://i.ibb.co/s4bRt64/Frame-39.png",
    id: 'luminous-earbuds',
    name: 'Luminous Earbuds',
    tag: 'True wireless',
    colors: [
      { label: 'Ruby', value: '#be123c' },
      { label: 'Ceramic', value: '#ececec' },
      { label: 'Obsidian', value: '#0e0e10' }
    ],
    storage: [128, 256, 512]
  },
  {
    image: "https://i.ibb.co/ynZPK7RT/Frame-38.png",
    id: 'ember-watch',
    name: 'Ember Watch S',
    tag: 'Fitness ready',
    colors: [
      { label: 'Scarlet', value: '#f43f5e' },
      { label: 'Graphite', value: '#2a2a2d' },
      { label: 'Cloud', value: '#f3f4f6' }
    ],
    storage: [128, 256, 512]
  },
  {
    image: "https://i.ibb.co/6cZqzX5D/Frame-37.png",
    id: 'ember-bundle',
    name: 'Ember Essentials Bundle',
    tag: 'Starter kit',
    colors: [
      { label: 'Crimson', value: '#d32f2f' },
      { label: 'Charcoal', value: '#1f1f22' },
      { label: 'Shell', value: '#dedede' }
    ],
    storage: [128, 256, 512]
  }
];

const cartState = new Map();

const elements = {
  grid: document.getElementById('productGrid'),
  cartOverlay: document.getElementById('cartOverlay'),
  cartList: document.getElementById('cartList'),
  cartEmpty: document.getElementById('cartEmptyMessage'),
  cartCount: document.getElementById('cartCount'),
  cartToggle: document.getElementById('cartToggle'),
  cartClose: document.getElementById('cartClose'),
  heroExplore: document.getElementById('heroExplore'),
  cartCTA: document.getElementById('cartCTA'),
  insightFeedback: document.getElementById('insightFeedback')
};

let insightTimer = null;

document.addEventListener('DOMContentLoaded', () => {
  renderProducts();
  wireEvents();
  updateCartDisplay();
});

function renderProducts() {
  const fragment = document.createDocumentFragment();

  catalog.forEach((product) => {
    const card = document.createElement('article');
    card.className = 'product-card';
    card.dataset.productId = product.id;
    const hasImage = Boolean(product.image);
    card.innerHTML = `
      <div class="product-thumb${hasImage ? ' has-image' : ''}">
        ${hasImage ? `<img src="${product.image}" alt="${product.name} photo">` : ''}
      </div>
      <div class="product-meta">
        <span class="product-tag">${product.tag}</span>
        <span class="product-name">${product.name}</span>
      </div>
    `;

    card.addEventListener('click', () => toggleProduct(product.id));
    fragment.appendChild(card);
  });

  elements.grid.appendChild(fragment);
}

function wireEvents() {
  elements.cartToggle.addEventListener('click', openCart);
  elements.cartClose.addEventListener('click', closeCart);
  elements.cartOverlay.addEventListener('click', (event) => {
    if (event.target === elements.cartOverlay) {
      closeCart();
    }
  });

  if (elements.heroExplore) {
    elements.heroExplore.addEventListener('click', () => {
      elements.grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  if (elements.cartCTA) {
    elements.cartCTA.addEventListener('click', () => {
      if (!cartState.size) {
        closeCart();
        return;
      }
      showInsightConfirmation();
    });
  }
}

function showInsightConfirmation() {
  const feedback = elements.insightFeedback;
  if (!feedback) return;

  const circle = feedback.querySelector('.check-circle');
  const mark = feedback.querySelector('.check-mark');

  if (insightTimer) {
    clearTimeout(insightTimer);
  }

  document.body.classList.add('insight-active');
  feedback.classList.add('visible');
  feedback.setAttribute('aria-hidden', 'false');

  [circle, mark].forEach((node) => {
    if (!node) return;
    node.classList.remove('is-animating');
    void node.offsetWidth;
    node.classList.add('is-animating');
  });

  insightTimer = window.setTimeout(() => {
    closeCart();
  }, 5000);
}

function hideInsightConfirmation() {
  if (insightTimer) {
    clearTimeout(insightTimer);
    insightTimer = null;
  }

  document.body.classList.remove('insight-active');

  const feedback = elements.insightFeedback;
  if (!feedback) return;

  feedback.classList.remove('visible');
  feedback.setAttribute('aria-hidden', 'true');

  const circle = feedback.querySelector('.check-circle');
  const mark = feedback.querySelector('.check-mark');

  [circle, mark].forEach((node) => {
    if (!node) return;
    node.classList.remove('is-animating');
  });
}

function toggleProduct(productId) {
  if (cartState.has(productId)) {
    cartState.delete(productId);
  } else {
    const product = catalog.find((item) => item.id === productId);
    if (!product) return;
    cartState.set(productId, {
      product,
      colorIndex: 0,
      storageIndex: 0
    });
  }

  updateProductSelectionStates();
  updateCartDisplay();
}

function updateProductSelectionStates() {
  const cards = elements.grid.querySelectorAll('.product-card');
  cards.forEach((card) => {
    const { productId } = card.dataset;
    if (productId && cartState.has(productId)) {
      card.classList.add('selected');
    } else {
      card.classList.remove('selected');
    }
  });
}

function updateCartDisplay() {
  elements.cartList.innerHTML = '';

  if (!cartState.size) {
    elements.cartEmpty.classList.add('visible');
  } else {
    elements.cartEmpty.classList.remove('visible');
  }

  cartState.forEach((entry, productId) => {
    const listItem = document.createElement('li');
    listItem.className = 'cart-item';

    const header = document.createElement('div');
    header.className = 'cart-item-header';
    const title = document.createElement('span');
    title.className = 'cart-item-title';
    title.textContent = entry.product.name;
    const removeButton = document.createElement('button');
    removeButton.type = 'button';
    removeButton.className = 'cart-remove-btn';
    removeButton.setAttribute('aria-label', `Remove ${entry.product.name} from cart`);
    removeButton.innerHTML = '<span class="trash-icon" aria-hidden="true"></span>';
    removeButton.addEventListener('click', (event) => {
      event.stopPropagation();
      toggleProduct(productId);
    });
    header.append(title, removeButton);

    const colorLabel = document.createElement('span');
    colorLabel.className = 'variant-label';
    colorLabel.textContent = 'Colour';

    const colorRow = document.createElement('div');
    colorRow.className = 'variant-row';

    entry.product.colors.forEach((option, index) => {
      const swatch = document.createElement('button');
      swatch.type = 'button';
      swatch.className = `color-swatch${index === entry.colorIndex ? ' active' : ''}`;
      swatch.setAttribute('aria-pressed', index === entry.colorIndex);
      swatch.setAttribute('aria-label', `${entry.product.name} in ${option.label}`);

      const dot = document.createElement('span');
      dot.style.background = option.value;
      swatch.appendChild(dot);

      swatch.addEventListener('click', (event) => {
        event.stopPropagation();
        const item = cartState.get(productId);
        if (!item) return;
        item.colorIndex = index;
        updateCartDisplay();
      });

      colorRow.appendChild(swatch);
    });

    const storageLabel = document.createElement('span');
    storageLabel.className = 'variant-label';
    storageLabel.textContent = 'Storage';

    const storageRow = document.createElement('div');
    storageRow.className = 'variant-row';

    entry.product.storage.forEach((size, index) => {
      const pill = document.createElement('button');
      pill.type = 'button';
      pill.className = `storage-pill${index === entry.storageIndex ? ' active' : ''}`;
      pill.textContent = `${size} GB`;
      pill.addEventListener('click', (event) => {
        event.stopPropagation();
        const item = cartState.get(productId);
        if (!item) return;
        item.storageIndex = index;
        updateCartDisplay();
      });
      storageRow.appendChild(pill);
    });

    listItem.append(header, colorLabel, colorRow, storageLabel, storageRow);

    elements.cartList.appendChild(listItem);
  });

  elements.cartCount.textContent = cartState.size;
}

function openCart() {
  elements.cartOverlay.classList.add('open');
  elements.cartOverlay.setAttribute('aria-hidden', 'false');
}

function closeCart() {
  hideInsightConfirmation();
  elements.cartOverlay.classList.remove('open');
  elements.cartOverlay.setAttribute('aria-hidden', 'true');
}
