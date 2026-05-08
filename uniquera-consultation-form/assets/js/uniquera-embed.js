(function () {
    "use strict";

    function getScriptEl() {
        if (document.currentScript) {
            return document.currentScript;
        }
        var scripts = document.getElementsByTagName("script");
        return scripts.length ? scripts[scripts.length - 1] : null;
    }

    function toInt(value, fallback) {
        var n = parseInt(String(value || ""), 10);
        return isNaN(n) ? fallback : n;
    }

    function normalizeSrc(src, scriptEl) {
        var s = String(src || "").trim();
        if (s) {
            return s;
        }
        var scriptSrc = scriptEl && scriptEl.getAttribute("src") ? scriptEl.getAttribute("src") : "";
        if (!scriptSrc) {
            return "";
        }
        try {
            var u = new URL(scriptSrc, window.location.href);
            return u.origin + "/consultation-embed/";
        } catch (e) {
            return "";
        }
    }

    function appendEmbedQuery(src) {
        if (!src) {
            return src;
        }
        return src + (src.indexOf("?") === -1 ? "?" : "&") + "embed=1";
    }

    var scriptEl = getScriptEl();
    if (!scriptEl) {
        return;
    }

    var targetSelector = scriptEl.getAttribute("data-target") || "";
    var requestedSrc = scriptEl.getAttribute("data-src") || "";
    var minHeight = Math.max(420, toInt(scriptEl.getAttribute("data-min-height"), 900));
    var iframeTitle = scriptEl.getAttribute("data-title") || "Uniquera consultation form";

    var src = normalizeSrc(requestedSrc, scriptEl);
    if (!src) {
        return;
    }
    src = appendEmbedQuery(src);

    var container = null;
    if (targetSelector) {
        container = document.querySelector(targetSelector);
    }
    if (!container) {
        container = document.createElement("div");
        container.className = "uniquera-embed-container";
        if (scriptEl.parentNode) {
            scriptEl.parentNode.insertBefore(container, scriptEl.nextSibling);
        } else {
            document.body.appendChild(container);
        }
    }

    var iframe = document.createElement("iframe");
    iframe.src = src;
    iframe.title = iframeTitle;
    iframe.loading = "lazy";
    iframe.referrerPolicy = "strict-origin-when-cross-origin";
    iframe.setAttribute("allow", "clipboard-write");
    iframe.style.width = "100%";
    iframe.style.minHeight = String(minHeight) + "px";
    iframe.style.height = String(minHeight) + "px";
    iframe.style.border = "0";
    iframe.style.display = "block";
    iframe.style.background = "transparent";

    container.appendChild(iframe);

    var allowedOrigin = "";
    try {
        allowedOrigin = new URL(src, window.location.href).origin;
    } catch (e) {
        allowedOrigin = "";
    }

    function requestSize() {
        if (!iframe.contentWindow) {
            return;
        }
        try {
            iframe.contentWindow.postMessage({ type: "uniquera:embed:request-size" }, "*");
        } catch (e) {
            /* ignore */
        }
    }

    function onMessage(event) {
        if (allowedOrigin && event.origin !== allowedOrigin) {
            return;
        }
        var data = event && event.data ? event.data : null;
        if (!data) {
            return;
        }
        if (data.type === "uniquera:embed:resize") {
            var nextHeight = Math.max(minHeight, toInt(data.height, minHeight));
            iframe.style.height = String(nextHeight + 8) + "px";
            return;
        }
        if (data.type === "uniquera:embed:thankyou" && data.url) {
            try {
                window.open(String(data.url), "_blank", "noopener");
            } catch (e) {
                window.location.href = String(data.url);
            }
        }
    }

    window.addEventListener("message", onMessage);
    iframe.addEventListener("load", function () {
        requestSize();
        window.setTimeout(requestSize, 300);
        window.setTimeout(requestSize, 900);
    });
})();
