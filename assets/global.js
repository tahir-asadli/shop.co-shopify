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
    console.log('connected variant-picker', this.sectionId);
    this.variantSelectors = this.querySelectorAll('input[type="radio"]');
    this.variantSelectors.forEach(selector => {
      selector.addEventListener('change', this.handleChange.bind(this));
    });
  }

  disconnectedCallback() {
    console.log('disconnected variant-picker', this.sectionId);
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
        if (newSection && currentSection) {
          currentSection.replaceWith(newSection);
        }
        const newURL = new URL(url, window.location.origin);
        newURL.searchParams.delete('section_id');
        window.history.replaceState({}, '', newURL);
      })
      .catch(err => console.error('Error fetching variant data:', err));
    console.log('change', event.currentTarget, event.target.value, url);
  }

}

customElements.define('variant-picker', VariantPicker);

class ProductForm extends HTMLElement {
  constructor() {
    super();
    console.log('product form');
  }

  connectedCallback() {
    console.log('connected product-form');
    this.form = this.querySelector('form');

    this.quantityInput = this.form.querySelector(
      "input[name='quantity']"
    );
    console.log('this.form', this.form);
    console.log('this.quantityInput', this.quantityInput);
    this.form.addEventListener('submit', this.handleSubmit.bind(this));
    this.minusButton = this.querySelector("[data-quantity-minus]");
    this.plusButton = this.querySelector("[data-quantity-plus]");
    console.log('this.plusButton', this.plusButton);
    console.log('this.minusButton', this.minusButton);

    this.handleMinusClick = this.handleMinusClick.bind(this);
    this.handlePlusClick = this.handlePlusClick.bind(this);

    this.minusButton.addEventListener("click", this.handleMinusClick);
    this.plusButton.addEventListener("click", this.handlePlusClick);

  }

  disconnectedCallback() {
    console.log('disconnected product-form');
    this.form.removeEventListener('submit', this.handleSubmit.bind(this));
    this.minusButton.removeEventListener("click", this.handleMinusClick);
    this.plusButton.removeEventListener("click", this.handlePlusClick);
  }

  handleMinusClick() {
    if (parseInt(this.quantityInput.value) === 1) {
      return;
    }
    this.quantityInput.value = parseInt(this.quantityInput.value) - 1;
    console.log('this.quantityInput', this.quantityInput.value);
  }

  handlePlusClick() {
    const maxQuantity = parseInt(this.quantityInput.getAttribute('max'));
    if (parseInt(this.quantityInput.value) === maxQuantity) {
      return;
    }
    this.quantityInput.value = parseInt(this.quantityInput.value) + 1;
    console.log('this.quantityInput', this.quantityInput.value);
  }

  handleSubmit(event) {
    event.preventDefault();

    const url = this.form.action;
    const formData = new FormData(this.form);
    fetch(url, {
      method: 'POST',
      body: formData,
    })
      .then(res => res.json())
      .then(data => {
        console.log('Added to cart!', data);
        // Optionally, you can update the cart UI here or show a success message.
      })
      .catch(err => console.error('Error adding to cart:', err));


    // const formData = new FormData(this.form);
    // const variantId = formData.get('id');
    // const quantity = formData.get('quantity') || 1;
    // addToCart(variantId, quantity)
    //   .then(cart => console.log('Added to cart!', cart))
    //   .catch(err => console.error('Error adding to cart:', err));
  }
}

customElements.define('product-form', ProductForm);


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