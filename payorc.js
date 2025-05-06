const n = class n {
  constructor() {
    this.apiKey = "", this.merchantSecret = "", this.environment = "test", this.baseUrl = "https://nodeserver.payorc.com/api/v1", this.modal = null, this.iframe = null, this.eventListeners = [], this.config = null, this.isValidated = !1, window.addEventListener("message", this.handlePostMessage.bind(this));
  }
  static getInstance() {
    return n.instance || (n.instance = new n()), n.instance;
  }
  async init(t) {
    this.apiKey = t.apiKey, this.merchantSecret = t.merchantSecret, this.environment = t.environment || "test", this.config = t, t.onSuccess && this.on("success", t.onSuccess), t.onFailure && this.on("failure", t.onFailure), t.onCancel && this.on("cancel", t.onCancel);
    try {
      const s = await (await fetch(`${this.baseUrl}/check/keys-secret`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          merchant_key: this.apiKey,
          merchant_secret: this.merchantSecret,
          env: this.environment
        })
      })).json();
      if (s.status === "success")
        return this.isValidated = !0, this;
      throw new Error(s.message || "Invalid merchant key or secret");
    } catch (e) {
      throw this.isValidated = !1, e;
    }
  }
  getBrowserInfo() {
    const t = navigator.platform || "unknown", e = navigator.userAgent;
    let s = "unknown", r = "unknown";
    if (e.indexOf("Chrome") !== -1) {
      s = "Chrome";
      const i = e.match(/Chrome\/(\d+\.\d+)/);
      i && (r = i[1]);
    } else if (e.indexOf("Firefox") !== -1) {
      s = "Firefox";
      const i = e.match(/Firefox\/(\d+\.\d+)/);
      i && (r = i[1]);
    } else if (e.indexOf("Safari") !== -1) {
      s = "Safari";
      const i = e.match(/Version\/(\d+\.\d+)/);
      i && (r = i[1]);
    } else if (e.indexOf("Edge") !== -1 || e.indexOf("Edg") !== -1) {
      s = "Edge";
      const i = e.match(/Edge?\/(\d+\.\d+)/);
      i && (r = i[1]);
    } else if (e.indexOf("Opera") !== -1 || e.indexOf("OPR") !== -1) {
      s = "Opera";
      const i = e.match(/OPR\/(\d+\.\d+)/);
      i && (r = i[1]);
    }
    return { platform: t, browser: s, browserVersion: r };
  }
  async createPayment(t) {
    if (!this.isValidated)
      throw new Error("SDK validation failed. Please check your merchant key and secret.");
    if (!this.apiKey || !this.merchantSecret)
      throw new Error("SDK not initialized. Call init() first.");
    try {
      const e = { data: t }, { platform: s, browser: r, browserVersion: i } = this.getBrowserInfo(), a = await (await fetch(`${this.baseUrl}/sdk/orders/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "merchant-key": this.apiKey,
          "merchant-secret": this.merchantSecret,
          platform: s,
          browser: r,
          "browser-version": i
        },
        body: JSON.stringify(e)
      })).json();
      return a.status !== "SUCCESS" ? (this.triggerEvent("failure", a), null) : (this.loadModal(a.iframe_link), this.triggerEvent("processing", a), a);
    } catch (e) {
      return console.error("Error creating payment:", e), this.triggerEvent("failure", { error: e }), null;
    }
  }
  on(t, e) {
    return this.eventListeners.push({ type: t, callback: e }), this;
  }
  off(t, e) {
    return this.eventListeners = this.eventListeners.filter(
      (s) => !(s.type === t && s.callback === e)
    ), this;
  }
  close() {
    this.modal && (document.body.removeChild(this.modal), this.modal = null);
  }
  handlePostMessage(t) {
    try {
      const e = typeof t.data == "string" ? JSON.parse(t.data) : t.data;
      e.status === "SUCCESS" ? (this.triggerEvent("success", e), this.close()) : e.status === "CANCELLED" ? (this.triggerEvent("cancel", e), this.close()) : e.status === "FAILED" && (this.triggerEvent("failure", e), this.close());
    } catch (e) {
      console.error("Error processing message:", e);
    }
  }
  triggerEvent(t, e) {
    this.eventListeners.filter((s) => s.type === t).forEach((s) => {
      try {
        s.callback(e);
      } catch (r) {
        console.error(`Error in ${t} event listener:`, r);
      }
    });
  }
  loadModal(t) {
    this.modal = document.createElement("div"), Object.assign(this.modal.style, {
      position: "fixed",
      top: "0",
      left: "0",
      width: "100%",
      height: "100%",
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: "9999"
    });
    const e = document.createElement("div");
    Object.assign(e.style, {
      width: "90%",
      maxWidth: "600px",
      height: "90vh",
      maxHeight: "800px",
      backgroundColor: "#ffffff",
      borderRadius: "8px",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
      position: "relative",
      overflow: "hidden"
    });
    const s = document.createElement("div");
    Object.assign(s.style, {
      position: "absolute",
      top: "0",
      left: "0",
      width: "100%",
      height: "100%",
      backgroundColor: "#ffffff",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: "1"
    });
    const r = document.createElement("img");
    r.src = "https://checkout.payorc.com/checkout/public/images/spinner-loader.gif", r.alt = "Loading...", Object.assign(r.style, {
      width: "50px",
      height: "50px"
    }), s.appendChild(r), e.appendChild(s), this.iframe = document.createElement("iframe"), Object.assign(this.iframe.style, {
      width: "100%",
      height: "100%",
      border: "none",
      opacity: "0",
      transition: "opacity 0.3s ease"
    }), this.iframe.src = t, this.iframe.setAttribute("allowpaymentrequest", "true"), this.iframe.setAttribute("allow", "payment"), e.appendChild(this.iframe), this.modal.appendChild(e), setTimeout(() => {
      s.parentNode && s.parentNode.removeChild(s), this.iframe && (this.iframe.style.opacity = "1");
    }, 3e3), this.modal.addEventListener("click", (o) => {
      o.target === this.modal && (o.preventDefault(), o.stopPropagation());
    });
    const i = document.createElement("style");
    i.textContent = `
      @media (max-width: 768px) {
        .payorc-modal-content {
          width: 95%;
          height: 95vh;
          margin: 10px;
        }
      }
    `, document.head.appendChild(i), e.classList.add("payorc-modal-content"), document.body.appendChild(this.modal);
  }
};
n.instance = null;
let c = n;
const h = c.getInstance();
export {
  h as default
};
//# sourceMappingURL=payorc.js.map
