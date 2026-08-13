(function (globalScope) {
  "use strict";

  const SESSION_KEY = "white-pix-intro-seen";
  const DEFAULT_TIMEOUT_MS = 12000;
  const EXIT_FALLBACK_MS = 400;

  function addClass(element, name) {
    if (!element) return;
    if (typeof element.classList.add === "function") element.classList.add(name);
    else element.classList.add(name);
  }

  function removeClass(element, name) {
    if (!element) return;
    if (typeof element.classList.remove === "function") element.classList.remove(name);
    else element.classList.delete(name);
  }

  function pauseVideo(video) {
    try {
      video?.pause?.();
    } catch (_) {
      // A broken media element must not prevent entry to the home page.
    }
  }

  function createIntroGate(options) {
    const {
      root,
      video,
      skipButton,
      body,
      storage,
      mediaQuery,
      setTimer = globalScope.setTimeout.bind(globalScope),
      clearTimer = globalScope.clearTimeout.bind(globalScope),
      timeoutMs = DEFAULT_TIMEOUT_MS,
    } = options;
    let finished = false;
    let timeoutTimer = null;
    let removalTimer = null;
    let removed = false;

    function removeRoot(fromFallback) {
      if (removed) return;
      removed = true;
      if (removalTimer && !fromFallback) clearTimer(removalTimer);
      removalTimer = null;
      if (root && root.parentNode) root.parentNode.removeChild(root);
    }

    function finish() {
      if (finished) return;
      finished = true;
      if (timeoutTimer) clearTimer(timeoutTimer);
      timeoutTimer = null;
      pauseVideo(video);
      try {
        storage?.setItem(SESSION_KEY, "true");
      } catch (_) {
        // Private browsing or disabled storage must never trap the visitor in the intro.
      }
      addClass(root, "is-finished");
      removeClass(body, "intro-scroll-lock");
      removalTimer = setTimer(() => removeRoot(true), EXIT_FALLBACK_MS);
    }

    function start() {
      let hasSeenIntro = false;
      try {
        hasSeenIntro = storage?.getItem(SESSION_KEY) === "true";
      } catch (_) {
        // Treat unavailable storage as a first visit and still allow all exits.
      }
      if (hasSeenIntro || mediaQuery?.matches) {
        finish();
        return;
      }

      timeoutTimer = setTimer(finish, timeoutMs);
      if (video) {
        video.addEventListener("ended", finish, { once: true });
        video.addEventListener("error", finish, { once: true });
        try {
          const playResult = video.play();
          if (playResult && typeof playResult.catch === "function") playResult.catch(finish);
        } catch (_) {
          finish();
        }
      }
    }

    root?.addEventListener("transitionend", (event) => {
      if (finished && (event.target === root || !event.target)) removeRoot(false);
    });
    skipButton?.addEventListener("click", finish);

    return { start, finish };
  }

  function getSessionStorage(windowRef) {
    try {
      return windowRef.sessionStorage;
    } catch (_) {
      return null;
    }
  }

  function getReducedMotionQuery(windowRef) {
    try {
      return windowRef.matchMedia("(prefers-reduced-motion: reduce)");
    } catch (_) {
      return null;
    }
  }

  function bootstrapIntroGate(documentRef, windowRef, options = {}) {
    const root = documentRef?.querySelector("[data-intro]");
    if (!root) return null;
    const gate = createIntroGate({
      root,
      video: root.querySelector("[data-intro-video]"),
      skipButton: root.querySelector("[data-intro-skip]"),
      body: documentRef.body,
      storage: getSessionStorage(windowRef),
      mediaQuery: getReducedMotionQuery(windowRef),
      ...options,
    });
    gate.start();
    return gate;
  }

  if (typeof module !== "undefined" && module.exports) module.exports = { bootstrapIntroGate, createIntroGate };

  if (globalScope.document) {
    if (!bootstrapIntroGate(globalScope.document, globalScope)) {
      globalScope.document.addEventListener("DOMContentLoaded", () => {
        bootstrapIntroGate(globalScope.document, globalScope);
      }, { once: true });
    }
  }
}(typeof window !== "undefined" ? window : globalThis));
