// Winamp-style player using Cowbell
function getCookie(name) {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

const token = getCookie('pt');

const storageKey = 'prefs_' + (token || 'default');

function loadPrefs() {
  try {
    return JSON.parse(localStorage.getItem(storageKey)) || {};
  } catch (e) {
    return {};
  }
}

function savePrefs() {
  localStorage.setItem(storageKey, JSON.stringify(userPrefs));
}

let userPrefs = loadPrefs();

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

let currentFile = userPrefs.file || null;
let audio = null;
let track = null;
let currentPlayer = null;

let masterGain = null;

let shuffleEnabled = !!userPrefs.shuffle;

let firstLoad = true;
let seeking = false;
const params = new URLSearchParams(window.location.search);
let initialTrack = params.get('track');
const hasTrackParam = params.has('track');

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
  random: document.getElementById('btn-random'),
  share: document.getElementById('btn-share')
};

if (userPrefs.volume !== undefined) {
  elements.volume.value = userPrefs.volume;
  applyVolume();
}

if (shuffleEnabled) {
  const img = elements.random.querySelector('img');
  img.src = 'img/random_active.svg';
}

function formatTime(t) {
  const m = Math.floor(t / 60).toString().padStart(2, '0');
  const s = Math.floor(t % 60).toString().padStart(2, '0');
  return m + ':' + s;
}

function normalizePath(path) {
  const parts = path.split('/').filter(p => p && p !== '.');
  const out = [];
  for (const part of parts) {
    if (part === '..') {
      return null;
    }
    out.push(part);
  }
  const normalized = out.join('/');
  if (!normalized.startsWith('media/')) {
    return null;
  }
  return normalized;
}

initialTrack = normalizePath(initialTrack || '');

function showToast(text) {
  const msg = document.createElement('div');
  msg.className = 'toast';
  msg.textContent = text;
  document.body.appendChild(msg);
  setTimeout(() => {
    msg.remove();
  }, 2000);
}

function loadTrack(file) {
  file = normalizePath(file);
  if (!file) return false;
  const index = playlist.findIndex(t => t.file === file);
  if (index === -1) return false;
  if (audio && !audio.paused) audio.pause();
  if (track && track.close) track.close();
  currentFile = file;
  userPrefs.file = file;
  savePrefs();
  const ext = file.split('.').pop().toLowerCase();
  const pl = players[ext];
  currentPlayer = pl;
  if (!pl) {
    console.warn('No player for extension', ext);
    audio = null;
    track = null;
    return false;
  }
  track = new pl.Track(file);
  audio = track.open();
  hookUpGain();
  applyVolume();
  elements.trackInfo.textContent = playlist[index].title;
  const initProgress = () => {
    const duration = audio && isFinite(audio.duration) ? audio.duration : 0;
    elements.progress.max = duration;
    elements.progress.value = audio.currentTime || 0;
    elements.time.textContent = formatTime(audio.currentTime || 0) + ' / ' + formatTime(duration);
  };
  if ('onloadedmetadata' in audio) {
    audio.onloadedmetadata = initProgress;
  } else {
    initProgress();
  }
  audio.ontimeupdate = () => {
    if (!seeking) {
      elements.progress.value = audio.currentTime;
    }
    if (!elements.progress.max && isFinite(audio.duration)) {
      elements.progress.max = audio.duration;
    }
    const duration = elements.progress.max || audio.duration || 0;
    elements.time.textContent = formatTime(audio.currentTime) + ' / ' + formatTime(duration);
  };
  audio.onended = () => {
    nextTrack();
  };
  updatePlaylistUI();
  return true;
}

function updatePlaylistUI() {
  const items = elements.playlist.querySelectorAll('li');
  const idx = playlist.findIndex(t => t.file === currentFile);
  items.forEach((li, i) => {
    if (i === idx) li.classList.add('active');
    else li.classList.remove('active');
  });
}

function setupPlaylistUI() {
  elements.playlist.innerHTML = '';
  playlist.forEach((t) => {
    const li = document.createElement('li');
    li.textContent = t.title;
    li.onclick = () => {
      if (loadTrack(t.file)) {
        playCurrent();
      } else {
        nextTrack();
      }
    };
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
    if (!currentFile || playlist.findIndex(t => t.file === currentFile) === -1) {
      currentFile = playlist[0].file;
    }
    if (!loadTrack(currentFile)) {
      nextTrack();
      return;
    }
  }
  if (audio && audio.context && audio.context.state === 'suspended') {
    audio.context.resume();
  }
  if (audio) audio.play();
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
  if (!playlist.length) return;
  const currentIndex = playlist.findIndex(t => t.file === currentFile);
  let index = currentIndex;
  let tries = playlist.length;
  while (tries--) {
    if (shuffleEnabled) {
      if (playlist.length <= 1) {
        index = currentIndex;
      } else {
        do {
          index = Math.floor(Math.random() * playlist.length);
        } while (index === currentIndex);
      }
    } else {
      index = (index + 1) % playlist.length;
    }
    if (loadTrack(playlist[index].file)) {
      playCurrent();
      return;
    }
  }
  console.warn('No playable tracks found');
}

function prevTrack() {
  if (!playlist.length) return;
  const currentIndex = playlist.findIndex(t => t.file === currentFile);
  let index = currentIndex;
  let tries = playlist.length;
  while (tries--) {
    index = (index - 1 + playlist.length) % playlist.length;
    if (loadTrack(playlist[index].file)) {
      playCurrent();
      return;
    }
  }
  console.warn('No playable tracks found');
}

async function fetchPlaylist() {
  try {
    const response = await fetch('playlist.json');
    const rawList = await response.json();
    const newList = rawList
      .filter(t => t && typeof t.title === 'string' && typeof t.file === 'string' && t.file.startsWith('media/') && !t.file.includes('..') && !t.file.startsWith('/'))
      .map(t => {
        const file = normalizePath(t.file);
        if (!file) return null;
        return { title: t.title, file };
      })
      .filter(Boolean);
    playlist = newList;
    setupPlaylistUI();
    let targetFile;
    if (firstLoad && initialTrack) {
      targetFile = initialTrack;
    } else if (firstLoad && hasTrackParam) {
      targetFile = null;
    } else {
      targetFile = userPrefs.file || currentFile;
    }
    if (targetFile) {
      const found = playlist.find(t => t.file === targetFile);
      if (found) {
        currentFile = found.file;
      } else if (firstLoad && hasTrackParam && playlist.length) {
        currentFile = playlist[Math.floor(Math.random() * playlist.length)].file;
      } else if (playlist.length) {
        currentFile = playlist[0].file;
      }
    } else if (playlist.length) {
      if (firstLoad && hasTrackParam) {
        currentFile = playlist[Math.floor(Math.random() * playlist.length)].file;
      } else {
        currentFile = playlist[0].file;
      }
    }
    firstLoad = false;
    if (currentFile) {
      const idx = playlist.findIndex(t => t.file === currentFile);
      if (idx !== -1) {
        elements.trackInfo.textContent = playlist[idx].title;
        userPrefs.file = currentFile;
        savePrefs();
      }
    }
    updatePlaylistUI();
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
  userPrefs.shuffle = shuffleEnabled;
  savePrefs();
};
elements.share.onclick = async () => {
  if (!currentFile) return;
  const url = new URL(window.location);
  url.searchParams.set('track', currentFile);
  try {
    await navigator.clipboard.writeText(url.toString());
    console.info('Link copied to clipboard:', url.toString());
    showToast('Link copied to clipboard');
  } catch (err) {
    console.error('Failed to copy link', err);
  }
};
elements.progress.oninput = () => {
  if (audio) {
    seeking = true;
    if (!elements.progress.max && isFinite(audio.duration)) {
      elements.progress.max = audio.duration;
    }
    audio.currentTime = parseFloat(elements.progress.value);
  }
};
elements.progress.onchange = () => {
  seeking = false;
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
  userPrefs.volume = Number(elements.volume.value);
  savePrefs();
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
setInterval(fetchPlaylist, 30000);
