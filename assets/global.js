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
    this.productId = this.dataset.productId;
    this.productHandle = this.dataset.productHandle;
    this.sectionId = this.dataset.sectionId;
  }

  connectedCallback() {
    this.variantSelectors = this.querySelectorAll('input[type="radio"]');
    this.variantSelectors.forEach(selector => {
      selector.addEventListener('change', this.handleChange.bind(this));
    });
  }

  disconnectedCallback() {
    this.variantSelectors.forEach(selector => {
      selector.removeEventListener('change', this.handleChange.bind(this));
    });
  }

  handleChange(event) {
    const input = event.currentTarget;
    const url = `${window.location.origin}/products/${this.productHandle}?variant=${input.value}&section_id=${this.sectionId}`;
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
        // window.history.replaceState({}, '', newURL);
      })
      .catch(err => console.error('Error fetching variant data:', err));
  }

}
customElements.define('variant-picker', VariantPicker);

class ProductForm extends HTMLElement {
  constructor() {
    super();
    this.form = this.querySelector('form');
    this.fieldset = this.querySelector('fieldset');

    this.quantityInput = this.form.querySelector(
      "input[name='quantity']"
    );
    this.productIdInput = this.form.querySelector(
      "input[name='id']"
    );
    this.variantIdInput = this.form.querySelector(
      "input[name='variant-id']"
    );

    this.minusButton = this.querySelector("[data-quantity-minus]");
    this.plusButton = this.querySelector("[data-quantity-plus]");
  }

  connectedCallback() {
    console.log('ProductForm connected');

    this.form.addEventListener('submit', this.handleSubmit.bind(this));

    this.handleMinusClick = this.handleMinusClick.bind(this);
    this.handlePlusClick = this.handlePlusClick.bind(this);

    this.minusButton.addEventListener("click", this.handleMinusClick);
    this.plusButton.addEventListener("click", this.handlePlusClick);

  }

  disconnectedCallback() {
    console.log('ProductForm disconnected');
    this.form.removeEventListener('submit', this.handleSubmit.bind(this));
    this.minusButton.removeEventListener("click", this.handleMinusClick);
    this.plusButton.removeEventListener("click", this.handlePlusClick);
  }

  handleMinusClick() {
    console.log('handleMinusClick');

    if (parseInt(this.quantityInput.value) === 1) {
      return;
    }
    this.quantityInput.value = parseInt(this.quantityInput.value) - 1;
  }

  handlePlusClick() {
    console.log('handlePlusClick');

    const maxQuantity = parseInt(this.quantityInput.getAttribute('max'));
    if (parseInt(this.quantityInput.value) === maxQuantity) {
      return;
    }
    this.quantityInput.value = parseInt(this.quantityInput.value) + 1;
  }

  handleSubmit(event) {
    event.preventDefault();
    this.fieldset.disabled = true;
    const url = '/cart/add.js';
    const formData = {
      quantity: this.quantityInput.value,
      id: this.variantIdInput.value
    }
    fetch(url, {
      method: 'POST',
      body: JSON.stringify(formData),
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(res => {
        if (!res.ok) {
          return res.json().then(data => {
            throw new Error(data.description || 'Could not add item to cart');
          });
        }
        return res.json();
      })
      .then(data => {
        console.log('Added to cart!', data);
        // Optionally, you can update the cart UI here or show a success message.
      })
      .catch(err => console.error('Error adding to cart:', err))
      .finally(() => {
        this.fieldset.disabled = false;
      });
  }
}
customElements.define('product-form', ProductForm);

class ProductGallery extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.thumbnails = this.querySelectorAll('.product-gallery-thumbnails span');
    this.mainImage = this.querySelector('.product-gallery-main-image');
    this.updateMainImage = this.updateMainImage.bind(this);
    if (this.thumbnails.length > 0 && this.mainImage) {
      this.thumbnails.forEach(thumbnail => {
        thumbnail.addEventListener('click', this.updateMainImage);
      });
    }
  }

  disconnectedCallback() {
  }

  updateMainImage(event) {
    const span = event.currentTarget;
    const thumbImage = span.querySelector('img');
    const imageSrc = thumbImage.getAttribute('src');
    const imageSrcSet = thumbImage.getAttribute('srcset');
    this.mainImage.src = imageSrc;
    this.mainImage.srcset = imageSrcSet;
  }
}
customElements.define('product-gallery', ProductGallery);

class SplideCarousel extends HTMLElement {
  constructor() {
    super();
    this.splideEl = this.querySelector('.splide-carousel');
  }

  initCarousel() {
    new Splide(this.splideEl, {
      type: 'loop',
      perPage: 5,
      perMove: 1,
      pagination: false,
      arrows: false,
      autoplay: true,
      interval: 50000,
      breakpoints: {
        1600: {
          perPage: 5,
        },
        1400: {
          perPage: 4,
        },
        1200: {
          perPage: 3,
        },
        1024: {
          perPage: 2,
        },
        600: {
          perPage: 1,
        },
      },
    }).mount();
  }

  connectedCallback() {
    if (this.splideEl) {
      this.initCarousel();
    }
  }

  disconnectedCallback() {
    this.splide && this.splide.destroy();
  }
}
customElements.define('splide-carousel', SplideCarousel);

class ReviewsCarousel extends HTMLElement {
  constructor() {
    super();
    this.splideEl = this.querySelector('.splide.reviews');
  }

  initCarousel() {
    new Splide(this.splideEl, {
      type: 'loop',
      perPage: 5,
      perMove: 1,
      pagination: false,
      arrows: true,
      autoplay: true,
      gap: 20,
      interval: 5000,
      breakpoints: {
        1600: {
          perPage: 5,
        },
        1400: {
          perPage: 4,
        },
        1200: {
          perPage: 3,
        },
        1024: {
          perPage: 2,
        },
        600: {
          perPage: 1,
        },
      },
    }).mount();
  }

  connectedCallback() {
    if (this.splideEl) {
      this.initCarousel();
    }
  }

  disconnectedCallback() {
    this.splide && this.splide.destroy();
  }
}
customElements.define('reviews-carousel', ReviewsCarousel);

class HeaderMenu extends HTMLElement {
  constructor() {
    super();
    this.links = this.querySelectorAll('.header-link');
    this.mouseenter = this.mouseenter.bind(this);
    this.mouseleave = this.mouseleave.bind(this);
  }
  mouseenter(event) {
    const content = event.currentTarget.querySelector('.header-link-content');
    if (content) {
      const contentHeight = content.scrollHeight;
      content.style.height = contentHeight + 'px';
      content.classList.add('header-content-visible');
    }
  }

  mouseleave(event) {
    const content = event.currentTarget.querySelector('.header-link-content');
    if (content) {
      content.classList.remove('header-content-visible');
      content.style.height = '0';
    }
  }
  connectedCallback() {
    this.links.forEach((link) => {
      link.addEventListener('mouseenter', this.mouseenter);
      link.addEventListener('mouseleave', this.mouseleave);
    });
  }

  disconnectedCallback() {
    this.links.forEach((link) => {
      link.removeEventListener('mouseenter', this.mouseenter);
      link.removeEventListener('mouseleave', this.mouseleave);
    });
  }
}
customElements.define('header-menu', HeaderMenu);

class SearchForm extends HTMLElement {
  constructor() {
    super();
    this.form = this.querySelector('form');
    this.input = this.form.querySelector('input[name="q"]');
    this.clearButton = this.form.querySelector('.clear');
  }

  connectedCallback() {

    this.handleInput = this.handleInput.bind(this);
    this.handleClear = this.handleClear.bind(this);

    this.input.addEventListener('input', this.handleInput);
    this.clearButton.addEventListener('click', this.handleClear);

    if (this.input.value.trim() !== '') {

      this.classList.add('search-active');
    } else {
      this.classList.remove('search-active');
    }
  }

  disconnectedCallback() {
    this.input.removeEventListener('input', this.handleInput);
    this.clearButton.removeEventListener('click', this.handleClear);
  }

  handleInput() {
    if (this.input.value.trim() !== '') {
      this.clearButton.classList.remove('hidden');
    } else {
      this.clearButton.classList.add('hidden');
    }
  }

  handleClear() {
    this.input.value = '';
    this.clearButton.classList.add('hidden');
    this.input.focus();
  }
}
customElements.define('search-form', SearchForm);

class ProductCard extends HTMLElement {
  constructor() {
    super();
    this.productId = this.dataset.productId;

    this.productHandle = this.dataset.productHandle;
    this.chooseOptionsButtons = this.querySelectorAll('.choose-options');
    this.addToCartButtons = this.querySelectorAll('.add-to-cart');
  }

  connectedCallback() {
    this.chooseOptionsButtons.forEach(button => {
      button.addEventListener('click', this.handleChooseOptionsClick.bind(this));
    });
    this.addToCartButtons.forEach(button => {
      button.addEventListener('click', this.handleAddToCartClick.bind(this));
    });
  }

  disconnectedCallback() {
    this.chooseOptionsButtons.forEach(button => {
      button.removeEventListener('click', this.handleChooseOptionsClick);
    });
    this.addToCartButtons.forEach(button => {
      button.removeEventListener('click', this.handleAddToCartClick);
    });
  }

  handleChooseOptionsClick(event) {
    const dataEvent = new CustomEvent('product-dialog-open', {
      detail: {
        productId: this.productId,
        productHandle: this.productHandle,
      },
      bubbles: true
    });
    document.body.dispatchEvent(dataEvent);
  }

  handleAddToCartClick(event) {
    const button = event.currentTarget;
    const variantId = button.dataset.productId;
  }

}
customElements.define('product-card', ProductCard);

class ProductDialog extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.dialog = this.querySelector('dialog');
    this.closeButton = this.dialog.querySelector('#close-dialog');

    this.handleCloseButtonClick = this.handleCloseButtonClick.bind(this);
    this.closeButton.addEventListener('click', this.handleCloseButtonClick);

    document.body.addEventListener('product-dialog-open', (event) => {
      const url = `/products/${event.detail.productHandle}?product_id=${event.detail.productId}`;
      fetch(url)
        .then(res => res.text())
        .then(html => {
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = html;
          const productForm = tempDiv.querySelector('#main-product');
          console.log('productForm', productForm);

          if (productForm) {
            this.dialog.querySelector('.dialog-content').innerHTML = productForm.outerHTML;
          }
        })
        .catch(err => console.error('Error fetching product dialog content:', err));
      this.dialog.showModal();
    });
    document.body.addEventListener('product-dialog-close', () => {
      console.log('Dialog closed');
      this.dialog.close();
    });

  }

  disconnectedCallback() {
    this.closeButton.removeEventListener('click', this.handleCloseButtonClick);
  }

  handleCloseButtonClick() {
    this.dialog.close();
  }
}
customElements.define('product-dialog', ProductDialog);

class ProductCart extends HTMLElement {
  constructor() {
    super();
    this.form = this.querySelector('form');
    this.formFieldset = this.form.querySelector('fieldset');
    this.quantityInputs = this.querySelectorAll("[data-quantity-input]");
    this.sectionId = this.dataset.sectionId;
    console.log('this.sectionId', this.sectionId);

  }

  connectedCallback() {
    console.log(this.quantityInputs, this.form);
    this.form.addEventListener('submit', this.handleSubmit.bind(this));

    console.log('ProductCart');
  }
  disconnectedCallback() {
    this.form.removeEventListener('submit', this.handleSubmit.bind(this));
  }

  updateCartSection() {
    const url = `${window.location.origin}/cart?section_id=${this.sectionId}`;
    fetch(url)
      .then(res => {
        if (!res.ok) {
          this.formFieldset.disabled = false;
          throw new Error('Failed to fetch cart section');
        }
        return res.text();
      })
      .then(html => {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        console.log(`#shopify-section-${this.sectionId}`);

        const newSection = tempDiv.querySelector(`#shopify-section-${this.sectionId}`);
        const currentSection = document.querySelector(`#shopify-section-${this.sectionId}`);
        if (newSection && currentSection) {
          currentSection.replaceWith(newSection);
        }
        this.formFieldset.disabled = false;
      })
      .catch(err => {
        console.error('Error fetching cart section:', err);
        this.formFieldset.disabled = false;
      });
  }

  handleSubmit(event) {
    event.preventDefault();
    const formData = new FormData(this.form);
    console.log('formData', formData);
    this.formFieldset.disabled = true;
    fetch('/cart/update.js', {
      method: 'POST',
      body: formData,
    })
      .then(res => {
        if (!res.ok) {
          this.formFieldset.disabled = false;
          return res.json().then(data => {
            throw new Error(data.description || 'Could not update cart');
          });
        }
        return res.json();
      })
      .then(data => {
        console.log('Cart updated!', data);
        this.updateCartSection();
      })
      .catch(err => {
        console.error('Error updating cart:', err);
        this.formFieldset.disabled = false;
      });
  }
}
customElements.define('product-cart', ProductCart);

class CartProductItem extends HTMLElement {
  constructor() {
    super();

    this.quantityInput = this.querySelector("[data-quantity-input]");
    this.minusButton = this.querySelector("[data-quantity-minus]");
    this.plusButton = this.querySelector("[data-quantity-plus]");
    this.removeButton = this.querySelector("[data-remove-item]");
    console.log('this.quantityInput', this.quantityInput);
    console.log('this.minusButton', this.minusButton);
    console.log('this.plusButton', this.plusButton);
    console.log('this.removeButton', this.removeButton);
  }

  connectedCallback() {
    console.log('CartProductItem');

    this.minusButton.addEventListener('click', this.handleMinusClick.bind(this));
    this.plusButton.addEventListener('click', this.handlePlusClick.bind(this));
    this.removeButton.addEventListener('click', this.handleRemoveClick.bind(this));

  }
  disconnectedCallback() {
    this.minusButton.removeEventListener('click', this.handleMinusClick);
    this.plusButton.removeEventListener('click', this.handlePlusClick);
    this.removeButton.removeEventListener('click', this.handleRemoveClick);
  }


  handleMinusClick() {
    console.log('handleMinusClick');

    if (parseInt(this.quantityInput.value) === 1) {
      return;
    }
    this.quantityInput.value = parseInt(this.quantityInput.value) - 1;
  }

  handlePlusClick() {
    console.log('handlePlusClick');

    const maxQuantity = parseInt(this.quantityInput.getAttribute('max'));
    if (parseInt(this.quantityInput.value) === maxQuantity) {
      return;
    }
    this.quantityInput.value = parseInt(this.quantityInput.value) + 1;
  }

  handleRemoveClick() {
    console.log('handleRemoveClick');
    // Implement remove from cart functionality here
  }
}
customElements.define('cart-product-item', CartProductItem);

// Add to cart
document.addEventListener("DOMContentLoaded", function () {

  // const dialog = document.querySelector('#product-dialog');
  // const closeButton = dialog.querySelector('#close-dialog');

  // closeButton.addEventListener('click', () => {
  //   dialog.close();
  // });

  // const addToCartButtons = document.querySelectorAll('.add-to-cart');
  // const chooseOptionsButtons = document.querySelectorAll('.choose-options');
  // addToCartButtons.forEach(button => {
  //   button.addEventListener('click', () => {
  //     const productId = button.getAttribute('data-product-id');
  //     addToCart(productId, 1)
  //       .then(cart => console.log('Added!', cart))
  //       .catch(err => console.error(err));
  //   });
  // });

  // chooseOptionsButtons.forEach(button => {
  //   button.addEventListener('click', async () => {
  //     const handle = button.dataset.productHandle;
  //     const product = await fetchProduct(handle);

  //     openDialog(product);
  //   });
  // });

  // async function addToCart(variantId, quantity = 1) {
  //   const response = await fetch(window.Shopify.routes.root + 'cart/add.js', {
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/json',
  //     },
  //     body: JSON.stringify({
  //       items: [
  //         {
  //           id: variantId,       // variant ID (not product ID)
  //           quantity: quantity,
  //         }
  //       ]
  //     })
  //   });

  //   const data = await response.json();

  //   if (!response.ok) {
  //     throw new Error(data.description || 'Could not add item to cart');
  //   }

  //   return data;
  // }
  // async function fetchProduct(handle) {
  //   const res = await fetch(`/products/${handle}.js`);
  //   return await res.json();
  // }

  function openDialog() {
    // product
    // const dialog = document.querySelector('#product-dialog');
    // dialog.querySelector('h2').textContent = product.title;
    // dialog.querySelector('p').textContent = product.description;
    dialog.showModal();
  }










});