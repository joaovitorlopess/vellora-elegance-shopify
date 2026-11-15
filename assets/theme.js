/* ==========================================================================
   VELLORA ELEGANCE — theme.js
   JavaScript puro (sem dependências), compatível com o editor de temas
   (eventos shopify:section:load / select / block:select).
   ========================================================================== */
(function () {
  'use strict';

  var theme = window.theme || {};
  var strings = theme.strings || {};

  /* Utilitários ----------------------------------------------------------- */
  function qs(sel, ctx) { return (ctx || document).querySelector(sel); }
  function qsa(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

  function formatMoney(cents) {
    var format = theme.moneyFormat || 'R$ {{amount_with_comma_separator}}';
    var value = (Number(cents) / 100).toFixed(2);
    var parts = value.split('.');
    var integer = parts[0];
    var decimals = parts[1];
    var withDots = integer.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    var withCommas = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return format
      .replace(/\{\{\s*amount_with_comma_separator\s*\}\}/, withDots + ',' + decimals)
      .replace(/\{\{\s*amount_no_decimals_with_comma_separator\s*\}\}/, withDots)
      .replace(/\{\{\s*amount_no_decimals\s*\}\}/, withCommas)
      .replace(/\{\{\s*amount\s*\}\}/, withCommas + '.' + decimals);
  }

  var toastTimer;
  function toast(message, isError) {
    var el = qs('[data-toast]');
    if (!el) return;
    el.hidden = false;
    el.classList.toggle('toast--error', !!isError);
    el.innerHTML = '';
    var span = document.createElement('span');
    span.textContent = message;
    el.appendChild(span);
    if (!isError && theme.routes && theme.routes.cart) {
      var link = document.createElement('a');
      link.href = theme.routes.cart;
      link.textContent = strings.viewCart || 'Ver sacola';
      el.appendChild(link);
    }
    requestAnimationFrame(function () { el.classList.add('is-visible'); });
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      el.classList.remove('is-visible');
      setTimeout(function () { el.hidden = true; }, 400);
    }, 4000);
  }

  /* Altura do cabeçalho como variável CSS -------------------------------- */
  function setHeaderHeight() {
    var header = qs('[data-header]');
    if (!header) return;
    document.documentElement.style.setProperty('--header-height', header.offsetHeight + 'px');
  }

  /* Cabeçalho: transparente -> sólido ao rolar -------------------------- */
  function initHeader() {
    var header = qs('[data-header]');
    if (!header) return;
    var transparent = header.dataset.transparent === 'true';

    function onScroll() {
      var scrolled = window.scrollY > 40;
      header.classList.toggle('is-scrolled', scrolled);
      if (transparent) header.classList.toggle('is-solid', scrolled);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // Acessibilidade do mega menu por teclado
    qsa('.site-nav__item.has-mega', header).forEach(function (item) {
      var link = qs('.site-nav__link', item);
      item.addEventListener('mouseenter', function () { link.setAttribute('aria-expanded', 'true'); });
      item.addEventListener('mouseleave', function () { link.setAttribute('aria-expanded', 'false'); });
      item.addEventListener('focusin', function () { link.setAttribute('aria-expanded', 'true'); });
      item.addEventListener('focusout', function (e) {
        if (!item.contains(e.relatedTarget)) link.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* Drawer (menu mobile) ------------------------------------------------- */
  function initDrawers() {
    document.addEventListener('click', function (e) {
      var opener = e.target.closest('[data-drawer-open]');
      if (opener) {
        var drawer = document.getElementById(opener.getAttribute('data-drawer-open'));
        if (drawer) openDrawer(drawer, opener);
        return;
      }
      var closer = e.target.closest('[data-drawer-close]');
      if (closer) {
        var parent = closer.closest('[data-drawer]');
        if (parent) closeDrawer(parent);
      }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      qsa('[data-drawer].is-open').forEach(closeDrawer);
      closeSearch();
    });
  }
  function openDrawer(drawer, opener) {
    drawer._opener = opener;
    drawer.classList.add('is-open');
    drawer.setAttribute('aria-hidden', 'false');
    if (opener) opener.setAttribute('aria-expanded', 'true');
    document.body.classList.add('is-locked');
    var panel = qs('.drawer__panel', drawer);
    if (panel) setTimeout(function () { panel.focus(); }, 50);
  }
  function closeDrawer(drawer) {
    drawer.classList.remove('is-open');
    drawer.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('is-locked');
    if (drawer._opener) {
      drawer._opener.setAttribute('aria-expanded', 'false');
      drawer._opener.focus();
    }
  }

  /* Busca em tela cheia -------------------------------------------------- */
  function initSearch() {
    document.addEventListener('click', function (e) {
      if (e.target.closest('[data-search-open]')) {
        var overlay = qs('[data-search]');
        if (!overlay) return;
        overlay.classList.add('is-open');
        overlay.setAttribute('aria-hidden', 'false');
        setTimeout(function () { var input = qs('input[type="search"]', overlay); if (input) input.focus(); }, 300);
      }
      if (e.target.closest('[data-search-close]')) closeSearch();
    });
  }
  function closeSearch() {
    var overlay = qs('[data-search]');
    if (!overlay || !overlay.classList.contains('is-open')) return;
    overlay.classList.remove('is-open');
    overlay.setAttribute('aria-hidden', 'true');
  }

  /* Barra de anúncios rotativa ------------------------------------------ */
  function initAnnouncement(root) {
    qsa('[data-announcement]', root).forEach(function (bar) {
      if (bar._timer) clearInterval(bar._timer);
      var items = qsa('[data-announcement-item]', bar);
      if (items.length < 2) return;
      var index = 0;
      var interval = parseInt(bar.dataset.interval, 10) || 5000;
      bar._timer = setInterval(function () {
        items[index].classList.remove('is-active');
        index = (index + 1) % items.length;
        items[index].classList.add('is-active');
      }, interval);
    });
  }

  /* Slideshow do banner principal ---------------------------------------- */
  function Slideshow(el) {
    this.el = el;
    this.slides = qsa('[data-slide]', el);
    this.dots = qsa('[data-slide-to]', el);
    this.track = qs('[data-slides]', el);
    this.toggle = qs('[data-slide-toggle]', el);
    this.index = 0;
    this.speed = parseInt(el.dataset.speed, 10) || 6000;
    this.reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.autoplay = el.dataset.autoplay === 'true' && this.slides.length > 1;
    this.holds = { hover: false, focus: false, hidden: false, user: this.reduced };
    el.style.setProperty('--slide-duration', this.speed + 'ms');
    if (this.slides.length < 2) return;

    var self = this;
    this.dots.forEach(function (dot) {
      dot.addEventListener('click', function () { self.goTo(parseInt(dot.dataset.slideTo, 10), true); });
    });
    var prev = qs('[data-slide-prev]', el);
    var next = qs('[data-slide-next]', el);
    if (prev) prev.addEventListener('click', function () { self.goTo(self.index - 1, true); });
    if (next) next.addEventListener('click', function () { self.goTo(self.index + 1, true); });

    // Swipe no celular
    var startX = null;
    el.addEventListener('touchstart', function (e) { startX = e.touches[0].clientX; }, { passive: true });
    el.addEventListener('touchend', function (e) {
      if (startX === null) return;
      var diff = e.changedTouches[0].clientX - startX;
      if (Math.abs(diff) > 50) self.goTo(self.index + (diff < 0 ? 1 : -1), true);
      startX = null;
    });

    if (!this.autoplay) return;

    // Pausas independentes: mouse, foco, aba oculta e pausa explícita
    el.addEventListener('mouseenter', function () { self.hold('hover', true); });
    el.addEventListener('mouseleave', function () { self.hold('hover', false); });
    el.addEventListener('focusin', function () { self.hold('focus', true); });
    el.addEventListener('focusout', function (e) { if (!el.contains(e.relatedTarget)) self.hold('focus', false); });
    this._onVisibility = function () { self.hold('hidden', document.hidden); };
    document.addEventListener('visibilitychange', this._onVisibility);
    if (this.toggle) {
      this.toggle.addEventListener('click', function () { self.hold('user', !self.holds.user); });
    }

    el.classList.add('is-autoplay');
    this.sync();
  }
  Slideshow.prototype.isHeld = function () {
    var h = this.holds;
    return h.hover || h.focus || h.hidden || h.user;
  };
  Slideshow.prototype.hold = function (key, value) {
    this.holds[key] = value;
    this.sync();
  };
  Slideshow.prototype.sync = function () {
    var stopped = this.holds.user;
    this.el.classList.toggle('is-stopped', stopped);
    if (this.toggle) {
      this.toggle.setAttribute('aria-label', stopped ? this.el.dataset.labelPlay : this.el.dataset.labelPause);
    }
    if (this.track) this.track.setAttribute('aria-live', this.isHeld() ? 'polite' : 'off');
    if (this.isHeld()) this.pause();
    else this.play();
  };
  Slideshow.prototype.goTo = function (i, user) {
    var total = this.slides.length;
    var nextIndex = (i + total) % total;
    if (nextIndex === this.index) return;
    var current = this.slides[this.index];
    current.classList.remove('is-active');
    current.setAttribute('aria-hidden', 'true');
    current.setAttribute('inert', '');
    if (this.dots[this.index]) {
      this.dots[this.index].classList.remove('is-active');
      this.dots[this.index].removeAttribute('aria-current');
    }
    this.index = nextIndex;
    var incoming = this.slides[this.index];
    incoming.classList.add('is-active');
    incoming.removeAttribute('aria-hidden');
    incoming.removeAttribute('inert');
    if (this.dots[this.index]) {
      this.dots[this.index].classList.add('is-active');
      this.dots[this.index].setAttribute('aria-current', 'true');
    }
    if (user) this.restart();
  };
  Slideshow.prototype.play = function () {
    if (!this.autoplay || this.isHeld()) return;
    var self = this;
    this.el.classList.remove('is-paused');
    clearTimeout(this.timer);
    this.timer = setTimeout(function tick() {
      self.goTo(self.index + 1);
      self.timer = setTimeout(tick, self.speed);
    }, this.remaining || this.speed);
    this.startedAt = Date.now();
    this.remaining = null;
  };
  Slideshow.prototype.pause = function () {
    if (!this.autoplay) return;
    clearTimeout(this.timer);
    if (!this.el.classList.contains('is-paused')) {
      var elapsed = Date.now() - (this.startedAt || Date.now());
      this.remaining = Math.max(this.speed - (elapsed % this.speed), 500);
    }
    this.el.classList.add('is-paused');
  };
  Slideshow.prototype.restart = function () {
    if (!this.autoplay) return;
    this.remaining = null;
    this.el.classList.remove('is-paused');
    if (this.isHeld()) {
      this.el.classList.add('is-paused');
      return;
    }
    this.play();
  };
  Slideshow.prototype.destroy = function () {
    clearTimeout(this.timer);
    if (this._onVisibility) document.removeEventListener('visibilitychange', this._onVisibility);
  };

  function initSlideshows(root) {
    qsa('[data-slideshow]', root).forEach(function (el) {
      if (el._slideshow) el._slideshow.destroy();
      el._slideshow = new Slideshow(el);
    });
  }

  /* Revelação suave ao rolar --------------------------------------------- */
  var revealObserver = 'IntersectionObserver' in window
    ? new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            revealObserver.unobserve(entry.target);
          }
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 })
    : null;

  function initReveal(root) {
    qsa('[data-reveal]', root).forEach(function (el) {
      if (!revealObserver || window.Shopify && window.Shopify.designMode) {
        el.classList.add('is-visible');
      } else {
        revealObserver.observe(el);
      }
    });
  }

  /* Carrinho AJAX -------------------------------------------------------- */
  function updateCartCount() {
    return fetch(theme.routes.root + 'cart.js', { headers: { Accept: 'application/json' } })
      .then(function (r) { return r.json(); })
      .then(function (cart) {
        qsa('[data-cart-count]').forEach(function (el) {
          el.textContent = cart.item_count;
          el.classList.toggle('is-empty', cart.item_count === 0);
          el.classList.remove('is-bumped');
          void el.offsetWidth;
          el.classList.add('is-bumped');
        });
        return cart;
      });
  }

  function initAjaxCart() {
    document.addEventListener('submit', function (e) {
      var form = e.target.closest('form[data-ajax-add]');
      if (!form) return;
      e.preventDefault();

      var button = qs('[type="submit"]', form);
      if (button) { button.setAttribute('aria-busy', 'true'); button.disabled = true; }

      fetch(theme.routes.cartAdd + '.js', {
        method: 'POST',
        headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
        body: new FormData(form)
      })
        .then(function (r) { return r.json().then(function (data) { return { ok: r.ok, data: data }; }); })
        .then(function (res) {
          if (!res.ok) throw new Error(res.data.description || res.data.message || strings.error);
          toast(strings.addedToCart || 'Adicionado à sacola');
          document.dispatchEvent(new CustomEvent('cart:added', { detail: res.data }));
          return updateCartCount();
        })
        .catch(function (err) { toast(err.message || strings.error, true); })
        .finally(function () {
          if (button) { button.removeAttribute('aria-busy'); button.disabled = false; }
        });
    });
  }

  /* Seletor de variantes (página de produto) ----------------------------- */
  function initProduct(root) {
    qsa('[data-product]', root).forEach(function (section) {
      var jsonEl = qs('[data-product-json]', section);
      if (!jsonEl) return;
      var product;
      try { product = JSON.parse(jsonEl.textContent); } catch (err) { return; }

      var form = qs('form[data-ajax-add]', section);
      var idInput = qs('[data-variant-id]', section);
      var addBtn = qs('[data-add-button]', section);
      var fieldsets = qsa('.option', section);

      function selectedOptions() {
        return fieldsets.map(function (fs) {
          var checked = qs('input:checked', fs);
          return checked ? checked.value : null;
        });
      }

      function updatePriceBlock(variant) {
        var price = qs('[data-price]', section);
        var compare = qs('[data-compare-price]', section);
        var installments = qs('[data-installments]', section);
        var pix = qs('[data-pix]', section);
        var priceWrap = price ? price.closest('.price') : null;
        var onSale = variant.compare_at_price && variant.compare_at_price > variant.price;

        if (price) price.textContent = formatMoney(variant.price);
        if (compare) {
          compare.hidden = !onSale;
          compare.textContent = onSale ? formatMoney(variant.compare_at_price) : '';
        }
        if (priceWrap) priceWrap.classList.toggle('price--on-sale', !!onSale);

        if (installments && theme.installments > 1) {
          var amountEl = qs('[data-amount]', installments);
          var countEl = qs('[data-count]', installments);
          var count = theme.installments;
          if (theme.installmentsMin > 0) count = Math.min(count, Math.floor(variant.price / theme.installmentsMin));
          installments.hidden = count < 2;
          if (count >= 2) {
            if (countEl) countEl.textContent = count;
            if (amountEl) amountEl.textContent = formatMoney(Math.floor(variant.price / count));
          }
        }
        if (pix && theme.pixDiscount > 0) {
          var pixAmount = qs('[data-amount]', pix);
          if (pixAmount) pixAmount.textContent = formatMoney(Math.floor(variant.price * (100 - theme.pixDiscount) / 100));
        }
      }

      function onChange() {
        var options = selectedOptions();
        fieldsets.forEach(function (fs, i) {
          var label = qs('[data-option-value]', fs);
          if (label) label.textContent = options[i] || '';
        });

        var variant = product.variants.find(function (v) {
          return v.options.every(function (opt, i) { return opt === options[i]; });
        });

        if (!variant) {
          if (addBtn) { addBtn.disabled = true; addBtn.textContent = strings.unavailable; }
          return;
        }

        if (idInput) idInput.value = variant.id;
        if (addBtn) {
          addBtn.disabled = !variant.available;
          addBtn.textContent = variant.available ? strings.addToCart : strings.soldOut;
        }
        updatePriceBlock(variant);

        // Atualiza a URL sem recarregar
        var url = new URL(window.location.href);
        url.searchParams.set('variant', variant.id);
        window.history.replaceState({}, '', url.toString());

        // Leva a imagem da variante para o topo da galeria
        if (variant.featured_media) {
          var mediaItem = qs('[data-media-id="' + variant.featured_media.id + '"]', section);
          if (mediaItem) {
            var list = mediaItem.parentElement;
            list.insertBefore(mediaItem, list.firstElementChild);
            if (window.innerWidth < 750) list.scrollTo({ left: 0, behavior: 'smooth' });
          }
        }
      }

      fieldsets.forEach(function (fs) { fs.addEventListener('change', onChange); });

      // Quantidade
      var qty = qs('[data-qty]', section);
      if (qty) {
        var input = qs('input', qty);
        qs('[data-qty-minus]', qty).addEventListener('click', function () { input.value = Math.max(1, (parseInt(input.value, 10) || 1) - 1); });
        qs('[data-qty-plus]', qty).addEventListener('click', function () { input.value = (parseInt(input.value, 10) || 1) + 1; });
      }

    });
  }

  /* Ordenação da coleção ------------------------------------------------- */
  function initSort() {
    document.addEventListener('change', function (e) {
      if (!e.target.matches('[data-sort-select]')) return;
      var url = new URL(window.location.href);
      url.searchParams.set('sort_by', e.target.value);
      url.searchParams.delete('page');
      window.location.href = url.toString();
    });
  }

  /* Rodapé: acordeões fechados no celular -------------------------------- */
  function initFooterAccordions(root) {
    if (!window.matchMedia('(max-width: 749px)').matches) return;
    qsa('.site-footer__details[open]', root).forEach(function (d) { d.removeAttribute('open'); });
  }

  /* Carrossel horizontal com setas (faixa de produtos) ------------------- */
  function initScrollers(root) {
    qsa('[data-scroller]', root).forEach(function (el) {
      var track = qs('[data-scroller-track]', el);
      var prev = qs('[data-scroller-prev]', el);
      var next = qs('[data-scroller-next]', el);
      if (!track) return;
      function update() {
        var max = track.scrollWidth - track.clientWidth - 2;
        if (prev) prev.disabled = track.scrollLeft <= 2;
        if (next) next.disabled = track.scrollLeft >= max;
      }
      function step(dir) {
        track.scrollBy({ left: dir * track.clientWidth * 0.8, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
      }
      if (prev) prev.addEventListener('click', function () { step(-1); });
      if (next) next.addEventListener('click', function () { step(1); });
      track.addEventListener('scroll', update, { passive: true });
      window.addEventListener('resize', update);
      update();
    });
  }

  /* Inicialização -------------------------------------------------------- */
  function initSections(root) {
    initAnnouncement(root);
    initSlideshows(root);
    initScrollers(root);
    initReveal(root);
    initProduct(root);
    initFooterAccordions(root);
  }

  document.addEventListener('DOMContentLoaded', function () {
    setHeaderHeight();
    initHeader();
    initDrawers();
    initSearch();
    initAjaxCart();
    initSort();
    initSections(document);
    window.addEventListener('resize', setHeaderHeight);
  });

  /* Suporte ao editor de temas da Shopify -------------------------------- */
  document.addEventListener('shopify:section:load', function (e) {
    initSections(e.target);
    if (e.target.querySelector('[data-header]')) { setHeaderHeight(); initHeader(); }
  });
  document.addEventListener('shopify:block:select', function (e) {
    var slideshowEl = e.target.closest('[data-slideshow]');
    if (slideshowEl && slideshowEl._slideshow) {
      var slides = slideshowEl._slideshow.slides;
      var idx = slides.indexOf(e.target);
      if (idx > -1) { slideshowEl._slideshow.pause(); slideshowEl._slideshow.goTo(idx); }
    }
  });
  document.addEventListener('shopify:block:deselect', function (e) {
    var slideshowEl = e.target.closest('[data-slideshow]');
    if (slideshowEl && slideshowEl._slideshow) slideshowEl._slideshow.play();
  });
})();
