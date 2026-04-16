/**
 * Browse a local folder of audio files and play one at a time (no upload).
 */
(function () {
  "use strict";

  let audioReady = false;
  /** @type {Tone.Player | null} */
  let player = null;
  /** @type {ReturnType<typeof setTimeout> | null} */
  let endTimer = null;
  let blobUrls = [];

  const folderInput = document.getElementById("folder");
  const btnStop = document.getElementById("btn-stop");
  const listEl = document.getElementById("list");

  const AUDIO_EXT = /\.(wav|mp3|flac|aiff|aif|ogg|m4a)$/i;

  async function ensureAudio() {
    if (audioReady) return;
    await Tone.start();
    audioReady = true;
  }

  function revokeBlobUrls() {
    blobUrls.forEach((u) => URL.revokeObjectURL(u));
    blobUrls = [];
  }

  function stopPlayback() {
    if (endTimer) {
      clearTimeout(endTimer);
      endTimer = null;
    }
    if (player) {
      try {
        player.stop();
        player.dispose();
      } catch (e) {
        console.warn(e);
      }
      player = null;
    }
    listEl.querySelectorAll("li.playing").forEach((el) => {
      el.classList.remove("playing");
    });
    btnStop.disabled = true;
  }

  folderInput.addEventListener("change", async (e) => {
    const files = e.target.files;
    if (!files || !files.length) return;

    stopPlayback();
    revokeBlobUrls();
    listEl.innerHTML = "";

    const audioFiles = [];
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      if (AUDIO_EXT.test(f.name)) {
        audioFiles.push(f);
      }
    }

    audioFiles.sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: "base" })
    );

    if (!audioFiles.length) {
      const li = document.createElement("li");
      li.textContent = "No audio files (.wav, .mp3, .ogg, …) in this folder.";
      listEl.appendChild(li);
      return;
    }

    for (const file of audioFiles) {
      const url = URL.createObjectURL(file);
      blobUrls.push(url);

      const li = document.createElement("li");
      li.textContent = file.name;
      li.dataset.url = url;
      li.addEventListener("click", () => playUrl(li, url));
      listEl.appendChild(li);
    }
  });

  async function playUrl(li, url) {
    try {
      await ensureAudio();
      stopPlayback();

      li.classList.add("playing");
      btnStop.disabled = false;

      player = new Tone.Player({
        url,
        loop: false,
        onload: () => {},
        onerror: (err) => {
          console.error(err);
          stopPlayback();
        },
      }).toDestination();

      await Tone.loaded();
      const dur = player.buffer ? player.buffer.duration : 0;
      player.start();
      if (dur > 0) {
        endTimer = setTimeout(() => {
          endTimer = null;
          li.classList.remove("playing");
          btnStop.disabled = true;
          if (player) {
            try {
              player.dispose();
            } catch (e) {
              /* ignore */
            }
            player = null;
          }
        }, dur * 1000 + 100);
      }
    } catch (err) {
      console.error(err);
      stopPlayback();
    }
  }

  btnStop.addEventListener("click", () => {
    stopPlayback();
  });
})();
