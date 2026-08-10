(() => {
  const root = document.querySelector("[data-project-player]");
  if (!root) return;

  const video = root.querySelector("video[data-video-src]");
  const play = root.querySelector("[data-play-project]");
  const error = root.querySelector("[data-video-error]");
  const retry = root.querySelector("[data-video-retry]");
  if (!video || !play || !error || !retry) return;

  const activate = async () => {
    if (!video.querySelector("source")) {
      const source = document.createElement("source");
      source.src = video.dataset.videoSrc;
      source.type = "video/mp4";
      video.append(source);
      video.load();
    }

    root.classList.add("is-active");
    error.hidden = true;
    try {
      await video.play();
    } catch {
      video.controls = true;
    }
  };

  play.addEventListener("click", activate);
  retry.addEventListener("click", activate);
  video.addEventListener("playing", () => { play.hidden = true; });
  video.addEventListener("error", () => {
    error.hidden = false;
    retry.focus();
  });
})();
