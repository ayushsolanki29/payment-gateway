(function (globalScope, factory) {
  const exported = factory();

  if (typeof module === "object" && module.exports) {
    module.exports = exported;
  }

  if (globalScope) {
    globalScope.createUPIPaymentGateway = exported.createUPIPaymentGateway;
    globalScope.UPIPaymentGateway = exported.UPIPaymentGateway;
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  const STYLE_ID = "upi-payment-gateway-styles";
  const ROOT_ATTR = "data-upi-payment-gateway-root";

  const DEFAULTS = {
    amount: 1000,
    currency: "INR",
    merchantName: "Example Merchant",
    merchantUpiId: "merchant@upi",
    themeColor: "#005bf2",
    theme: "light",
    size: "md",
    ctaLabel: "Proceed to Payment",
    appButtonLabel: "Open UPI App",
    paymentTimeout: 180,
    minAmount: 100,
    qrFallbackSrc: "images/qr.gif",
    successRate: 0.7,
    storagePrefix: "upi-payment-gateway",
    onSuccess: null,
    onFailure: null,
    onClose: null,
  };

  const STYLES = `
    .upi-pg-overlay { position: fixed; inset: 0; display: none; align-items: center; justify-content: center; padding: 20px; background: rgba(3, 7, 18, 0.42); backdrop-filter: blur(10px); z-index: 9999; font-family: "Segoe UI", Arial, sans-serif; }
    .upi-pg-overlay * { box-sizing: border-box; }
    .upi-pg-modal { --upi-pg-surface: linear-gradient(180deg, color-mix(in srgb, var(--upi-pg-theme, #0f172a) 92%, white 8%), color-mix(in srgb, var(--upi-pg-theme, #0f172a) 80%, black 20%)); --upi-pg-text: #f8fafc; --upi-pg-muted: rgba(248,250,252,0.76); --upi-pg-border: rgba(255,255,255,0.12); --upi-pg-panel: rgba(255,255,255,0.08); --upi-pg-input-bg: rgba(255,255,255,0.96); --upi-pg-input-text: #0f172a; --upi-pg-overlay-accent: rgba(255,255,255,0.16); width: min(100%, 420px); max-height: calc(100vh - 40px); border: 1px solid rgba(255,255,255,0.14); border-radius: 24px; padding: 22px; color: var(--upi-pg-text); background: var(--upi-pg-surface); box-shadow: 0 24px 60px rgba(2, 6, 23, 0.32); position: relative; overflow: auto; scrollbar-width: none; }
    .upi-pg-modal::-webkit-scrollbar { display: none; }
    .upi-pg-modal[data-theme="light"] { --upi-pg-surface: linear-gradient(180deg, #ffffff, #f8fbff); --upi-pg-text: #0f172a; --upi-pg-muted: rgba(15,23,42,0.64); --upi-pg-border: rgba(15,23,42,0.08); --upi-pg-panel: rgba(15,23,42,0.03); --upi-pg-input-bg: #ffffff; --upi-pg-input-text: #0f172a; --upi-pg-overlay-accent: rgba(15,92,255,0.08); border-color: rgba(15,23,42,0.08); box-shadow: 0 30px 70px rgba(15, 23, 42, 0.14); }
    .upi-pg-modal[data-theme="dark"] { --upi-pg-surface: linear-gradient(180deg, color-mix(in srgb, var(--upi-pg-theme, #0f172a) 92%, white 8%), color-mix(in srgb, var(--upi-pg-theme, #0f172a) 80%, black 20%)); --upi-pg-text: #f8fafc; --upi-pg-muted: rgba(248,250,252,0.76); --upi-pg-border: rgba(255,255,255,0.12); --upi-pg-panel: rgba(255,255,255,0.08); --upi-pg-input-bg: rgba(255,255,255,0.96); --upi-pg-input-text: #0f172a; --upi-pg-overlay-accent: rgba(255,255,255,0.16); }
    .upi-pg-modal[data-size="sm"] { width: min(100%, 360px); padding: 18px; border-radius: 22px; }
    .upi-pg-modal[data-size="lg"] { width: min(100%, 460px); padding: 24px; border-radius: 28px; }
    .upi-pg-modal::before { content: ""; position: absolute; inset: -30% auto auto -10%; width: 220px; height: 220px; background: radial-gradient(circle, rgba(255,255,255,0.16), transparent 68%); pointer-events: none; }
    .upi-pg-modal::after { content: ""; position: absolute; right: -40px; bottom: -40px; width: 180px; height: 180px; border-radius: 50%; background: radial-gradient(circle, var(--upi-pg-overlay-accent), transparent 70%); pointer-events: none; }
    .upi-pg-header { position: relative; text-align: left; margin-bottom: 18px; z-index: 1; padding-right: 48px; }
    .upi-pg-eyebrow { display: inline-flex; align-items: center; gap: 8px; margin-bottom: 10px; padding: 6px 10px; border: 1px solid var(--upi-pg-border); border-radius: 999px; background: var(--upi-pg-panel); color: var(--upi-pg-text); font-size: 10px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; }
    .upi-pg-title { margin: 0; font-size: 22px; line-height: 1.15; font-weight: 700; letter-spacing: -0.03em; max-width: 100%; }
    .upi-pg-subtitle { margin: 6px 0 0; color: var(--upi-pg-muted); font-size: 13px; line-height: 1.45; max-width: 100%; }
    .upi-pg-close { position: absolute; top: 0; right: 0; width: 34px; height: 34px; border: 1px solid var(--upi-pg-border); border-radius: 999px; background: var(--upi-pg-panel); color: var(--upi-pg-text); cursor: pointer; font-size: 22px; line-height: 1; display: grid; place-items: center; }
    .upi-pg-close:hover { background: color-mix(in srgb, var(--upi-pg-panel) 70%, var(--upi-pg-theme, #0f172a) 30%); }
    .upi-pg-step { display: none; position: relative; z-index: 1; }
    .upi-pg-step.active { display: block; }
    .upi-pg-amount { margin: 18px 0 16px; padding: 16px; border: 1px solid var(--upi-pg-border); border-radius: 18px; background: var(--upi-pg-panel); text-align: left; }
    .upi-pg-amount-label { display: block; margin-bottom: 6px; color: var(--upi-pg-muted); font-size: 11px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; }
    .upi-pg-amount-value { margin: 0; font-size: 30px; line-height: 1; font-weight: 800; letter-spacing: -0.05em; }
    .upi-pg-message { display: none; margin-bottom: 12px; border-radius: 14px; padding: 10px 12px; font-size: 13px; line-height: 1.45; border: 1px solid transparent; }
    .upi-pg-message.show { display: block; }
    .upi-pg-message.error { background: rgba(239, 68, 68, 0.14); border-color: rgba(248, 113, 113, 0.24); color: #fee2e2; }
    .upi-pg-message.success { background: rgba(34, 197, 94, 0.14); border-color: rgba(74, 222, 128, 0.24); color: #dcfce7; }
    .upi-pg-field { margin-bottom: 12px; }
    .upi-pg-label { display: block; margin-bottom: 6px; color: color-mix(in srgb, var(--upi-pg-text) 92%, transparent); font-size: 12px; font-weight: 600; }
    .upi-pg-input { width: 100%; border: 1px solid var(--upi-pg-border); border-radius: 14px; padding: 13px 14px; color: var(--upi-pg-input-text); background: var(--upi-pg-input-bg); font-size: 15px; outline: none; transition: box-shadow .2s ease, transform .2s ease, border-color .2s ease; }
    .upi-pg-input::placeholder { color: #667085; }
    .upi-pg-input:focus { border-color: rgba(255,255,255,0.88); box-shadow: 0 0 0 4px rgba(255,255,255,0.18); transform: translateY(-1px); }
    .upi-pg-button { display: inline-flex; width: 100%; align-items: center; justify-content: center; gap: 8px; border: 0; border-radius: 14px; padding: 13px 16px; font-weight: 700; font-size: 15px; color: #ffffff; background: linear-gradient(180deg, #22c55e, #16a34a); box-shadow: 0 10px 24px rgba(22, 163, 74, 0.24); cursor: pointer; transition: transform .2s ease, box-shadow .2s ease, opacity .2s ease; }
    .upi-pg-button:hover { transform: translateY(-1px); box-shadow: 0 18px 34px rgba(22, 163, 74, 0.34); }
    .upi-pg-button:disabled { cursor: not-allowed; opacity: 0.7; box-shadow: none; transform: none; }
    .upi-pg-security { display: flex; align-items: center; gap: 8px; justify-content: center; margin-top: 14px; color: var(--upi-pg-muted); font-size: 11px; }
    .upi-pg-security::before { content: ""; width: 8px; height: 8px; border-radius: 50%; background: #22c55e; box-shadow: 0 0 0 6px rgba(34,197,94,0.14); }
    .upi-pg-header-meta { margin-bottom: 14px; }
    .upi-pg-header-meta h3 { margin: 0 0 4px; font-size: 20px; line-height: 1.2; letter-spacing: -0.03em; }
    .upi-pg-header-meta p { margin: 0; color: var(--upi-pg-muted); font-size: 13px; }
    .upi-pg-tabs { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-bottom: 14px; padding: 4px; border: 1px solid var(--upi-pg-border); border-radius: 14px; background: var(--upi-pg-panel); }
    .upi-pg-tab { border: 0; border-radius: 10px; padding: 10px 12px; background: transparent; color: var(--upi-pg-muted); font-weight: 700; cursor: pointer; transition: background .2s ease, color .2s ease; }
    .upi-pg-tab.active { color: var(--upi-pg-text); background: color-mix(in srgb, var(--upi-pg-panel) 85%, var(--upi-pg-theme, #0f172a) 15%); }
    .upi-pg-pane { display: none; }
    .upi-pg-pane.active { display: block; }
    .upi-pg-qr { text-align: center; padding: 14px; border: 1px solid var(--upi-pg-border); border-radius: 18px; background: var(--upi-pg-panel); }
    .upi-pg-qr img { width: 148px; height: 148px; padding: 8px; background: #ffffff; border-radius: 16px; box-shadow: 0 8px 22px rgba(15,23,42,0.14); }
    .upi-pg-qr p, .upi-pg-note { margin: 10px 0 0; font-size: 13px; color: var(--upi-pg-muted); line-height: 1.45; }
    .upi-pg-card { margin-bottom: 14px; border: 1px solid var(--upi-pg-border); border-radius: 18px; padding: 14px; background: var(--upi-pg-panel); }
    .upi-pg-card p { margin: 0 0 12px; font-size: 13px; color: var(--upi-pg-muted); }
    .upi-pg-row { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; font-size: 13px; color: var(--upi-pg-muted); }
    .upi-pg-row:last-child { margin-bottom: 0; }
    .upi-pg-row strong { margin-left: auto; text-align: right; color: var(--upi-pg-text); word-break: break-all; }
    .upi-pg-copy { border: 1px solid var(--upi-pg-border); border-radius: 999px; padding: 5px 10px; background: var(--upi-pg-panel); color: var(--upi-pg-text); cursor: pointer; font-size: 11px; font-weight: 700; }
    .upi-pg-copy:hover { background: color-mix(in srgb, var(--upi-pg-panel) 75%, var(--upi-pg-theme, #0f172a) 25%); }
    .upi-pg-note { text-align: center; }
    @media (max-width: 480px) { .upi-pg-overlay { padding: 10px; align-items: flex-start; } .upi-pg-modal { width: 100%; max-height: calc(100vh - 20px); margin-top: 0; padding: 16px; border-radius: 20px; } .upi-pg-title { font-size: 20px; } .upi-pg-subtitle { font-size: 12px; } .upi-pg-amount-value { font-size: 26px; } .upi-pg-qr img { width: 132px; height: 132px; } }
  `;

  class UPIPaymentGateway {
    constructor(options) {
      this.options = { ...DEFAULTS, ...(options || {}) };
      this.timer = null;
      this.transaction = null;
      this.storageKeys = {
        phone: `${this.options.storagePrefix}:phone`,
        transaction: `${this.options.storagePrefix}:transaction`,
        upiId: `${this.options.storagePrefix}:upi-id`,
      };

      this.ensureBrowser();
      this.ensureStyles();
      this.mount();
      this.cacheElements();
      this.prefillSavedValues();
      this.bindEvents();
      this.update(this.options);
    }

    ensureBrowser() {
      if (typeof document === "undefined" || typeof window === "undefined") {
        throw new Error("UPI payment gateway must be initialized in a browser environment.");
      }
    }

    ensureStyles() {
      if (document.getElementById(STYLE_ID)) return;
      const style = document.createElement("style");
      style.id = STYLE_ID;
      style.textContent = STYLES;
      document.head.appendChild(style);
    }

    mount() {
      const root = document.createElement("div");
      root.setAttribute(ROOT_ATTR, "true");
      root.innerHTML = this.getMarkup();
      document.body.appendChild(root);
      this.root = root;
    }

    getMarkup() {
      return `
        <div class="upi-pg-overlay" aria-hidden="true">
          <div class="upi-pg-modal" role="dialog" aria-modal="true" data-theme="${this.escapeHtml(this.normalizeTheme(this.options.theme))}" data-size="${this.escapeHtml(this.normalizeSize(this.options.size))}">
            <div class="upi-pg-header">
              <div class="upi-pg-eyebrow">Secure Checkout</div>
              <h2 class="upi-pg-title">${this.escapeHtml(this.options.merchantName)}</h2>
              <p class="upi-pg-subtitle">Fast, lightweight UPI payment flow designed for modern apps.</p>
              <button type="button" class="upi-pg-close" aria-label="Close payment modal">&times;</button>
            </div>
            <section class="upi-pg-step upi-pg-step-contact active">
              <div class="upi-pg-amount">
                <span class="upi-pg-amount-label">Total Amount</span>
                <p class="upi-pg-amount-value">${this.formatCurrency(this.options.amount)}</p>
              </div>
              <div class="upi-pg-message"></div>
              <div class="upi-pg-field">
                <label class="upi-pg-label" for="upi-pg-upi-id">UPI ID</label>
                <input class="upi-pg-input" id="upi-pg-upi-id" type="text" placeholder="yourname@upi">
              </div>
              <div class="upi-pg-field">
                <label class="upi-pg-label" for="upi-pg-phone">Mobile Number</label>
                <input class="upi-pg-input" id="upi-pg-phone" type="tel" inputmode="numeric" maxlength="10" placeholder="9876543210">
              </div>
              <button type="button" class="upi-pg-button upi-pg-proceed">${this.escapeHtml(this.options.ctaLabel)}</button>
              <div class="upi-pg-security">100% Secure Payments</div>
            </section>
            <section class="upi-pg-step upi-pg-step-payment">
              <div class="upi-pg-header-meta">
                <h3>Complete Your Payment</h3>
                <p>Time remaining: <span class="upi-pg-timer">${this.options.paymentTimeout}</span>s</p>
              </div>
              <div class="upi-pg-tabs">
                <button type="button" class="upi-pg-tab active" data-tab="qr">UPI QR</button>
                <button type="button" class="upi-pg-tab" data-tab="app">UPI App</button>
              </div>
              <div class="upi-pg-pane active" data-pane="qr">
                <div class="upi-pg-qr">
                  <img class="upi-pg-qr-image" src="${this.escapeHtml(this.options.qrFallbackSrc)}" alt="UPI QR Code">
                  <p>Scan this QR code with any UPI app</p>
                </div>
              </div>
              <div class="upi-pg-pane" data-pane="app">
                <div class="upi-pg-card">
                  <p>Pay directly via your UPI app</p>
                  <div class="upi-pg-row">
                    <span>UPI ID:</span>
                    <strong class="upi-pg-merchant-upi">${this.escapeHtml(this.options.merchantUpiId)}</strong>
                    <button type="button" class="upi-pg-copy">Copy</button>
                  </div>
                  <div class="upi-pg-row">
                    <span>Amount:</span>
                    <strong class="upi-pg-display-amount">${this.formatCurrency(this.options.amount)}</strong>
                  </div>
                </div>
                <button type="button" class="upi-pg-button upi-pg-open-app">${this.escapeHtml(this.options.appButtonLabel)}</button>
              </div>
              <p class="upi-pg-note">Do not close this window until payment is complete</p>
            </section>
          </div>
        </div>
      `;
    }

    cacheElements() {
      this.elements = {
        amountValue: this.root.querySelector(".upi-pg-amount-value"),
        closeButton: this.root.querySelector(".upi-pg-close"),
        contactStep: this.root.querySelector(".upi-pg-step-contact"),
        copyButton: this.root.querySelector(".upi-pg-copy"),
        displayAmount: this.root.querySelector(".upi-pg-display-amount"),
        message: this.root.querySelector(".upi-pg-message"),
        merchantUpi: this.root.querySelector(".upi-pg-merchant-upi"),
        modal: this.root.querySelector(".upi-pg-overlay"),
        modalCard: this.root.querySelector(".upi-pg-modal"),
        openAppButton: this.root.querySelector(".upi-pg-open-app"),
        panes: this.root.querySelectorAll(".upi-pg-pane"),
        paymentStep: this.root.querySelector(".upi-pg-step-payment"),
        phoneInput: this.root.querySelector("#upi-pg-phone"),
        proceedButton: this.root.querySelector(".upi-pg-proceed"),
        qrImage: this.root.querySelector(".upi-pg-qr-image"),
        tabs: this.root.querySelectorAll(".upi-pg-tab"),
        timer: this.root.querySelector(".upi-pg-timer"),
        title: this.root.querySelector(".upi-pg-title"),
        upiInput: this.root.querySelector("#upi-pg-upi-id"),
      };
    }

    bindEvents() {
      this.handleOverlayClick = (event) => {
        if (event.target === this.elements.modal) this.close();
      };
      this.handleEscape = (event) => {
        if (event.key === "Escape" && this.isOpen()) this.close();
      };

      this.elements.modal.addEventListener("click", this.handleOverlayClick);
      this.elements.closeButton.addEventListener("click", () => this.close());
      this.elements.proceedButton.addEventListener("click", () => this.startPayment());
      this.elements.openAppButton.addEventListener("click", () => this.openUpiApp());
      this.elements.copyButton.addEventListener("click", () => this.copyMerchantUpiId());
      document.addEventListener("keydown", this.handleEscape);

      this.elements.tabs.forEach((tab) => {
        tab.addEventListener("click", () => this.activateTab(tab.dataset.tab));
      });
    }

    prefillSavedValues() {
      this.elements.upiInput.value = this.readStorage(this.storageKeys.upiId) || "";
      this.elements.phoneInput.value = this.readStorage(this.storageKeys.phone) || "";
    }

    open(overrides) {
      if (overrides) this.update(overrides);
      this.hideMessage();
      this.elements.modal.style.display = "flex";
      this.elements.modal.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    }

    close() {
      this.clearTimer();
      this.elements.modal.style.display = "none";
      this.elements.modal.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
      this.hideMessage();
      this.resetFlow();
      if (typeof this.options.onClose === "function") this.options.onClose(this.transaction);
    }

    destroy() {
      this.clearTimer();
      document.removeEventListener("keydown", this.handleEscape);
      this.elements.modal.removeEventListener("click", this.handleOverlayClick);
      if (this.root && this.root.parentNode) this.root.parentNode.removeChild(this.root);
    }

    update(nextOptions) {
      this.options = { ...this.options, ...(nextOptions || {}) };
      this.storageKeys = {
        phone: `${this.options.storagePrefix}:phone`,
        transaction: `${this.options.storagePrefix}:transaction`,
        upiId: `${this.options.storagePrefix}:upi-id`,
      };
      this.elements.modalCard.style.setProperty("--upi-pg-theme", this.options.themeColor);
      this.elements.modalCard.dataset.theme = this.normalizeTheme(this.options.theme);
      this.elements.modalCard.dataset.size = this.normalizeSize(this.options.size);
      this.elements.title.textContent = this.options.merchantName;
      this.elements.amountValue.textContent = this.formatCurrency(this.options.amount);
      this.elements.displayAmount.textContent = this.formatCurrency(this.options.amount);
      this.elements.merchantUpi.textContent = this.options.merchantUpiId;
      this.elements.timer.textContent = String(this.options.paymentTimeout);
      this.elements.proceedButton.textContent = this.options.ctaLabel;
      this.elements.openAppButton.textContent = this.options.appButtonLabel;
    }

    isOpen() {
      return this.elements.modal.style.display === "flex";
    }

    resetFlow() {
      this.elements.contactStep.classList.add("active");
      this.elements.paymentStep.classList.remove("active");
      this.loading(false);
      this.activateTab("qr");
    }

    activateTab(tabName) {
      this.elements.tabs.forEach((tab) => {
        tab.classList.toggle("active", tab.dataset.tab === tabName);
      });
      this.elements.panes.forEach((pane) => {
        pane.classList.toggle("active", pane.dataset.pane === tabName);
      });
    }

    startPayment() {
      const upiId = this.elements.upiInput.value.trim();
      const phone = this.elements.phoneInput.value.trim();

      if (!this.validateInputs(upiId, phone)) return;

      this.loading(true);
      this.transaction = {
        amount: this.options.amount,
        createdAt: Date.now(),
        id: this.generateTransactionId(),
        phone,
        status: "processing",
        upiId,
      };

      this.writeStorage(this.storageKeys.upiId, upiId);
      this.writeStorage(this.storageKeys.phone, phone);
      this.writeStorage(this.storageKeys.transaction, JSON.stringify(this.transaction));
      this.showPaymentStep();
    }

    validateInputs(upiId, phone) {
      if (this.options.amount < this.options.minAmount) {
        this.showMessage("Amount must be at least Rs 1.00.", "error");
        return false;
      }
      if (!upiId || !phone) {
        this.showMessage("Please enter both UPI ID and phone number.", "error");
        return false;
      }
      if (!/^[\w.-]+@[\w.-]+$/.test(upiId)) {
        this.showMessage("Invalid UPI ID format.", "error");
        return false;
      }
      if (!/^[0-9]{10}$/.test(phone)) {
        this.showMessage("Phone number must be 10 digits.", "error");
        return false;
      }
      return true;
    }

    showPaymentStep() {
      const upiUrl = this.createUpiUrl(this.transaction.id);
      this.elements.contactStep.classList.remove("active");
      this.elements.paymentStep.classList.add("active");
      this.elements.qrImage.src = this.createQrImageUrl(upiUrl);
      this.elements.qrImage.onerror = () => {
        this.elements.qrImage.onerror = null;
        this.elements.qrImage.src = this.options.qrFallbackSrc;
      };
      this.loading(false);
      this.startTimer();
    }

    startTimer() {
      this.clearTimer();
      let seconds = this.options.paymentTimeout;
      this.elements.timer.textContent = String(seconds);
      this.timer = window.setInterval(() => {
        seconds -= 1;
        this.elements.timer.textContent = String(seconds);
        if (seconds <= 0) {
          this.clearTimer();
          this.finishPayment();
        }
      }, 1000);
    }

    clearTimer() {
      if (!this.timer) return;
      window.clearInterval(this.timer);
      this.timer = null;
    }

    finishPayment() {
      const paymentSucceeded = Math.random() <= this.options.successRate;
      if (!this.transaction) {
        this.showMessage("Transaction expired. Please try again.", "error");
        this.resetFlow();
        return;
      }
      this.transaction.status = paymentSucceeded ? "completed" : "failed";
      this.writeStorage(this.storageKeys.transaction, JSON.stringify(this.transaction));
      if (paymentSucceeded) {
        this.showMessage("Payment successful!", "success");
        if (typeof this.options.onSuccess === "function") this.options.onSuccess({ ...this.transaction });
        return;
      }
      this.showMessage("Payment not completed. Please try again.", "error");
      if (typeof this.options.onFailure === "function") this.options.onFailure({ ...this.transaction });
      this.resetFlow();
    }

    openUpiApp() {
      if (!this.transaction) {
        this.showMessage("Start a payment before opening your UPI app.", "error");
        return;
      }
      window.location.href = this.createUpiUrl(this.transaction.id);
    }

    async copyMerchantUpiId() {
      try {
        await navigator.clipboard.writeText(this.options.merchantUpiId);
        this.showMessage("UPI ID copied to clipboard.", "success");
      } catch (_error) {
        this.showMessage("Clipboard access was blocked.", "error");
      }
    }

    createUpiUrl(transactionId) {
      const params = new URLSearchParams({
        am: (this.options.amount / 100).toFixed(2),
        cu: this.options.currency,
        pa: this.options.merchantUpiId,
        pn: this.options.merchantName,
        tn: transactionId,
      });
      return `upi://pay?${params.toString()}`;
    }

    createQrImageUrl(upiUrl) {
      return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(upiUrl)}`;
    }

    generateTransactionId() {
      return `TXN${Date.now()}${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    }

    loading(state) {
      this.elements.proceedButton.disabled = state;
      this.elements.proceedButton.textContent = state
        ? "Processing..."
        : this.options.ctaLabel;
    }

    showMessage(message, type) {
      this.elements.message.textContent = message;
      this.elements.message.className = `upi-pg-message ${type} show`;
    }

    hideMessage() {
      this.elements.message.textContent = "";
      this.elements.message.className = "upi-pg-message";
    }

    formatCurrency(amountInPaise) {
      return `Rs ${(amountInPaise / 100).toFixed(2)}`;
    }

    normalizeTheme(value) {
      return value === "dark" ? "dark" : "light";
    }

    normalizeSize(value) {
      if (value === "sm" || value === "lg") {
        return value;
      }

      return "md";
    }

    writeStorage(key, value) {
      try {
        window.localStorage.setItem(key, value);
      } catch (_error) {}
    }

    readStorage(key) {
      try {
        return window.localStorage.getItem(key);
      } catch (_error) {
        return null;
      }
    }

    escapeHtml(value) {
      return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
    }
  }

  function createUPIPaymentGateway(options) {
    return new UPIPaymentGateway(options);
  }

  return {
    UPIPaymentGateway,
    createUPIPaymentGateway,
  };
});
