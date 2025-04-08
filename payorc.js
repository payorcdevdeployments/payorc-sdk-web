const n = class n {
  constructor() {
    this.apiKey = "", this.merchantSecret = "", this.environment = "test", this.baseUrl = "https://nodeserver.payorc.com/api/v1", this.mountElement = null, this.iframe = null, this.modal = null, this.eventListeners = [], this.config = null, this.defaultModalStyles = {
      width: "90%",
      maxWidth: "600px",
      height: "auto",
      maxHeight: "90vh",
      backgroundColor: "#ffffff",
      borderRadius: "8px",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
      padding: "0",
      margin: "20px",
      zIndex: "9999",
      overlayColor: "rgba(0, 0, 0, 0.5)",
      mobileWidth: "95%",
      mobileHeight: "95vh",
      tabletWidth: "90%",
      tabletHeight: "90vh"
    }, window.addEventListener("message", this.handlePostMessage.bind(this));
  }
  static getInstance() {
    return n.instance || (n.instance = new n()), n.instance;
  }
  init(e) {
    return this.apiKey = e.apiKey, this.merchantSecret = e.merchantSecret, this.environment = e.environment || "test", this.config = e, e.modalStyles && (this.defaultModalStyles = {
      ...this.defaultModalStyles,
      ...e.modalStyles
    }), e.onSuccess && this.on("success", e.onSuccess), e.onFailure && this.on("failure", e.onFailure), e.onCancel && this.on("cancel", e.onCancel), this;
  }
  mount(e) {
    return this.mountElement = document.getElementById(e), this.mountElement || console.error(`Element with ID "${e}" not found`), this;
  }
  getBrowserInfo() {
    const e = navigator.platform || "unknown", t = navigator.userAgent;
    let i = "unknown", a = "unknown";
    if (t.indexOf("Chrome") !== -1) {
      i = "Chrome";
      const s = t.match(/Chrome\/(\d+\.\d+)/);
      s && (a = s[1]);
    } else if (t.indexOf("Firefox") !== -1) {
      i = "Firefox";
      const s = t.match(/Firefox\/(\d+\.\d+)/);
      s && (a = s[1]);
    } else if (t.indexOf("Safari") !== -1) {
      i = "Safari";
      const s = t.match(/Version\/(\d+\.\d+)/);
      s && (a = s[1]);
    } else if (t.indexOf("Edge") !== -1 || t.indexOf("Edg") !== -1) {
      i = "Edge";
      const s = t.match(/Edge?\/(\d+\.\d+)/);
      s && (a = s[1]);
    } else if (t.indexOf("Opera") !== -1 || t.indexOf("OPR") !== -1) {
      i = "Opera";
      const s = t.match(/OPR\/(\d+\.\d+)/);
      s && (a = s[1]);
    }
    return { platform: e, browser: i, browserVersion: a };
  }
  async createPayment(e, t = "modal") {
    if (!this.apiKey || !this.merchantSecret)
      throw new Error("SDK not initialized. Call init() first.");
    try {
      const i = { data: e }, { platform: a, browser: s, browserVersion: o } = this.getBrowserInfo(), r = await (await fetch(`${this.baseUrl}/sdk/orders/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "merchant-key": this.apiKey,
          "merchant-secret": this.merchantSecret,
          platform: a,
          browser: s,
          "browser-version": o
        },
        body: JSON.stringify(i)
      })).json();
      if (r.status !== "SUCCESS")
        return this.triggerEvent("failure", r), null;
      switch (t) {
        case "hosted":
          window.location.href = r.payment_link;
          break;
        case "iframe":
          this.loadIframe(r.iframe_link);
          break;
        case "modal":
          this.loadModal(r.iframe_link);
          break;
      }
      return this.triggerEvent("processing", r), r;
    } catch (i) {
      return console.error("Error creating payment:", i), this.triggerEvent("failure", { error: i }), null;
    }
  }
  on(e, t) {
    return this.eventListeners.push({ type: e, callback: t }), this;
  }
  off(e, t) {
    return this.eventListeners = this.eventListeners.filter(
      (i) => !(i.type === e && i.callback === t)
    ), this;
  }
  close() {
    this.modal && (document.body.removeChild(this.modal), this.modal = null), this.iframe && this.mountElement && (this.mountElement.removeChild(this.iframe), this.iframe = null);
  }
  handlePostMessage(e) {
    try {
      const t = typeof e.data == "string" ? JSON.parse(e.data) : e.data;
      t.status === "SUCCESS" ? (this.triggerEvent("success", t), this.close()) : t.status === "CANCELLED" ? (this.triggerEvent("cancel", t), this.close()) : t.status === "FAILED" && (this.triggerEvent("failure", t), this.close());
    } catch (t) {
      console.error("Error processing message:", t);
    }
  }
  triggerEvent(e, t) {
    this.eventListeners.filter((i) => i.type === e).forEach((i) => {
      try {
        i.callback(t);
      } catch (a) {
        console.error(`Error in ${e} event listener:`, a);
      }
    });
  }
  loadIframe(e) {
    if (!this.mountElement) {
      console.error("Mount element not found");
      return;
    }
    this.mountElement.innerHTML = "", this.iframe = document.createElement("iframe"), this.iframe.src = e, this.iframe.style.width = "100%", this.iframe.style.height = "600px", this.iframe.style.border = "none", this.iframe.style.borderRadius = "8px", this.iframe.setAttribute("allowpaymentrequest", "true"), this.iframe.setAttribute("allow", "payment"), this.mountElement.appendChild(this.iframe);
  }
  loadModal(e) {
    this.modal = document.createElement("div"), Object.assign(this.modal.style, {
      position: "fixed",
      top: "0",
      left: "0",
      width: "100%",
      height: "100%",
      backgroundColor: this.defaultModalStyles.overlayColor,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: this.defaultModalStyles.zIndex
    });
    const t = document.createElement("div");
    Object.assign(t.style, {
      width: this.defaultModalStyles.width,
      maxWidth: this.defaultModalStyles.maxWidth,
      height: this.defaultModalStyles.height,
      maxHeight: this.defaultModalStyles.maxHeight,
      backgroundColor: this.defaultModalStyles.backgroundColor,
      borderRadius: this.defaultModalStyles.borderRadius,
      boxShadow: this.defaultModalStyles.boxShadow,
      padding: this.defaultModalStyles.padding,
      margin: this.defaultModalStyles.margin,
      position: "relative",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column"
    });
    const i = document.createElement("div");
    Object.assign(i.style, {
      flex: "1",
      minHeight: "400px",
      overflow: "hidden",
      width: "100%",
      height: "100%"
    }), this.iframe = document.createElement("iframe"), Object.assign(this.iframe.style, {
      width: "100%",
      height: "100%",
      border: "none",
      display: "block"
    }), this.iframe.src = e, this.iframe.setAttribute("allowpaymentrequest", "true"), this.iframe.setAttribute("allow", "payment");
    const a = `
      @media (max-width: 768px) {
        .payorc-modal-content {
          width: ${this.defaultModalStyles.mobileWidth};
          height: ${this.defaultModalStyles.mobileHeight};
          margin: 10px;
        }
      }
      @media (min-width: 769px) and (max-width: 1024px) {
        .payorc-modal-content {
          width: ${this.defaultModalStyles.tabletWidth};
          height: ${this.defaultModalStyles.tabletHeight};
        }
      }
    `, s = document.createElement("style");
    s.textContent = a, document.head.appendChild(s), t.classList.add("payorc-modal-content"), i.appendChild(this.iframe), t.appendChild(i), this.modal.appendChild(t), this.modal.addEventListener("click", (o) => {
      o.target === this.modal && (o.preventDefault(), o.stopPropagation());
    }), document.body.appendChild(this.modal);
  }
};
n.instance = null;
let l = n;
const h = l.getInstance();
export {
  h as default
};
//# sourceMappingURL=payorc.js.map
