<template>
  <header class="header">
    <div class="header-content" @click="goToUrl()">
      <img src="/superearth2.png" alt="Super Earth Logo" class="logo" />
      <h1 class="title">Super Earth DB</h1>
    </div>

    <!-- Aquí agregamos el reproductor -->
    <div class="player-container">
      <AudioPlayer :startIndex="startIndex"/>
    </div>
  </header>
</template>

<script>
import AudioPlayer from './AudioPlayer.vue';

export default {
  name: "Header",
  props: {
    startIndex: { type: Number,  default: 0 }
  },
  components: { AudioPlayer },
  methods: {
    goToUrl() {
      this.$router.push(`/`);
    },
  },
};
</script>

<style scoped>
.header {
  position: fixed;
  z-index: 2;
  width: 100%;
  background-color: #1f2833;
  color: #ffe900;
  padding: 10px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 2px solid #41639c;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.header-content {
  display: flex;
  align-items: center;
}

.logo {
  width: 60px;
  height: 60px;
  object-fit: contain;
  cursor: pointer;
  transition: transform 0.2s ease;
  will-change: transform;
  backface-visibility: hidden;
}

.logo:hover {
  transform: scale(1.1);
}

.logo:active {
  transform: scale(0.9);
}

.title {
  margin-left: 15px;
  font-size: 24px;
  font-weight: bold;
  color: #ffe900;
  letter-spacing: 1px;
  text-transform: uppercase;
}

.player-container {
  position: absolute; /* Lo saca del flujo del flexbox */
  right: 20px;      
  top: 00%;         
  z-index: 10;       
}

/* Aseguramos que no afecte el tamaño del header */
.player-container > * {
  pointer-events: auto;
}
</style>
