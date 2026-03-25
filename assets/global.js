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
    const response = await fetch('/cart/add.js', {
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