// Winamp-style player using Cowbell
function getCookie(name) {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

const token = getCookie('pt');

// Ensure media requests include token header when required
if (token) {
  (function(open, send) {
    XMLHttpRequest.prototype.open = function(method, url, async, user, pass) {
      this._url = url;
      return open.call(this, method, url, async, user, pass);
    };
    XMLHttpRequest.prototype.send = function(body) {
      if (this._url && this._url.indexOf('media/') !== -1) {
        this.setRequestHeader('X-Player-Token', token);
      }
      return send.call(this, body);
    };
  })(XMLHttpRequest.prototype.open, XMLHttpRequest.prototype.send);
}

let playlist = [];

let currentIndex = 0;
let audio = null;
let track = null;
let currentPlayer = null;

let masterGain = null;

let shuffleEnabled = false;

const audioPlayer = new Cowbell.Player.Audio();
const openmptPlayer = new Cowbell.Player.OpenMPT({
  pathToLibOpenMPT: 'vendor/cowbell/cowbell/openmpt/libopenmpt.js'
});
const players = {
  mp3: audioPlayer,
  ogg: audioPlayer,
  wav: audioPlayer,
  psg: new Cowbell.Player.PSG(),
  psy: new Cowbell.Player.PSG({ ayFrequency: 2000000, ayMode: 'YM' }),
  sndh: new Cowbell.Player.PSGPlay(),
  vtx: new Cowbell.Player.VTX(),
  stc: new Cowbell.Player.ZXSTC({ stereoMode: 'acb' }),
  pt3: new Cowbell.Player.ZXPT3({ stereoMode: 'acb' }),
  sqt: new Cowbell.Player.ZXSQT({ stereoMode: 'acb' }),
  sid: new Cowbell.Player.JSSID(),
  sap: new Cowbell.Player.ASAP(),
  mod: openmptPlayer,
  s3m: openmptPlayer,
  xm: openmptPlayer,
  it: openmptPlayer
};

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
  prev: document.getElementById('btn-prev'),
  random: document.getElementById('btn-random')
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
  const file = playlist[index].file;
  const ext = file.split('.').pop().toLowerCase();
  const pl = players[ext];
  currentPlayer = pl;
  if (!pl) {
    console.error('No player for extension', ext);
    return;
  }
  track = new pl.Track(file);
  audio = track.open();
  hookUpGain();
  applyVolume();
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


function hookUpGain() {
  if (masterGain && masterGain.context) {
    try { masterGain.disconnect(); } catch (e) {}
    masterGain = null;
  }
  if (!audio) return;
  if (audio instanceof HTMLMediaElement) {
    return;
  }
  if (audio.context && audio.node && audio.context.createGain) {
    masterGain = audio.context.createGain();
    if (typeof audio.node.disconnect === 'function') {
      try { audio.node.disconnect(); } catch (e) {}
    }
    audio.node.connect(masterGain);
    masterGain.connect(audio.context.destination);
  }
}


function playCurrent() {
  if (!audio) {
    if (!playlist.length) return;
    loadTrack(currentIndex);
  }
  if (audio.context && audio.context.state === 'suspended') {
    audio.context.resume();
  }
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
  let index;
  if (shuffleEnabled) {
    if (playlist.length <= 1) {
      index = currentIndex;
    } else {
      do {
        index = Math.floor(Math.random() * playlist.length);
      } while (index === currentIndex);
    }
  } else {
    index = (currentIndex + 1) % playlist.length;
  }
  loadTrack(index);
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
    if (playlist.length) {
      currentIndex = 0;
      elements.trackInfo.textContent = playlist[0].title;
    }
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
elements.random.onclick = () => {
  shuffleEnabled = !shuffleEnabled;
  const img = elements.random.querySelector('img');
  img.src = shuffleEnabled ? 'img/random_active.svg' : 'img/random.svg';
};

elements.progress.oninput = () => {
  if (audio) audio.currentTime = elements.progress.value;
};

function applyVolume() {
  const vol = elements.volume.value / 100;
  if (audio) {
    if (audio instanceof HTMLMediaElement) {
      audio.volume = vol;
    } else if (masterGain) {
      masterGain.gain.value = vol;
    } else if (typeof audio.setVolume === 'function') {
      audio.setVolume(vol);
    }
  }
  if (track && typeof track.setVolume === 'function') {
    track.setVolume(vol);
  }
  if (currentPlayer && typeof currentPlayer.setVolume === 'function') {
    currentPlayer.setVolume(vol);
  }
}

elements.volume.addEventListener('input', applyVolume);
elements.volume.addEventListener('change', applyVolume);

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
      applyVolume();
      break;
    case 'ArrowDown':
      elements.volume.value = Math.max(0, Number(elements.volume.value) - 5);
      applyVolume();
      break;
  }
});
fetchPlaylist();
