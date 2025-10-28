console.log('Let’s write JavaScript');

let currentSong = new Audio();
let songs = [];
let currFolder = "songs";

function secondsToMinutesSeconds(seconds) {
  if (isNaN(seconds) || seconds < 0) return "00:00";
  const minutes = String(Math.floor(seconds / 60)).padStart(2, '0');
  const secs = String(Math.floor(seconds % 60)).padStart(2, '0');
  return `${minutes}:${secs}`;
}

async function getSongs(folder) {
  currFolder = folder;
  let res = await fetch(`/${folder}/`);
  let html = await res.text();
  let div = document.createElement("div");
  div.innerHTML = html;
  let links = div.getElementsByTagName("a");

  songs = [];
  for (let link of links) {
    if (link.href.endsWith(".mp3")) {
      songs.push(link.href.split(`/${folder}/`)[1]);
    }
  }

  let songUL = document.querySelector(".songList ul");
  songUL.innerHTML = "";
  for (let song of songs) {
    songUL.innerHTML += `
      <li>
        <img class="invert" width="34" src="img/music.svg" alt="">
        <div class="info">
          <div>${decodeURIComponent(song || "")}</div>
          <div>Harry</div>
        </div>
        <div class="playnow">
          <span>Play Now</span>
          <img class="invert" src="img/play.svg" alt="">
        </div>
      </li>`;
  }

  Array.from(songUL.children).forEach(li => {
    li.addEventListener("click", () => {
      const track = li.querySelector(".info div").textContent.trim();
      playMusic(track);
    });
  });

  return songs;
}

function playMusic(track, pause = false) {
  currentSong.src = `/${currFolder}/${track}`;
  if (!pause) {
    currentSong.play();
    document.getElementById("play").src = "img/pause.svg";
  }
  document.querySelector(".songinfo").textContent = decodeURI(track);
  document.querySelector(".songtime").textContent = "00:00 / 00:00";
}

async function main() {
  await getSongs("songs");
  if (songs.length > 0) {
    playMusic(songs[0], true);
  }

  document.getElementById("play").addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "img/pause.svg";
    } else {
      currentSong.pause();
      play.src = "img/play.svg";
    }
  });

  currentSong.addEventListener("timeupdate", () => {
    document.querySelector(".songtime").textContent =
      `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;
    document.querySelector(".circle").style.left =
      (currentSong.currentTime / currentSong.duration) * 100 + "%";
  });

  document.querySelector(".seekbar").addEventListener("click", e => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentSong.currentTime = (currentSong.duration * percent) / 100;
  });

  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
  });

  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-120%";
  });

  document.getElementById("previous").addEventListener("click", () => {
    let index = songs.indexOf(currentSong.src.split("/").pop());
    if (index > 0) playMusic(songs[index - 1]);
  });

  document.getElementById("next").addEventListener("click", () => {
    let index = songs.indexOf(currentSong.src.split("/").pop());
    if (index < songs.length - 1) playMusic(songs[index + 1]);
  });

  document.querySelector(".range input").addEventListener("change", e => {
    currentSong.volume = parseInt(e.target.value) / 100;
  });

  document.querySelector(".volume img").addEventListener("click", e => {
    if (e.target.src.includes("volume.svg")) {
      e.target.src = e.target.src.replace("volume.svg", "mute.svg");
      currentSong.volume = 0;
      document.querySelector(".range input").value = 0;
    } else {
      e.target.src = e.target.src.replace("mute.svg", "volume.svg");
      currentSong.volume = 0.1;
      document.querySelector(".range input").value = 10;
    }
  });
}

main();