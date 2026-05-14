<template>
  <div class="page-container">
    <Header :startIndex="2"/> <div class="background"></div>

    <main class="content">
      <h1 class="title-blue">Estado de la Guerra Galáctica</h1>
      <h3 class="yellow-text">Monitoreo en tiempo real de los frentes de liberación.</h3>

      <div v-if="isLoading" class="loading-container">
        <svg width="50" height="50" viewBox="0 0 50 50" fill="none">
          <circle cx="25" cy="25" r="20" stroke="#FFE900" stroke-width="5" stroke-linecap="round" stroke-dasharray="31.4 31.4">
            <animateTransform attributeName="transform" type="rotate" from="0 25 25" to="360 25 25" dur="1s" repeatCount="indefinite"/>
          </circle>
        </svg>
        <p class="loading-text">Sincronizando con el Comando Espacial...</p>
      </div>

      <div v-else-if="apiError" class="no-data">
        <p>No se ha podido establecer conexión con Supertierra.<br>La democracia gestionada está trabajando para solucionarlo.</p>
        <button @click="fetchWarData" class="retry-btn">Reintentar Transmisión</button>
      </div>

      <div v-else class="war-room-layout">
        
        <aside class="campaign-list">
          <div v-for="planet in sortedCampaigns" :key="planet.planetIndex" class="campaign-card">
            <div class="card-header">
              <span class="p-name">{{ planet.name }}</span>
              <span class="p-percent">{{ planet.percentage.toFixed(2) }}%</span>
            </div>
            
            <div class="progress-bar-bg">
              <div class="progress-bar-fill" :style="{ width: planet.percentage + '%' }"></div>
            </div>
            
            <div class="card-footer">
              <span :class="['faction-tag', planet.faction.toLowerCase()]">{{ planet.faction }}</span>
              <span class="p-players">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" style="vertical-align: text-top; margin-right: 4px;">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
                {{ planet.players.toLocaleString() }}
              </span>
            </div>
          </div>
        </aside>

        <section class="map-container">
          <svg viewBox="-1.2 -1.2 2.4 2.4" class="galaxy-svg">
            <circle cx="0" cy="0" r="0.3" class="grid-line" />
            <circle cx="0" cy="0" r="0.6" class="grid-line" />
            <circle cx="0" cy="0" r="0.9" class="grid-line" />
            <line x1="-1.2" y1="0" x2="1.2" y2="0" class="grid-line" />
            <line x1="0" y1="-1.2" x2="0" y2="1.2" class="grid-line" />

            <g v-for="planet in sortedCampaigns" :key="'map-' + planet.planetIndex">
              <circle 
                :cx="planet.coords.x" 
                :cy="planet.coords.y * -1" 
                r="0.04" 
                :class="['pulse-ring', planet.faction.toLowerCase()]" 
              />
              <circle 
                :cx="planet.coords.x" 
                :cy="planet.coords.y * -1" 
                r="0.02" 
                :class="['planet-dot', planet.faction.toLowerCase()]" 
              />
              <text 
                :x="planet.coords.x + 0.04" 
                :y="(planet.coords.y * -1) + 0.01" 
                class="planet-label">
                {{ planet.name }}
              </text>
            </g>

            <circle cx="0" cy="0" r="0.035" fill="#41639C" stroke="white" stroke-width="0.01" class="super-earth" />
            <text x="0.05" y="-0.04" class="super-earth-label">Supertierra</text>
          </svg>
        </section>
      </div>
    </main>

    <Footer />
  </div>
</template>

<script>
import Header from '../components/Header.vue'
import Footer from '../components/Footer.vue'

export default {
  name: 'WarStatus',
  components: { Header, Footer },
  data() {
    return {
      activeCampaigns: [],
      isLoading: true,
      apiError: false
    }
  },
  computed: {
    // Ordenamos los planetas por cantidad de jugadores (de mayor a menor)
    sortedCampaigns() {
      return [...this.activeCampaigns].sort((a, b) => b.players - a.players);
    }
  },
  methods: {
    async fetchWarData() {
      this.isLoading = true;
      this.apiError = false;
      
      try {
        const fetchConfig = { method: 'GET', headers: { 'Accept': 'application/json' } };
        
        // 1. Obtener datos en tiempo real de las campañas
        const campRes = await fetch('https://helldiverstrainingmanual.com/api/v1/war/campaign', fetchConfig);
        if (!campRes.ok) throw new Error("Fallo en la API de campañas");
        const campaigns = await campRes.json();

        // 2. Obtener datos estáticos (para las coordenadas X e Y de los planetas)
        const infoRes = await fetch('https://helldiverstrainingmanual.com/api/v1/war/info', fetchConfig);
        if (!infoRes.ok) throw new Error("Fallo en la API de información estática");
        const infoData = await infoRes.json();

        // 3. Cruzar los datos usando el planetIndex
        this.activeCampaigns = campaigns.map(c => {
          const planetStaticInfo = infoData.planetInfos.find(p => p.index === c.planetIndex);
          return {
            ...c,
            coords: planetStaticInfo ? planetStaticInfo.position : { x: 0, y: 0 }
          };
        });

      } catch (error) {
        console.error("Error al obtener los datos de guerra:", error);
        this.apiError = true;
      } finally {
        this.isLoading = false;
      }
    }
  },
  mounted() {
    this.fetchWarData();
  }
}
</script>

<style scoped>
/* ESTRUCTURA GENERAL (Heredada de tu estilo) */
.page-container { display: flex; flex-direction: column; min-height: 100vh; }
.background {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background: url("/SE_Background.jpg") center/cover no-repeat;
  z-index: -1; filter: brightness(0.3);
}
.content { position: relative; z-index: 1; flex: 1; margin: 100px 75px; margin-bottom: 80px; color: white; }
.title-blue { text-align: center; color: #41639C; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 2px; }
.yellow-text { text-align: center; color: #FFE900; margin-bottom: 40px; }

/* ESTADOS DE CARGA Y ERROR */
.loading-container { text-align: center; margin-top: 40px; }
.loading-text { font-size: 18px; color: #FFE900; animation: blink 1.5s infinite; margin-top: 15px; }
.no-data { text-align: center; margin-top: 30px; font-size: 18px; color: #ff4444; }
.retry-btn { 
  margin-top: 20px; padding: 10px 20px; background: #FFE900; color: #000; 
  border: none; border-radius: 5px; font-weight: bold; cursor: pointer; transition: 0.3s;
}
.retry-btn:hover { background: #e0cc00; transform: scale(1.05); }

/* LAYOUT DE LA SALA DE GUERRA */
.war-room-layout {
  display: flex;
  gap: 30px;
  height: 65vh;
  min-height: 500px;
}

/* PANEL IZQUIERDO: LISTA */
.campaign-list {
  width: 380px;
  overflow-y: auto;
  padding-right: 15px;
  display: flex;
  flex-direction: column;
  gap: 15px;
}
.campaign-list::-webkit-scrollbar { width: 8px; }
.campaign-list::-webkit-scrollbar-track { background: #1f2833; border-radius: 4px; }
.campaign-list::-webkit-scrollbar-thumb { background: #41639C; border-radius: 4px; }

.campaign-card {
  background-color: #1f2833;
  border-radius: 10px;
  padding: 15px;
  border-left: 5px solid #FFE900;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  transition: transform 0.2s ease, background-color 0.2s ease;
}
.campaign-card:hover { transform: translateX(5px); background-color: #2a3542; }

.card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.p-name { font-size: 18px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; }
.p-percent { color: #FFE900; font-weight: bold; font-family: monospace; font-size: 1.1rem; }

.progress-bar-bg { background: #0b0e12; height: 10px; border-radius: 5px; overflow: hidden; margin-bottom: 12px; }
.progress-bar-fill { height: 100%; background: #FFE900; box-shadow: 0 0 10px rgba(255, 233, 0, 0.5); transition: width 1s ease-in-out; }

.card-footer { display: flex; justify-content: space-between; align-items: center; }
.p-players { font-family: monospace; font-size: 1rem; color: #ccc; }

/* ETIQUETAS DE FACCIONES */
.faction-tag { font-size: 0.75rem; padding: 3px 8px; border-radius: 4px; text-transform: uppercase; font-weight: bold; }
.terminids { background: #ff9d0022; color: #ff9d00; border: 1px solid #ff9d00; fill: #ff9d00; }
.automatons { background: #ff444422; color: #ff4444; border: 1px solid #ff4444; fill: #ff4444; }
.illuminate { background: #b044ff22; color: #b044ff; border: 1px solid #b044ff; fill: #b044ff; } /* Por si acaso en el futuro ;) */

/* PANEL DERECHO: MAPA */
.map-container {
  flex: 1;
  background-color: #0b0e12;
  border-radius: 10px;
  border: 1px solid #1f2833;
  box-shadow: inset 0 0 50px rgba(0,0,0,0.8), 0 4px 8px rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
}

.galaxy-svg { width: 95%; height: 95%; }
.grid-line { fill: none; stroke: rgba(65, 99, 156, 0.3); stroke-width: 0.005; }

.planet-dot { stroke: #0b0e12; stroke-width: 0.005; }
.planet-label { 
  fill: #fff; font-size: 0.04px; font-family: sans-serif; 
  text-shadow: 0 0 2px #000, 0 0 2px #000; pointer-events: none; 
}

.super-earth { filter: drop-shadow(0 0 5px #41639C); }
.super-earth-label { fill: #41639C; font-size: 0.04px; font-weight: bold; text-shadow: 0 0 2px #000; }

/* ANIMACIONES */
@keyframes blink { 50% { opacity: 0.5; } }

@keyframes radar-pulse {
  0% { transform: scale(0.5); opacity: 0.8; }
  100% { transform: scale(2.5); opacity: 0; }
}

.pulse-ring {
  transform-origin: center;
  transform-box: fill-box;
  animation: radar-pulse 2s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
  opacity: 0;
}

/* RESPONSIVE */
@media (max-width: 1024px) {
  .war-room-layout { flex-direction: column-reverse; height: auto; }
  .campaign-list { width: 100%; height: 400px; padding-right: 0; }
  .map-container { height: 400px; }
  .content { margin: 100px 20px; }
}
</style>