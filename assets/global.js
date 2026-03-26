class Announcement extends HTMLElement {
  constructor() {
    super();
    this.querySelector('button').addEventListener('click', this.onCloseButtonClick.bind(this));
  }

  onCloseButtonClick(event) {
    const announcementElement = event.currentTarget.closest('.announcement');
    announcementElement.remove();
  }
}

customElements.define('announcement-bar', Announcement);

class VariantPicker extends HTMLElement {
  constructor() {
    super();
    console.log('variant picker');
  }

  get sectionId() {
    return this.dataset.sectionId;
  }

  connectedCallback() {
    console.log('connected', this.sectionId);

    this.variantSelectors = this.querySelectorAll('input[type="radio"]');
    this.variantSelectors.forEach(selector => {
      selector.addEventListener('change', this.handleChange.bind(this));
    });
  }

  disconnectedCallback() {
    console.log('disconnected', this.sectionId);
    this.variantSelectors.forEach(selector => {
      selector.removeEventListener('change', this.handleChange.bind(this));
    });
  }

  handleChange(event) {
    const input = event.currentTarget;
    const url = `${window.location.pathname}?variant=${input.value}&section_id=${this.sectionId}`;
    fetch(url)
      .then(res => res.text())
      .then(html => {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;

        const newSection = tempDiv.querySelector(`[section-id="${this.sectionId}"]`);
        const currentSection = document.querySelector(`[section-id="${this.sectionId}"]`);
        console.log(newSection, currentSection);

        if (newSection && currentSection) {
          console.log('replaced');

          currentSection.replaceWith(newSection);
        }

        const newURL = new URL(url, window.location.origin);
        newURL.searchParams.delete('section_id');
        window.history.replaceState({}, '', newURL);
        // const variant = data.variant;
        // const section = data.section;

        // // Update the hidden input with the new variant ID
        // const hiddenInput = document.querySelector(`#variant-id`);
        // hiddenInput.value = variant.id;

        // // Update the price and availability
        // const priceElement = document.querySelector('#product-price');
        // priceElement.textContent = `$${(variant.price / 100).toFixed(2)}`;

        // const addToCartButton = document.querySelector('.add-to-cart');
        // if (variant.available) {
        //   addToCartButton.disabled = false;
        //   addToCartButton.textContent = 'Add to Cart';
        //   addToCartButton.setAttribute('data-product-id', variant.id);
        // } else {
        //   addToCartButton.disabled = true;
        //   addToCartButton.textContent = 'Sold Out';
        //   addToCartButton.removeAttribute('data-product-id');
        // }
      })
      .catch(err => console.error('Error fetching variant data:', err));
    console.log('change', event.currentTarget, event.target.value, url);
  }

}

customElements.define('variant-picker', VariantPicker);

// Add to cart
document.addEventListener("DOMContentLoaded", function () {
  console.log('loaded');

  const dialog = document.querySelector('#product-dialog');
  const closeButton = dialog.querySelector('#close-dialog');

  closeButton.addEventListener('click', () => {
    dialog.close();
  });

  const addToCartButtons = document.querySelectorAll('.add-to-cart');
  const chooseOptionsButtons = document.querySelectorAll('.choose-options');
  console.log('addToCartButtons', addToCartButtons);
  addToCartButtons.forEach(button => {
    button.addEventListener('click', () => {
      const productId = button.getAttribute('data-product-id');
      addToCart(productId, 1)
        .then(cart => console.log('Added!', cart))
        .catch(err => console.error(err));
    });
  });

  chooseOptionsButtons.forEach(button => {
    button.addEventListener('click', async () => {
      const handle = button.dataset.productHandle;
      const product = await fetchProduct(handle);

      openDialog(product);
    });
  });

  async function addToCart(variantId, quantity = 1) {
    const response = await fetch(window.Shopify.routes.root + 'cart/add.js', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items: [
          {
            id: variantId,       // variant ID (not product ID)
            quantity: quantity,
          }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.description || 'Could not add item to cart');
    }

    return data;
  }
  async function fetchProduct(handle) {
    const res = await fetch(`/products/${handle}.js`);
    return await res.json();
  }

  function openDialog(product) {
    const dialog = document.querySelector('#product-dialog');
    dialog.querySelector('h2').textContent = product.title;
    dialog.querySelector('p').textContent = product.description;
    dialog.showModal();
  }
});