// Winamp-style player using Cowbell
function getCookie(name) {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

const token = getCookie('pt');

let playlist = [];

let currentIndex = 0;
let audio = null;
let track = null;
const player = new Cowbell.Player.OpenMPT({
  pathToLibOpenMPT: 'vendor/cowbell/cowbell/openmpt/libopenmpt.js'
});

const elements = {
  trackInfo: document.getElementById('track-info'),
  time: document.getElementById('time'),
  progress: document.getElementById('progress'),
  volume: document.getElementById('volume'),
  playlist: document.getElementById('playlist'),
  play: document.getElementById('btn-play'),
  pause: document.getElementById('btn-pause'),
  stop: document.getElementById('btn-stop'),
  next: document.getElementById('btn-next'),
  prev: document.getElementById('btn-prev')
};

function formatTime(t) {
  const m = Math.floor(t / 60).toString().padStart(2, '0');
  const s = Math.floor(t % 60).toString().padStart(2, '0');
  return m + ':' + s;
}

function loadTrack(index) {
  if (audio && !audio.paused) audio.pause();
  if (track && track.close) track.close();
  currentIndex = index;
  const options = token ? { headers: { 'X-Player-Token': token } } : {};
  track = new player.Track(playlist[index].file, options);
  audio = track.open();
  audio.volume = elements.volume.value / 100;
  elements.trackInfo.textContent = playlist[index].title;
  audio.onloadedmetadata = () => {
    elements.progress.max = audio.duration;
    elements.time.textContent = formatTime(0) + ' / ' + formatTime(audio.duration);
  };
  audio.ontimeupdate = () => {
    elements.progress.value = audio.currentTime;
    elements.time.textContent = formatTime(audio.currentTime) + ' / ' + formatTime(audio.duration);
  };
  audio.onended = () => {
    nextTrack();
  };
  updatePlaylistUI();
}

function updatePlaylistUI() {
  const items = elements.playlist.querySelectorAll('li');
  items.forEach((li, i) => {
    if (i === currentIndex) li.classList.add('active');
    else li.classList.remove('active');
  });
}

function setupPlaylistUI() {
  elements.playlist.innerHTML = '';
  playlist.forEach((t, i) => {
    const li = document.createElement('li');
    li.textContent = t.title;
    li.onclick = () => { loadTrack(i); playCurrent(); };
    elements.playlist.appendChild(li);
  });
  updatePlaylistUI();
}

function playCurrent() {
  if (!audio) loadTrack(currentIndex);
  audio.play();
}

function pauseCurrent() {
  if (audio) audio.pause();
}

function stopCurrent() {
  if (audio) {
    audio.pause();
    audio.currentTime = 0;
  }
}

function nextTrack() {
  loadTrack((currentIndex + 1) % playlist.length);
  playCurrent();
}

function prevTrack() {
  loadTrack((currentIndex - 1 + playlist.length) % playlist.length);
  playCurrent();
}

async function fetchPlaylist() {
  try {
    const response = await fetch('playlist.json');
    playlist = await response.json();
    setupPlaylistUI();
    // Load first track but don't autoplay
    loadTrack(0);
  } catch (err) {
    console.error('Failed to load playlist', err);
  }
}

// Control handlers
elements.play.onclick = playCurrent;
elements.pause.onclick = pauseCurrent;
elements.stop.onclick = stopCurrent;
elements.next.onclick = nextTrack;
elements.prev.onclick = prevTrack;

elements.progress.oninput = () => {
  if (audio) audio.currentTime = elements.progress.value;
};

elements.volume.oninput = () => {
  if (audio) audio.volume = elements.volume.value / 100;
};

document.addEventListener('keydown', (e) => {
  switch (e.code) {
    case 'Space':
      e.preventDefault();
      if (audio && !audio.paused) pauseCurrent(); else playCurrent();
      break;
    case 'ArrowRight':
      nextTrack();
      break;
    case 'ArrowLeft':
      prevTrack();
      break;
    case 'ArrowUp':
      elements.volume.value = Math.min(100, Number(elements.volume.value) + 5);
      elements.volume.oninput();
      break;
    case 'ArrowDown':
      elements.volume.value = Math.max(0, Number(elements.volume.value) - 5);
      elements.volume.oninput();
      break;
  }
});
fetchPlaylist();
