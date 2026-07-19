/**
 * In-page sample report viewer (PDF.js) — crisp HiDPI pages, readable zoom, no PDF chrome.
 */
(function () {
  const PDF_JS_SRC = "/assets/js/vendor/pdfjs/pdf.min.js";
  const PDF_WORKER_SRC = "/assets/js/vendor/pdfjs/pdf.worker.min.js";
  const MIN_ZOOM = 0.85;
  const MAX_ZOOM = 2.4;
  const DEFAULT_ZOOM = 1.15;

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      if (window.pdfjsLib) {
        resolve(window.pdfjsLib);
        return;
      }
      const existing = document.querySelector(`script[src="${src}"]`);
      if (existing) {
        existing.addEventListener("load", () => resolve(window.pdfjsLib));
        existing.addEventListener("error", reject);
        return;
      }
      const script = document.createElement("script");
      script.src = src;
      script.async = true;
      script.onload = () => resolve(window.pdfjsLib);
      script.onerror = () => reject(new Error("Failed to load PDF.js"));
      document.head.appendChild(script);
    });
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function previewRoot(viewer) {
    // Toolbar/zoom controls live as siblings under .sample-report-preview
    return viewer.closest(".sample-report-preview") || viewer.parentElement || viewer;
  }

  function updateZoomLabel(root, zoom) {
    const label = root.querySelector("[data-sample-report-zoom-label]");
    if (label) {
      label.textContent = `${Math.round(zoom * 100)}%`;
    }
  }

  async function renderPdf(viewer, zoom) {
    const pagesHost = viewer.querySelector("[data-sample-report-pages]");
    const scroll = viewer.querySelector(".sample-report-viewer__scroll");
    const src = viewer.getAttribute("data-pdf-src");
    const root = previewRoot(viewer);
    if (!pagesHost || !src) {
      return;
    }

    const renderToken = (viewer._renderToken || 0) + 1;
    viewer._renderToken = renderToken;

    const pdfjsLib = await loadScript(PDF_JS_SRC);
    if (!pdfjsLib) {
      throw new Error("PDF.js unavailable");
    }
    pdfjsLib.GlobalWorkerOptions.workerSrc = PDF_WORKER_SRC;

    if (!viewer._pdfDoc) {
      const loadingTask = pdfjsLib.getDocument({ url: src });
      viewer._pdfDoc = await loadingTask.promise;
    }
    const pdf = viewer._pdfDoc;
    if (viewer._renderToken !== renderToken) {
      return;
    }

    const availableWidth =
      (scroll && scroll.clientWidth) || pagesHost.clientWidth || viewer.clientWidth || 640;
    const fitWidth = Math.max(320, availableWidth - 28);
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2.5);

    pagesHost.innerHTML = "";
    pagesHost.setAttribute("aria-busy", "true");
    updateZoomLabel(root, zoom);

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum += 1) {
      if (viewer._renderToken !== renderToken) {
        return;
      }
      const page = await pdf.getPage(pageNum);
      const unscaled = page.getViewport({ scale: 1 });
      const fitScale = fitWidth / unscaled.width;
      const cssScale = fitScale * zoom;
      const viewport = page.getViewport({ scale: cssScale * pixelRatio });

      const canvas = document.createElement("canvas");
      canvas.className = "sample-report-viewer__canvas";
      canvas.setAttribute("role", "img");
      canvas.setAttribute(
        "aria-label",
        `Sample report page ${pageNum} of ${pdf.numPages}`,
      );
      const context = canvas.getContext("2d", { alpha: false });
      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);
      canvas.style.width = `${Math.floor(unscaled.width * cssScale)}px`;
      canvas.style.height = "auto";

      const wrap = document.createElement("div");
      wrap.className = "sample-report-viewer__page";
      wrap.style.width = `${Math.floor(unscaled.width * cssScale)}px`;
      wrap.appendChild(canvas);
      pagesHost.appendChild(wrap);

      await page.render({ canvasContext: context, viewport }).promise;
    }

    if (viewer._renderToken !== renderToken) {
      return;
    }
    pagesHost.setAttribute("aria-busy", "false");
    updateZoomLabel(root, zoom);
  }

  function wireZoom(viewer) {
    const root = previewRoot(viewer);
    viewer._zoom = DEFAULT_ZOOM;
    updateZoomLabel(root, viewer._zoom);

    const rerender = async () => {
      try {
        await renderPdf(viewer, viewer._zoom);
      } catch (error) {
        console.warn("[DrSwift] Sample report PDF viewer failed; keeping image fallback.", error);
        const pagesHost = viewer.querySelector("[data-sample-report-pages]");
        if (pagesHost) {
          pagesHost.setAttribute("aria-busy", "false");
        }
      }
    };

    root.querySelectorAll("[data-sample-report-zoom]").forEach((button) => {
      button.addEventListener("click", (event) => {
        event.preventDefault();
        const action = button.getAttribute("data-sample-report-zoom");
        if (action === "in") {
          viewer._zoom = clamp(viewer._zoom + 0.2, MIN_ZOOM, MAX_ZOOM);
        } else if (action === "out") {
          viewer._zoom = clamp(viewer._zoom - 0.2, MIN_ZOOM, MAX_ZOOM);
        } else if (action === "fit") {
          viewer._zoom = 1;
        } else {
          return;
        }
        updateZoomLabel(root, viewer._zoom);
        rerender();
      });
    });

    return rerender;
  }

  function init() {
    document.querySelectorAll("[data-sample-report-viewer]").forEach((viewer) => {
      viewer.addEventListener("contextmenu", (event) => {
        if (event.target.closest("[data-sample-report-pages]")) {
          event.preventDefault();
        }
      });
      const rerender = wireZoom(viewer);
      rerender();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
// zoom-fix-1784423843
