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
      if (event.target === root || !event.target) removeRoot(false);
    });
    skipButton?.addEventListener("click", finish);

    return { start, finish };
  }

  if (typeof module !== "undefined" && module.exports) module.exports = { createIntroGate };

  if (globalScope.document) {
    globalScope.document.addEventListener("DOMContentLoaded", () => {
      const root = globalScope.document.querySelector("[data-intro]");
      if (!root) return;
      createIntroGate({
        root,
        video: root.querySelector("[data-intro-video]"),
        skipButton: root.querySelector("[data-intro-skip]"),
        body: globalScope.document.body,
        storage: globalScope.sessionStorage,
        mediaQuery: globalScope.matchMedia("(prefers-reduced-motion: reduce)"),
      }).start();
    });
  }
}(typeof window !== "undefined" ? window : globalThis));
