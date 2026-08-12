const assert = require("node:assert/strict");
const test = require("node:test");

const { createIntroGate } = require("../assets/intro-gate.js");
const { renderHomePage } = require("../scripts/project-build.cjs");

function createElement() {
  const listeners = new Map();
  return {
    classList: new Set(),
    parentNode: null,
    removed: false,
    addEventListener(type, listener) {
      listeners.set(type, listener);
    },
    dispatch(type) {
      listeners.get(type)?.({ type, currentTarget: this });
    },
  };
}

function createFixture(overrides = {}) {
  const root = createElement();
  const video = createElement();
  const skipButton = createElement();
  const body = createElement();
  const timers = [];
  const clearedTimers = [];
  root.parentNode = {
    removeChild(node) {
      node.removed = true;
    },
  };
  video.play = overrides.play || (() => Promise.resolve());

  return {
    root,
    video,
    skipButton,
    body,
    storage: overrides.storage || {
      getItem() { return null; },
      setItem() {},
    },
    mediaQuery: overrides.mediaQuery || { matches: false },
    setTimer(callback, delay) {
      const timer = { callback, delay };
      timers.push(timer);
      return timer;
    },
    clearTimer(timer) {
      clearedTimers.push(timer);
    },
    timers,
    clearedTimers,
    ...overrides,
  };
}

function starts(fixture) {
  return createIntroGate(fixture).start();
}

function finishExit(fixture) {
  fixture.timers.at(-1).callback();
}

test("finish is idempotent and marks this tab session", () => {
  const markerWrites = [];
  const fixture = createFixture({
    storage: {
      getItem() { return null; },
      setItem(key, value) { markerWrites.push([key, value]); },
    },
  });
  const gate = createIntroGate(fixture);

  gate.start();
  gate.finish();
  gate.finish();
  finishExit(fixture);

  assert.equal(fixture.root.classList.has("is-finished"), true);
  assert.equal(fixture.body.classList.has("intro-scroll-lock"), false);
  assert.deepEqual(markerWrites, [["white-pix-intro-seen", "true"]]);
  assert.equal(fixture.clearedTimers.length, 1);
  assert.equal(fixture.root.removed, true);
});

test("Skip enters home and removes the intro", () => {
  const fixture = createFixture();

  starts(fixture);
  fixture.skipButton.dispatch("click");
  finishExit(fixture);

  assert.equal(fixture.root.classList.has("is-finished"), true);
  assert.equal(fixture.root.removed, true);
});

test("video loading error enters home", () => {
  const fixture = createFixture();

  starts(fixture);
  fixture.video.dispatch("error");
  finishExit(fixture);

  assert.equal(fixture.root.removed, true);
});

test("rejected autoplay promise enters home", async () => {
  const fixture = createFixture({ play: () => Promise.reject(new Error("blocked")) });

  starts(fixture);
  await Promise.resolve();
  finishExit(fixture);

  assert.equal(fixture.root.removed, true);
});

test("timeout enters home after twelve seconds", () => {
  const fixture = createFixture();

  starts(fixture);
  assert.equal(fixture.timers[0].delay, 12000);
  fixture.timers[0].callback();
  finishExit(fixture);

  assert.equal(fixture.root.removed, true);
});

test("an existing session marker bypasses playback", () => {
  let plays = 0;
  const fixture = createFixture({
    play: () => { plays += 1; return Promise.resolve(); },
    storage: { getItem() { return "true"; }, setItem() {} },
  });

  starts(fixture);
  finishExit(fixture);

  assert.equal(plays, 0);
  assert.equal(fixture.root.removed, true);
});

test("reduced motion bypasses playback", () => {
  let plays = 0;
  const fixture = createFixture({
    play: () => { plays += 1; return Promise.resolve(); },
    mediaQuery: { matches: true },
  });

  starts(fixture);
  finishExit(fixture);

  assert.equal(plays, 0);
  assert.equal(fixture.root.removed, true);
});

test("storage exceptions cannot block entering home", () => {
  const fixture = createFixture({
    storage: {
      getItem() { throw new Error("denied"); },
      setItem() { throw new Error("denied"); },
    },
  });

  assert.doesNotThrow(() => starts(fixture));
  fixture.skipButton.dispatch("click");
  finishExit(fixture);

  assert.equal(fixture.root.removed, true);
});

test("rendered home contains the complete intro contract", () => {
  const html = renderHomePage([]);

  assert.match(html, /<body class="home-page intro-scroll-lock">/);
  assert.match(html, /<script src="assets\/intro-gate\.js" defer><\/script>/);
  assert.match(html, /<section[^>]*data-intro/);
  assert.match(html, /data-intro-video[^>]*src="assets\/videos\/site-intro\.mp4"[^>]*muted[^>]*autoplay[^>]*playsinline[^>]*preload="auto"/);
  assert.match(html, /<button[^>]*data-intro-skip[^>]*>Skip<\/button>/);
  assert.ok(html.indexOf("data-intro") < html.indexOf("<header"));
});
