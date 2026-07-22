/**
 * Checkout / payment API client.
 *
 * Browser → Worker BFF (`/_drswift/checkout/*`) → CMS when you wire the backends.
 *
 * Expected contract (add these on the server later):
 *   POST /_drswift/checkout/orders
 *   POST /_drswift/checkout/payments
 *   GET  /_drswift/checkout/payments/:paymentId
 *
 * Local UI testing without backends:
 *   localStorage.setItem("drswift.payment.stub", "1")
 */
(function (global) {
  const BASE = "/_drswift/checkout";
  const STUB_KEY = "drswift.payment.stub";
  const ORDER_KEY = "drswift.checkout.order.v1";
  const PAYMENT_KEY = "drswift.checkout.paymentSession.v1";

  function stubEnabled() {
    try {
      return localStorage.getItem(STUB_KEY) === "1";
    } catch {
      return false;
    }
  }

  function readJson(key) {
    try {
      return JSON.parse(sessionStorage.getItem(key) || "null");
    } catch {
      return null;
    }
  }

  function writeJson(key, value) {
    sessionStorage.setItem(key, JSON.stringify(value));
  }

  function clearJson(key) {
    sessionStorage.removeItem(key);
  }

  async function post(path, body) {
    const res = await fetch(`${BASE}${path}`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      credentials: "same-origin",
      cache: "no-store",
      body: JSON.stringify(body || {}),
    });
    let data = null;
    try {
      data = await res.json();
    } catch {
      data = null;
    }
    if (!res.ok) {
      const message =
        (data && (data.message || data.error)) ||
        (res.status === 404 || res.status === 502
          ? "Secure payment is temporarily unavailable. Please try again shortly or contact the care team."
          : `Payment request failed (${res.status}).`);
      const err = new Error(message);
      err.status = res.status;
      err.data = data;
      throw err;
    }
    return data || {};
  }

  async function get(path) {
    const res = await fetch(`${BASE}${path}`, {
      method: "GET",
      headers: { Accept: "application/json" },
      credentials: "same-origin",
      cache: "no-store",
    });
    let data = null;
    try {
      data = await res.json();
    } catch {
      data = null;
    }
    if (!res.ok) {
      const message =
        (data && (data.message || data.error)) ||
        (res.status === 404 || res.status === 502
          ? "Secure payment is temporarily unavailable. Please try again shortly or contact the care team."
          : `Could not check payment (${res.status}).`);
      const err = new Error(message);
      err.status = res.status;
      err.data = data;
      throw err;
    }
    return data || {};
  }

  function stubOrder(payload) {
    const order = {
      ok: true,
      stub: true,
      orderId: `ORD-STUB-${Date.now().toString(36).toUpperCase()}`,
      amount: Number(payload.amount || 0),
      currency: "INR",
      status: "pending_payment",
    };
    writeJson(ORDER_KEY, order);
    return order;
  }

  function stubPayment(payload) {
    const method = String(payload.method || "upi");
    const payment = {
      ok: true,
      stub: true,
      paymentId: `PAY-STUB-${Date.now().toString(36).toUpperCase()}`,
      orderId: payload.orderId,
      method,
      status: method === "upi" ? "pending" : "requires_action",
      amount: Number(payload.amount || 0),
      currency: "INR",
      upiId: method === "upi" ? "drswift@okaxis" : null,
      upiIntent:
        method === "upi"
          ? `upi://pay?pa=drswift@okaxis&pn=DrSwift&am=${Number(payload.amount || 0)}&cu=INR`
          : null,
      qrDataUrl: null,
      checkoutUrl: null,
      reference: null,
    };
    writeJson(PAYMENT_KEY, payment);
    return payment;
  }

  async function createOrder(payload) {
    if (stubEnabled()) return stubOrder(payload);
    try {
      const data = await post("/orders", payload);
      const order = {
        ok: true,
        stub: false,
        orderId: data.orderId || data.id,
        amount: Number(data.amount ?? payload.amount ?? 0),
        currency: data.currency || "INR",
        status: data.status || "pending_payment",
        raw: data,
      };
      if (!order.orderId) throw new Error("Order API did not return an orderId.");
      writeJson(ORDER_KEY, order);
      return order;
    } catch (err) {
      if (err.status === 404 || err.status === 502 || err.status === 405) {
        const wrapped = new Error(
          "We could not prepare secure payment. Please try again shortly or contact the care team."
        );
        wrapped.status = err.status;
        wrapped.cause = err;
        throw wrapped;
      }
      throw err;
    }
  }

  async function createPayment(payload) {
    if (stubEnabled()) return stubPayment(payload);
    try {
      const data = await post("/payments", payload);
      const payment = {
        ok: true,
        stub: false,
        paymentId: data.paymentId || data.id,
        orderId: data.orderId || payload.orderId,
        method: data.method || payload.method,
        status: data.status || "pending",
        amount: Number(data.amount ?? payload.amount ?? 0),
        currency: data.currency || "INR",
        checkoutUrl: data.checkoutUrl || data.paymentUrl || null,
        upiIntent: data.upiIntent || data.deepLink || null,
        upiId: data.upiId || null,
        qrDataUrl: data.qrDataUrl || data.qrImageUrl || null,
        reference: data.reference || null,
        raw: data,
      };
      if (!payment.paymentId) throw new Error("Payment API did not return a paymentId.");
      writeJson(PAYMENT_KEY, payment);
      return payment;
    } catch (err) {
      if (err.status === 404 || err.status === 502 || err.status === 405) {
        const wrapped = new Error(
          "We could not start secure payment. Please try again shortly or contact the care team."
        );
        wrapped.status = err.status;
        wrapped.cause = err;
        throw wrapped;
      }
      throw err;
    }
  }

  async function getPaymentStatus(paymentId) {
    if (!paymentId) throw new Error("Missing paymentId.");
    if (stubEnabled()) {
      const current = readJson(PAYMENT_KEY) || {};
      const paid = {
        ok: true,
        stub: true,
        paymentId,
        orderId: current.orderId || null,
        status: "paid",
        reference: current.reference || `DS-${Date.now().toString(36).toUpperCase()}`,
        method: current.method || "Online",
        amount: Number(current.amount || 0),
        paidAt: new Date().toISOString(),
      };
      writeJson(PAYMENT_KEY, { ...current, ...paid });
      return paid;
    }
    const data = await get(`/payments/${encodeURIComponent(paymentId)}`);
    return {
      ok: true,
      stub: false,
      paymentId: data.paymentId || paymentId,
      orderId: data.orderId || null,
      status: data.status || "pending",
      reference: data.reference || data.bookingId || null,
      method: data.method || null,
      amount: Number(data.amount || 0),
      paidAt: data.paidAt || null,
      raw: data,
    };
  }

  function getStoredOrder() {
    return readJson(ORDER_KEY);
  }

  function getStoredPayment() {
    return readJson(PAYMENT_KEY);
  }

  function clearCheckoutSessions() {
    clearJson(ORDER_KEY);
    clearJson(PAYMENT_KEY);
  }

  global.DrSwiftCheckoutApi = {
    createOrder,
    createPayment,
    getPaymentStatus,
    getStoredOrder,
    getStoredPayment,
    clearCheckoutSessions,
    stubEnabled,
    STUB_KEY,
  };
})(window);
