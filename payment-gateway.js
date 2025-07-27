class UPIPaymentGateway {
  constructor(options = {}) {
    this.config = {
      paymentTimeout: 180,
      apiBase: "payment-api.php",
      defaults: {
        amount: 1000, // ₹10.00 (1000 paise)
        currency: "INR",
        merchantName: "Example Merchant",
        merchantUpiId: "merchant@upi",
        themeColor: "#005bf2",
      },
    };

    this.options = $.extend({}, this.config.defaults, options);
    this.transactionId = null;
    this.timer = null;

    this.cacheElements();
    this.bindEvents();
  }
  cacheElements() {
    this.$els = {
      modal: $("#paymentModal"),
      trigger: $("#paymentTrigger"),
      closeBtn: $(".close-modal"),
      amount: $("#paymentAmount"),
      upiInput: $("#upiId"),
      phoneInput: $("#phoneNumber"),
      proceedBtn: $("#proceedToPay"),
      qrCode: $("#upiQrCode"),
      merchantUpi: $("#merchantUpiId"),
      amountFinal: $("#displayAmount"),
      timer: $("#paymentTimer"),
      upiBtn: $("#openUpiApp"),
      messageBox: $("#messageBox"),
      messageText: $("#messageText"),
      contactStep: $("#contactStep"),
      paymentStep: $("#paymentStep"),
    };
  }

  bindEvents() {
    this.$els.trigger.on("click", () => this.openModal());
    this.$els.closeBtn.on("click", () => this.closeModal());
    this.$els.proceedBtn.on("click", () => this.verifyAndProceed());
    this.$els.upiBtn.on("click", () => this.openUpiApp());

    // Tab switching
    $(".option-tab").on("click", (e) => {
      const tab = $(e.currentTarget);
      $(".option-tab, .option-content").removeClass("active");
      tab.addClass("active");
      $(`#${tab.data("tab")}`).addClass("active");
    });

    // Copy UPI ID
    $(".copy-btn").on("click", (e) => {
      const target = $(e.currentTarget).data("target");
      const text = $(`#${target}`).text();
      navigator.clipboard.writeText(text);
      this.showMessage("UPI ID copied to clipboard!", "success");
    });
  }

  openModal() {
    this.$els.amount.text(`₹${this.options.amount}`);
    this.$els.modal.css("display", "flex");
    $("body").css("overflow", "hidden");
  }

  closeModal() {
    this.$els.modal.hide();
    $("body").css("overflow", "");
    this.resetFlow();
    clearInterval(this.timer);
  }

  resetFlow() {
    this.$els.contactStep.addClass("active");
    this.$els.paymentStep.removeClass("active");
    this.$els.proceedBtn
      .prop("disabled", false)
      .html(
        '<span>Proceed to Payment</span><i class="fas fa-arrow-right"></i>'
      );
  }

  async verifyAndProceed() {
    const upiId = this.$els.upiInput.val().trim();
    const phone = this.$els.phoneInput.val().trim();

    if (!this.validateInputs(upiId, phone)) return;

    this.loading(true);

    try {
      // 1. Initialize transaction
      const init = await this.apiCall("init_transaction", {
        amount: this.options.amount,
      });

      if (!init.success) throw new Error(init.message || "Transaction failed");
      this.transactionId = init.transactionId;

      // 2. Verify contact details
      const verify = await this.apiCall("verify_contact", {
        upiId,
        phone,
        transactionId: this.transactionId,
      });

      if (!verify.success)
        throw new Error(verify.message || "Verification failed");

      // 3. Process payment
      const payment = await this.apiCall("process_payment", {
        transactionId: this.transactionId,
        amount: this.options.amount,
        upiId,
        phone,
      });

      if (!payment.success)
        throw new Error(payment.message || "Payment failed");

      this.showPaymentStep(payment.upiUrl, payment.merchantUpiId);
    } catch (err) {
      this.showMessage(err.message, "error");
      this.loading(false);
    }
  }

  validateInputs(upiId, phone) {
    if (!upiId || !phone) {
      this.showMessage("Please enter both UPI ID and Phone Number", "error");
      return false;
    }
    if (!/^[\w.-]+@[\w.-]+$/.test(upiId)) {
      this.showMessage("Invalid UPI ID format", "error");
      return false;
    }
    if (!/^[0-9]{10}$/.test(phone)) {
      this.showMessage("Phone number must be 10 digits", "error");
      return false;
    }
    return true;
  }

  showPaymentStep(upiUrl, merchantUpiId) {
    this.$els.contactStep.removeClass("active");
    this.$els.paymentStep.addClass("active");

    this.$els.qrCode.attr(
      "src",
      `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
        upiUrl
      )}`
    );
    this.$els.merchantUpi.text(merchantUpiId || this.options.merchantUpiId);
    this.$els.amountFinal.text(`₹${this.options.amount}`);

    this.startTimer();
  }

  startTimer() {
    let seconds = this.config.paymentTimeout;
    this.$els.timer.text(seconds);

    this.timer = setInterval(() => {
      seconds--;
      this.$els.timer.text(seconds);
      if (seconds <= 0) {
        clearInterval(this.timer);
        this.checkStatus();
      }
    }, 1000);
  }

  async checkStatus() {
    try {
      const res = await this.apiCall("check_status", {
        transactionId: this.transactionId,
      });

      if (res.paymentSuccess) {
        this.showMessage("Payment successful!", "success");
        setTimeout(() => {
          window.location.href = res.redirectUrl || "thank-you.html";
        }, 2000);
      } else {
        this.showMessage("Payment not completed. Please try again.", "error");
        this.resetFlow();
      }
    } catch (err) {
      this.showMessage("Error verifying payment", "error");
      this.resetFlow();
    }
  }

  openUpiApp() {
    const url = `upi://pay?pa=${this.options.merchantUpiId}&pn=${this.options.merchantName}&am=${this.options.amount}&tn=${this.transactionId}&cu=INR`;
    window.location.href = url;
    setTimeout(() => {
      this.showMessage(
        "If UPI app didn't open, please copy the UPI ID",
        "warning"
      );
    }, 1000);
  }

  loading(show) {
    this.$els.proceedBtn
      .prop("disabled", show)
      .html(
        show
          ? '<i class="fas fa-spinner fa-spin"></i> Processing...'
          : '<span>Proceed to Payment</span><i class="fas fa-arrow-right"></i>'
      );
  }

  showMessage(msg, type) {
    this.$els.messageText.text(msg);
    this.$els.messageBox
      .removeClass("error success show")
      .addClass(`${type} show`);

    setTimeout(() => {
      this.$els.messageBox.removeClass("show");
    }, 5000);
  }

  async apiCall(action, data) {
    try {
      const res = await $.ajax({
        url: `${this.config.apiBase}?action=${action}`,
        method: "POST",
        dataType: "json",
        data: JSON.stringify(data),
        contentType: "application/json",
      });
      return res;
    } catch (err) {
      console.error("API Error:", err);
      throw new Error("Network error. Please try again.");
    }
  }
}

// Initialize when DOM is ready
$(document).ready(() => {
  const paymentGateway = new UPIPaymentGateway({
    amount: 1000, // ₹10.00 (1000 paise)
    merchantName: "Example Merchant",
    merchantUpiId: "merchant@upi",
  });
});
