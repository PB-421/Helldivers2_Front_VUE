<template>
  <div class="card">
    <div class="top">
      <div class="pfp">
        <img :src="currentSong.image" :alt="currentSong.title" width="100%" height="100%"/>
      </div>
      <div class="titles">
        <div class="title">{{ currentSong.title }}</div>
        <div class="author">{{ currentSong.artist }}</div>
      </div>
    </div>

    <div class="controls-wrapper">
      <div class="controls-wrapper-image"></div>
      <input type="range" min="0" :max="duration" step="0.01" v-model="currentTime" @input="seekVideo" class="slider" style="margin-top: 10px" :style="`--value: ${(currentTime / duration) * 100}`"/>
      <div class="controls">
        <button class="button" @click="prevSong" title="Anterior">
          <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
            <path d="M18 20V4l-8.5 8L18 20zM6 4h2v16H6V4z" />
          </svg>
        </button>
        <button class="button" @click="togglePlayPause" title="Play/Pausa">
          <svg v-if="!isPlaying" viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
          <svg v-else viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
          </svg>
        </button>
        <button class="button" @click="nextSong" title="Siguiente">
          <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
            <path d="M6 4v16l8.5-8L6 4zM18 4h-2v16h2V4z" />
          </svg>
        </button>
      </div>

      <div class="volume">
        <button class="mute-btn" @click="toggleMute" :title="isMuted ? 'Desmutear' : 'Mutear'">
          <span v-if="isMuted">🔇</span>
          <span v-else>🔊</span>
        </button>
        <span class="volume-text">{{ volume }}%</span>
        <div class="volume-row">
          <input type="range" min="0" max="100" v-model="volume" @input="changeVolume" class="slider" :style="`--value: ${volume}`"/> <!-- el style del final es para que chrome pueda mostrar la barra de progreso-->
          <button class="autoplay-btn" @click="toggleAutoplay" :title="autoplay ? 'Autoplay ON' : 'Autoplay OFF'">
            <svg v-if="autoplay" viewBox="0 0 24 24" width="22" height="22" fill="#0f0">
              <path d="M9 16.2l-3.5-3.5L4 14.2l5 5 11-11-1.5-1.5z"/>
            </svg>
            <svg v-else viewBox="0 0 24 24" width="22" height="22" fill="#f00">
              <path d="M18.3 5.71L12 12l6.3 6.29-1.41 1.42L12 13.41l-6.29 6.3-1.42-1.42L10.59 12 4.29 5.71 5.7 4.29 12 10.59l6.29-6.3z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
    <div id="player-container"></div>
  </div>
</template>

<script>
export default {
  name: "AudioPlayer",
  props: {
    startIndex: { type: Number, default: 0 },
  },
  data() { //Variables reactivas
    return {
      playlist: [
        {
          id: "X7EAvik5BQM",
          title: "Loadout Selection",
          artist: "Wilbert Roget II",
          image: "/HD2.png",
        },
        {
          id: "Q9pkh4Z39nE",
          title: "Super Earth Anthem",
          artist: "Ross Tregenza",
          image: "/superearth2.png",
        },
        {
          id: "noCwgCocLBU",
          title: "The Terminid Plague",
          artist: "Wilbert Roget II",
          image: "/terminids.png",
        },
        {
          id: "dU84A6TD_Oc",
          title: "The Automaton Legion",
          artist: "Wilbert Roget II",
          image: "/automatons.png",
        },
        {
          id: "g5srz-8PE58",
          title: "The Illuminate Cult",
          artist: "Wilbert Roget II",
          image: "/illuminate.png",
        },
        {
          id: "xS-Ople7ICQ",
          title: "March of the Helldivers",
          artist: "Wilbert Roget II",
          image: "/HD2.png",
        },
      ],
      player: null,
      volume: 20,
      lastVolume: 20,
      isMuted: false,
      isPlaying: false,
      currentIndex: 0,
      currentSong: {},
      duration: 0,
      currentTime: 0,
      timeInterval: null,
      autoplay: true,
    };
  },
  watch: { //funciones atentas a cambios de variables
    currentIndex(newIndex) {//cuando cambie la variable currentIndex, esta funcion se activa
      this.currentSong = this.playlist[newIndex];
      this.loadVideo(this.currentSong.id);
    },
  },
  mounted() { //Se ejecuta al cargar el componente
    const saved = this.getCookie("autoplay");
    if (saved === undefined) {this.setCookie("autoplay",true)}
    else {
      if(saved === "false"){
        this.autoplay = false;
      } else {
        this.autoplay = true;
      }
    }

    this.currentIndex = this.startIndex;
    this.currentSong = this.playlist[this.currentIndex];
    this.loadYouTubeAPI();
  },
  methods: { //Definicion de funciones
    loadYouTubeAPI() { //carga la API de YouTube
      if (window.YT && window.YT.Player) {
        this.initPlayer();
        return;
      }
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(tag);
      window.onYouTubeIframeAPIReady = this.initPlayer;
    },
    setCookie(name,value){ //Cookies en el cliente
      const date = new Date()
      const expire = new Date(date.getTime() + 365 * 24 * 60 * 60 * 1000).toUTCString();
      document.cookie = `${name}=${value}; path=/; expires=${expire}`;
    },
    getCookie(name){
      const cookies = document.cookie.split('; ');
      const value = cookies.find((cookie) => cookie.trim().startsWith(name+"="))?.split("=")[1];
      return value;
    },
    toggleAutoplay() {
      this.autoplay = !this.autoplay;
      this.setCookie("autoplay", this.autoplay);
    },
    initPlayer() { //crea el reproductor de YouTube dentro de la pagina
      this.player = new window.YT.Player("player-container", {
        height: "0", //sin tamaño porque es solo audio
        width: "0",
        videoId: this.currentSong.id,
        playerVars: { autoplay: 0, controls: 0 },
        events: {
          onReady: (e) => { //cuando el reproductor ya está listo
            e.target.setVolume(this.volume);
            this.duration = e.target.getDuration() || 0;
            this.timeInterval = setInterval(() => { //intervalo que se ejecuta cada 250 ms para mantener la barra de progreso
              if (this.player && this.isPlaying)
                this.currentTime = this.player.getCurrentTime();
            }, 250);
            if (this.autoplay) {
              this.isPlaying = true;
              e.target.playVideo();
            }
          },
          onStateChange: (e) => { //cuando el video cambia de estado:
            if (e.data === 0) this.isPlaying = false;
            else if (e.data === 1) this.isPlaying = true;
            else if (e.data === 2) this.isPlaying = false;
          },
        },
      });
    },
    loadVideo(id) { //cambia de canción en el reproductor y sincroniza todos los valores relacionados con el progreso.
      if (!this.player?.loadVideoById) return;
      this.player.loadVideoById(id);
      this.isPlaying = true;
      this.currentTime = 0;
      this.duration = 0;

      const checkDuration = setInterval(() => { //consigue la duracion del video 200 ms despues de cargar para evitar fallos
        const d = this.player.getDuration();
        if (d && !isNaN(d)) {
          this.duration = d;
          clearInterval(checkDuration);
        }
      }, 200);

      if (this.timeInterval) clearInterval(this.timeInterval); //limpia el antiguo intervalo y crea uno nuevo para el nuevo video
      this.timeInterval = setInterval(() => {
        if (this.player && this.isPlaying)
          this.currentTime = this.player.getCurrentTime();
      }, 250);
    },
    togglePlayPause() {
      if (!this.player) return;
      if (this.isPlaying) this.player.pauseVideo();
      else this.player.playVideo();
      this.isPlaying = !this.isPlaying;
    },
    nextSong() {
      this.currentIndex = (this.currentIndex + 1) % this.playlist.length;
    },
    prevSong() {
      this.currentIndex =
        (this.currentIndex - 1 + this.playlist.length) % this.playlist.length;
    },
    toggleMute() {
      if (!this.player) return;
      if (this.isMuted) {
        this.volume = this.lastVolume || 20;
        this.player.setVolume(this.volume);
        this.isMuted = false;
      } else {
        this.lastVolume = this.volume;
        this.volume = 0;
        this.player.setVolume(0);
        this.isMuted = true;
      }
    },
    changeVolume() {
      if (!this.player) return;

      this.player.setVolume(this.volume);

      if (this.volume === 0) {
        this.isMuted = true;
      } else {
        this.isMuted = false;
        this.lastVolume = this.volume;
      }
    },
    seekVideo() {
      if (this.player) this.player.seekTo(this.currentTime, true);
    },
  },
};
</script>


<style>
.card {
  position: relative;
  width: 290px;
  background: transparent;
  border-radius: 10px;
  padding: 10px;
  font-family: Arial, sans-serif;
  overflow: hidden;
  transition: all 0.3s ease;
}

.top {
  display: flex;
  gap: 10px;
  position: relative;
  z-index: 1;
}

/* Imagen de portada */
.pfp {
  height: 60px;
  width: 60px;
  background-color: #000000;
  border-radius: 5px;
  overflow: hidden;
  flex-shrink: 0;
}

.titles {
  margin-left: 20px;
  margin-top: 10px;
}

.title {
  color: white;
  font-size: 16px;
  font-weight: bold;
}

.author {
  color: #ccc;
  font-size: 12px;
}

/* Controles ocultos por defecto */
.controls-wrapper {
  position: relative;
  margin-top: 5px;
  max-height: 0;
  opacity: 0;
  overflow: hidden;
  transition: all 0.4s ease;
}

.controls-wrapper-image {
  position: absolute;
  inset: 0;
  background: url("/superearth.png") center/cover no-repeat;
  filter: brightness(0.3);
  z-index: 0;
}

/* Cambiamos el indice de los botones a uno mas alto */
.controls-wrapper > *:not(.controls-wrapper-image) {
  position: relative;
  z-index: 1;
}

.card:hover {
  transform: scale(1.05);
  margin-top: 5px;
}

.card:hover .controls-wrapper {
  max-height: 150px;
  padding: 10px;
  border-radius: 5px;
  border: 2px solid #ffe900;
  opacity: 1;
}

.controls {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin: 10px 0;
}

.button {
  border: none;
  background: transparent;
  color: #ffe900;
  font-size: 28px;
  cursor: pointer;
  transition: transform 0.2s;
}

.button:hover { transform: scale(1.15); }
.button:active { transform: scale(0.85); }

.volume {
  width: 98%;
  margin-bottom: 6px;
}

.mute-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 14px;
  color: #ffe900;
  transition: transform 0.2s ease;
}

.mute-btn:hover {
  transform: scale(1.2);
}

.mute-btn:active {
  transform: scale(0.9);
}

.volume-text { color: white; font-size: 14px; }

.volume-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.autoplay-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 2px;
  transition: transform 0.2s ease;
}

.autoplay-btn:hover {
  transform: scale(1.15);
}

.autoplay-btn:active {
  transform: scale(0.85);
}

/* ----- BASE DEL SLIDER ----- */
.slider {
  width: 100%;
  height: 4px;
  border-radius: 2px;
  background: transparent;
  appearance: none;
  outline: none;
  position: relative;
}

/* ======== CHROME ======== */
.slider::-webkit-slider-runnable-track {
  height: 4px;
  background: linear-gradient(
    to right,
    #41639c calc(var(--value) * 1%),
    #5e5e5e calc(var(--value) * 1%)
  );
  border-radius: 2px;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 15px;
  height: 15px;
  border-radius: 50%;
  background: #41639c;
  border: 2px solid #ffe900;
  cursor: pointer;
  margin-top: -6px; /* centra el thumb */
}

/* ======== FIREFOX ======== */
.slider::-moz-range-track {
  height: 4px;
  background: #5e5e5e;
  border-radius: 2px;
}

.slider::-moz-range-progress {
  height: 4px;
  background: #41639c;
  border-radius: 2px;
}

.slider::-moz-range-thumb {
  width: 15px;
  height: 15px;
  border-radius: 50%;
  background: #41639c;
  border: 2px solid #ffe900;
  cursor: pointer;
}

.slider:active::-webkit-slider-thumb,
.slider:active::-moz-range-thumb {
  background: #ffe900;
  border: 2px solid #41639c;
}

/* Contenedor del player oculto */
#player-container { width: 0; height: 0; overflow: hidden; }
</style>