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
      <input type="range" min="0" :max="duration" step="0.01" v-model="currentTime" @input="seekVideo" class="slider" style="margin-top: 10px" />
      <div class="controls">
        <button class="button" @click="prevSong" title="Anterior">⏮️</button>
        <button class="button" @click="togglePlayPause" title="Play/Pausa">
          {{ isPlaying ? '⏸️' : '▶️' }}
        </button>
        <button class="button" @click="nextSong" title="Siguiente">⏭️</button>
      </div>

      <div class="volume">
        <label>🔊: {{ volume }}%</label>
        <input type="range" min="0" max="100" v-model="volume" @input="changeVolume" class="slider" />
      </div>
    </div>
    <!-- Contenedor del reproductor de YouTube oculto -->
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
      ],
      player: null,
      volume: 50,
      isPlaying: false,
      currentIndex: 0,
      currentSong: {},
      duration: 0,
      currentTime: 0,
      timeInterval: null,
    };
  },
  watch: { //funciones atentas a cambios de variables
    currentIndex(newIndex) {
      this.currentSong = this.playlist[newIndex];
      this.loadVideo(this.currentSong.id);
    },
  },
  mounted() { //Se ejecuta al cargar el componente
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

      const checkDuration = setInterval(() => {
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
    changeVolume() {
      if (this.player) this.player.setVolume(this.volume);
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
  margin-top: 5px;
  max-height: 0;
  opacity: 0;
  overflow: hidden;
  transition: all 0.4s ease;
}

.card:hover .controls-wrapper {
  max-height: 150px;
  background: #2c2c2c;
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

.volume label { color: white; font-size: 14px; }

.slider {
  width: 100%;
  margin-top: 5px;
  height: 4px;
  background-color: #41639c;
  border-radius: 2px;
  appearance: none;
}

/* Estilo del slider chrome */
.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 15px;
  height: 15px; 
  border-radius: 50%;
  background: #41639c;
  border: 2px solid #ffe900;
  cursor: pointer;
}

.slider::-webkit-slider-thumb:active { background: #ffe900; border: 2px solid #41639c; }
.slider::-webkit-slider-track { background: #5e5e5e; height: 4px; border-radius: 2px; }
.slider::-webkit-slider-progress { background: #41639c; height: 4px; border-radius: 2px; }

/* Estilo del slider firefox*/
.slider::-moz-range-thumb {
  width: 15px;
  height: 15px; 
  border-radius: 50%;
  background: #41639c;
  border: 2px solid #ffe900;
  cursor: pointer;
  transition: 0.3 ease;
}

.slider::-moz-range-thumb:active { background: #ffe900; border: 2px solid #41639c; }
.slider::-moz-range-track { background: #5e5e5e; height: 4px; border-radius: 2px; }
.slider::-moz-range-progress { background: #41639c; height: 4px; border-radius: 2px; }

/* Contenedor del player oculto */
#player-container { width: 0; height: 0; overflow: hidden; }
</style>