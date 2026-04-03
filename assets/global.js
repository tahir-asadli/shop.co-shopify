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
    this.form.addEventListener('submit', this.handleSubmit.bind(this));

    this.handleMinusClick = this.handleMinusClick.bind(this);
    this.handlePlusClick = this.handlePlusClick.bind(this);

    this.minusButton.addEventListener("click", this.handleMinusClick);
    this.plusButton.addEventListener("click", this.handlePlusClick);

  }

  disconnectedCallback() {
    this.form.removeEventListener('submit', this.handleSubmit.bind(this));
    this.minusButton.removeEventListener("click", this.handleMinusClick);
    this.plusButton.removeEventListener("click", this.handlePlusClick);
  }

  handleMinusClick() {
    if (parseInt(this.quantityInput.value) === 1) {
      return;
    }
    this.quantityInput.value = parseInt(this.quantityInput.value) - 1;
  }

  handlePlusClick() {
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
        document.dispatchEvent(new CustomEvent('show-notification', {
          detail: {
            type: 'success',
            message: 'Added to cart!',
          }, bubbles: true
        }));

        document.dispatchEvent(new CustomEvent('update-cart-button', { bubbles: true }));
      })
      .catch(err => {
        document.dispatchEvent(new CustomEvent('show-notification', {
          detail: {
            type: 'error',
            message: 'Error adding to cart!',
          }, bubbles: true
        }));
        console.error('Error adding to cart:', err);
      })
      .finally(() => {

        document.body.dispatchEvent(new CustomEvent('product-dialog-close', {
          bubbles: true
        }));
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
    const imageSrc = span.dataset.largeImage || thumbImage.src;
    // const imageSrcSet = thumbImage.getAttribute('srcset');
    this.mainImage.src = imageSrc;
    this.mainImage.srcset = imageSrc;
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
    button.disabled = true;
    fetch('/cart/add.js', {
      method: 'POST',
      body: JSON.stringify({
        id: this.productId,
        quantity: 1
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(res => {
        if (!res.ok) {
          return res.json().then(data => {
            document.dispatchEvent(new CustomEvent('show-notification', {
              detail: {
                type: 'error',
                message: 'Could not add item to cart!',
              }, bubbles: true
            }));
            throw new Error(data.description || 'Could not add item to cart');
          });
        }
        return res.json();
      })
      .then(data => {
        document.dispatchEvent(new CustomEvent('show-notification', {
          detail: {
            type: 'success',
            message: 'Added to cart!',
          }, bubbles: true
        }));

        document.dispatchEvent(new CustomEvent('update-cart-button', { bubbles: true }));
      })
      .catch(err => {
        console.error('Error adding to cart:', err);
        document.dispatchEvent(new CustomEvent('show-notification', {
          detail: {
            type: 'error',
            message: 'Error adding to cart: ' + err.message,
          }, bubbles: true
        }));
      }).finally(() => {
        button.disabled = false;
      });
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
    this.handleBackdropClick = this.handleBackdropClick.bind(this);
    this.closeButton.addEventListener('click', this.handleCloseButtonClick);

    document.body.addEventListener('product-dialog-open', (event) => {
      const url = `/products/${event.detail.productHandle}?product_id=${event.detail.productId}`;
      fetch(url)
        .then(res => {
          if (!res.ok) {
            throw new Error('Failed to fetch product dialog content');
          }
          return res.text();
        })
        .then(html => {
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = html;
          const productForm = tempDiv.querySelector('#main-product');
          if (productForm) {
            this.dialog.querySelector('.dialog-content').innerHTML = productForm.outerHTML;
            document.documentElement.classList.add('dialog-open');
            this.dialog.showModal();
          }
        })
        .catch(err => {
          console.error('Error fetching product dialog content:', err);
          document.dispatchEvent(new CustomEvent('show-notification', {
            detail: {
              type: 'error',
              message: 'Error loading product details!',
            }, bubbles: true
          }));
        });
    });
    document.body.addEventListener('product-dialog-close', () => {
      this.dialog.close();
      document.documentElement.classList.remove('dialog-open');
    });

    this.dialog.addEventListener('click', this.handleBackdropClick);

  }

  disconnectedCallback() {
    this.closeButton.removeEventListener('click', this.handleCloseButtonClick);
    this.dialog.removeEventListener('click', this.handleBackdropClick);
  }

  handleCloseButtonClick() {
    this.dialog.close();
    document.documentElement.classList.remove('dialog-open');
  }
  handleBackdropClick(event) {
    if (event.target === this.dialog) {
      this.dialog.close();
      document.documentElement.classList.remove('dialog-open');
    }
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
    this.handleSubmit = this.handleSubmit.bind(this);
    this.updateCartSection = this.updateCartSection.bind(this);
  }

  connectedCallback() {
    this.form.addEventListener('submit', this.handleSubmit);
    document.addEventListener('update-product-cart', this.updateCartSection);
  }
  disconnectedCallback() {
    this.form.removeEventListener('submit', this.handleSubmit);
    document.removeEventListener('update-product-cart', this.updateCartSection);
  }

  updateCartSection() {
    const url = `${window.location.origin}/cart?section_id=${this.sectionId}`;
    fetch(url)
      .then(res => {
        if (!res.ok) {
          throw new Error('Failed to fetch cart section');
        }
        return res.text();
      })
      .then(html => {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        const newSection = tempDiv.querySelector(`#shopify-section-${this.sectionId}`);
        const currentSection = document.querySelector(`#shopify-section-${this.sectionId}`);
        if (newSection && currentSection) {
          currentSection.replaceWith(newSection);
          document.dispatchEvent(new CustomEvent('show-notification', {
            detail: {
              type: 'success',
              message: 'Cart updated!',
            }, bubbles: true
          }));

          document.dispatchEvent(new CustomEvent('update-cart-button', { bubbles: true }));
        }
        this.formFieldset.disabled = false;
      })
      .catch(err => {
        console.error('Error fetching cart section:', err);
        this.formFieldset.disabled = false;
      });
  }

  handleSubmit(event) {
    console.log('handleSubmit(event) ');

    event.preventDefault();
    const formData = new FormData(this.form);
    this.formFieldset.disabled = true;
    fetch('/cart/update.js', {
      method: 'POST',
      body: formData,
    })
      .then(res => {
        if (!res.ok) {
          return res.json().then(data => {
            throw new Error(data.description || 'Could not update cart');
          });
        }
        return res.json();
      })
      .then(data => {
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
  }

  connectedCallback() {
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
    if (parseInt(this.quantityInput.value) === 1) {
      return;
    }
    this.quantityInput.value = parseInt(this.quantityInput.value) - 1;
  }

  handlePlusClick() {
    const maxQuantity = parseInt(this.quantityInput.getAttribute('max'));
    if (parseInt(this.quantityInput.value) === maxQuantity) {
      return;
    }
    this.quantityInput.value = parseInt(this.quantityInput.value) + 1;
  }

  handleRemoveClick(event) {
    event.preventDefault();
    if (confirm('Are you sure you want to remove this item from the cart?')) {
      const url = this.removeButton.getAttribute('href');
      fetch(url).finally(() => {
        document.dispatchEvent(new CustomEvent('update-cart-button', { bubbles: true }));
        this.removeButton.closest('cart-product-item').remove();
      });
    }
  }
}
customElements.define('cart-product-item', CartProductItem);

class ShopNotifications extends HTMLElement {
  constructor() {
    super();
    this.messages = this.querySelector('.messages');
    this.showNotification = this.showNotification.bind(this);
  }

  connectedCallback() {
    document.addEventListener('show-notification', this.showNotification);
  }

  disconnectedCallback() {
    document.removeEventListener('show-notification', this.showNotification);
  }

  showNotification(event) {
    const messageTemplate = `<message-notification class="message w-100 shadow-md relative bg-{{ color }}-300 text-{{ color }}-900 h-0 rounded-2xl transition-all duration-100 ease-in-out opacity-0 animate-fade-in [&.visible]:opacity-100">
      <div class="message-text p-4">{{ text }}</div>
      <button class="message-close absolute cursor-pointer top-2 right-2 flex items-center justify-center leading-none pb-0.75 font-bold bg-{{ color }}-400 text-{{ color }}-900 size-5 rounded-full">
      &times;
      </button></message-notification>`
    const messageHTML = messageTemplate.replace('{{ text }}', event.detail?.message).replaceAll('{{ color }}', event.detail?.type === 'success' ? 'green' : 'red');
    this.messages.insertAdjacentHTML('beforeend', messageHTML);
  }
}
customElements.define('shop-notifications', ShopNotifications);

class MessageNotification extends HTMLElement {
  constructor() {
    super();
    this.closeButton = this.querySelector('.message-close');
    this.handleCloseClick = this.handleCloseClick.bind(this);
  }

  connectedCallback() {
    setTimeout(() => {
      this.classList.add('visible');
      const contentHeight = this.scrollHeight;
      this.style.height = contentHeight + 'px';
      this.classList.add('visible');
    }, 10);
    if (this.closeButton) {
      this.closeButton.addEventListener('click', this.handleCloseClick);
    }

    setTimeout(() => {
      this.classList.remove('visible');
      this.style.height = '0';
      setTimeout(() => {
        this.remove();
      }, 300);
    }, 5000);
  }

  disconnectedCallback() {
    if (this.closeButton) {
      this.closeButton.removeEventListener('click', this.handleCloseClick);
    }
  }

  handleCloseClick() {
    this.remove();
  }
}
customElements.define('message-notification', MessageNotification);

class FilterAccordion extends HTMLElement {
  constructor() {
    super();
    this.header = this.querySelector('.filter-accordion-header');
    this.content = this.querySelector('.filter-accordion-content');
    this.handleHeaderClick = this.handleHeaderClick.bind(this);
  }

  connectedCallback() {
    if (this.header) {
      this.header.addEventListener('click', this.handleHeaderClick);
    }
  }

  disconnectedCallback() {
    if (this.header) {
      this.header.removeEventListener('click', this.handleHeaderClick);
    }
  }

  handleHeaderClick(event) {
    event.preventDefault();
    const isClosed = this.classList.contains('accordion-closed');
    if (isClosed) {
      this.classList.remove('accordion-closed');
      const contentHeight = this.content.scrollHeight;
      this.content.style.height = contentHeight + 'px';
    } else {
      this.classList.add('accordion-closed');
      this.content.style.height = '0';
    }
  }
}
customElements.define('filter-accordion', FilterAccordion);

class CollectionFilters extends HTMLElement {
  constructor() {
    super();
    this.filterAccordions = this.querySelectorAll('filter-accordion');
    this.formNotReady = false;
  }

  connectedCallback() {
    this.sectionId = this.dataset.sectionId;
    this.sortEl = this.querySelector('.sort');
    this.fieldset = this.querySelector('fieldset');
    this.filterInputs = this.querySelectorAll('input[type="checkbox"]');
    this.rangeFilterInputs = this.querySelectorAll('input[type="range"]');
    this.activeFilters = this.querySelectorAll('.active-filters button');
    this.paginationLinks = this.querySelectorAll('.pagination a');
    this.handleFilterChange = this.handleFilterChange.bind(this);
    this.handleSearchState = this.handleSearchState.bind(this);
    this.removeFilter = this.removeFilter.bind(this);
    this.generateUrl = this.generateUrl.bind(this);
    this.handlePaginationClick = this.handlePaginationClick.bind(this);
    this.handleSortChange = this.handleSortChange.bind(this);
    this.timeoutId = null;

    this.activeFilters.forEach(button => {
      button.addEventListener('click', this.removeFilter);
    });
    this.paginationLinks.forEach(link => {
      link.addEventListener('click', this.handlePaginationClick);
    });

    this.filterInputs.forEach(input => {
      input.addEventListener('change', this.handleFilterChange);
    });
    this.rangeFilterInputs.forEach(input => {
      input.addEventListener('change', this.handleFilterChange);
    });
    this.addEventListener('mousedown', () => this.handleSearchState(true));
    this.addEventListener('mouseup', () => this.handleSearchState(false));

    this.sortEl.addEventListener('change', this.handleSortChange);

  }

  handleSortChange(event) {
    const url = new URL(window.location.href);
    url.searchParams.set('sort_by', event.currentTarget.value);
    url.searchParams.set('section_id', this.sectionId);
    this.fetchProducts(url);
    url.searchParams.delete('section_id');
    window.history.replaceState({}, '', url);
  }

  removeFilter(event) {
    const button = event.currentTarget;
    const dataRemoveURL = button.dataset.removeUrl;
    if (dataRemoveURL) {
      this.fieldset.disabled = true;
      const newUrl = new URL(dataRemoveURL, window.location.origin);
      newUrl.searchParams.set('section_id', this.sectionId);
      this.fetchProducts(newUrl);
      newUrl.searchParams.delete('section_id');
      window.history.replaceState({}, '', newUrl);
    }

  }

  handlePaginationClick(event) {
    event.preventDefault();
    const link = event.currentTarget;
    const newUrl = new URL(link.href);
    newUrl.searchParams.set('section_id', this.sectionId);
    this.fetchProducts(newUrl);
    newUrl.searchParams.delete('section_id');
    window.history.replaceState({}, '', newUrl);
  }

  handleSearchState(formState) {
    this.formNotReady = formState;
  }

  disconnectedCallback() {
    this.filterInputs.forEach(input => {
      input.removeEventListener('change', this.handleFilterChange);
    });
    this.rangeFilterInputs.forEach(input => {
      input.removeEventListener('change', this.handleFilterChange);
    });
    this.activeFilters.forEach(button => {
      button.removeEventListener('click', this.removeFilter);
    });
    this.removeEventListener('mousedown', () => this.handleSearchState(true));
    this.removeEventListener('mouseup', () => this.handleSearchState(false));
    this.paginationLinks.forEach(link => {
      link.removeEventListener('click', this.handlePaginationClick);
    });
  }

  generateUrl() {
    const params = {};
    this.filterInputs.forEach(input => {
      if (input.checked) {
        if (!params[input.name]) {
          params[input.name] = [];
        }
        params[input.name].push(input.value);
      }
    });
    this.rangeFilterInputs.forEach(input => {
      if (input.value) {
        if (!params[input.name]) {
          params[input.name] = [];
        }
        params[input.name].push(input.value);
      }
    });
    const url = new URL(window.location.origin + window.location.pathname);
    url.searchParams.set('section_id', this.sectionId);
    Object.keys(params).forEach(key => {
      params[key].forEach(value => {
        url.searchParams.append(key, value);
      });
    });
    return url.toString();
  }

  handleFilterChange(event) {
    if (this.formNotReady) return;
    const url = this.generateUrl();
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    this.timeoutId = setTimeout(() => {
      if (this.formNotReady) return;
      this.fieldset.disabled = true;

      this.fetchProducts(url.toString());
    }, 1000);
  }

  fetchProducts(url) {
    this.openAccordions = this.querySelectorAll('filter-accordion.accordion-closed');
    fetch(url)
      .then(response => response.text())
      .then(html => {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        const newSection = tempDiv.querySelector(`#shopify-section-${this.sectionId}`);
        this.openAccordions.forEach(accordion => {
          const accordionId = accordion.id;

          const newAccordion = newSection.querySelector(`#${accordionId}`);
          if (newAccordion) {
            newAccordion.classList.add('accordion-closed');
            const content = newAccordion.querySelector('.filter-accordion-content');
            content.classList.add('h-0');
          }
        });
        const currentSection = document.querySelector(`#shopify-section-${this.sectionId}`);
        if (newSection && currentSection) {
          currentSection.replaceWith(newSection);
          const newUrl = new URL(url);
          newUrl.searchParams.delete('section_id');
          window.history.replaceState({}, '', newUrl);
        }
      })
      .catch(error => console.error('Error fetching filter results:', error)).finally(() => {
        this.fieldset.disabled = false;
      });
  }

}
customElements.define('collection-filters', CollectionFilters);

class cartButton extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.cartButton = this.querySelector('.cart-button');
    document.addEventListener('update-cart-button', () => {
      if (!this.cartButton) return;
      fetch(`${window.Shopify.routes.root}cart.js`)
        .then(response => response.json())
        .then(cart => {
          this.cartButton.querySelector('sup') && (this.cartButton.querySelector('sup').innerHTML = cart.item_count);
          this.cartButton.classList.add('animate-cart');
          setTimeout(() => {
            this.cartButton.classList.remove('animate-cart');
          }, 500);
        })
        .catch(error => {
          console.error('Error fetching cart:', error);
        });

    });
  }

  updateButton(itemCount) {
    if (this.cartButton) {
      this.cartButton.classList.add('animate-cart');
      setTimeout(() => {
        this.cartButton.classList.remove('animate-cart');
      }, 300);
    }
  }

  disconnectedCallback() {
    document.removeEventListener('update-cart-button', this.updateButton);
  }

}
customElements.define('cart-button', cartButton);

class DiscountForm extends HTMLElement {
  constructor() {
    super();
    this.form = this.querySelector('form');
    this.input = this.form.querySelector('input[name="discount"]');
    this.errorMessage = this.querySelector('.error-message');
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  connectedCallback() {
    console.log('connectedCallback');

    this.form.addEventListener('submit', this.handleSubmit);
  }

  disconnectedCallback() {
    console.log('disconnectedCallback');

    this.form.removeEventListener('submit', this.handleSubmit);
  }

  handleSubmit(event) {
    event.preventDefault();
    const discountCode = this.input.value.trim();
    if (discountCode === '') {
      return;
    }
    fetch('/cart/update.js', {
      method: 'POST',
      body: JSON.stringify({
        discount: discountCode
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(res => {
        if (!res.ok) {
          return res.json().then(data => {
            throw new Error(data.description || 'Could not apply discount');
          });
        }
        return res.json();
      })
      .then(data => {
        document.dispatchEvent(new CustomEvent('show-notification', {
          detail: {
            type: 'success',
            message: 'Discount applied!',
          }, bubbles: true
        }));
        document.dispatchEvent(new CustomEvent('update-product-cart', {
          bubbles: true
        }));

      })
      .catch(err => {
        console.error('Error applying discount:', err);
        document.dispatchEvent(new CustomEvent('show-notification', {
          detail: {
            type: 'error',
            message: 'Could not apply discount',
          }, bubbles: true
        }));
      });
  }
}
customElements.define('discount-form', DiscountForm);

// document.addEventListener('DOMContentLoaded', () => {
//   document.addEventListener('click', (event) => {
//     // display notification
//     document.dispatchEvent(new CustomEvent('show-notification', {
//       detail: {
//         type: 'success',
//         message: 'This is a notification!',
//       }, bubbles: true
//     }));
//     // document.dispatchEvent(new CustomEvent('update-cart-button', { bubbles: true }));
//   });
// });