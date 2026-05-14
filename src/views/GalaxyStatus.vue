<template>
  <div class="page-container">
    <Header :startIndex="0"/> 
    <div class="background"></div>

    <main class="content">
      <h1 class="title-blue">Estado de la Guerra Galáctica</h1>
      <h3 class="yellow-text">Monitoreo en tiempo real de los frentes de liberación.</h3>

      <!-- Cargando / Error -->
      <div v-if="isLoading" class="loading-container">
        <div class="spinner"></div>
        <p class="loading-text">Sincronizando...</p>
      </div>

      <div v-else class="dashboard-wrapper">
        
        <!-- PANELES SUPERIORES -->
        <section class="top-panels">
          <div class="panel-box major-order-panel">
            <div class="panel-header">
              <h4>📋 Órdenes Supremas Activas</h4>
              <div v-if="assignments.length > 0" class="timer-badge">
                ⏳ {{ formatTime(assignments[0].expiresIn) }}
              </div>
            </div>
            <div class="panel-content">
              <div v-if="assignments.length === 0" class="no-data">
                No hay Órdenes Supremas activas.
              </div>
              <div v-else class="order-item" v-for="order in assignments" :key="order.id32">
                <h5 class="order-title">{{ order.setting?.overrideTitle || 'Directiva Prioritaria' }}</h5>
                <p class="order-desc">{{ order.setting?.overrideBrief }}</p>
                <div class="order-targets">
                    <span v-for="pIndex in extractPlanetIndices(order)" :key="pIndex" class="planet-tag">
                      📍 {{ getPlanetName(pIndex) }}
                    </span>
                </div>
                <div class="order-footer">
                  <p class="order-task yellow-text">{{ order.setting?.taskDescription }}</p>
                  <div class="reward-box" v-if="order.setting?.reward">
                    <span class="reward-amount">{{ order.setting.reward.amount }}</span>
                    <img src="https://helldiverstrainingmanual.com/images/medals.png" alt="Medals" class="medal-icon">
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="panel-box">
            <div class="panel-header">
              <h4>📡 Feed de Inteligencia</h4>
            </div>
            <div class="panel-content news-feed">
              <div v-for="item in recentNews" :key="item.id" class="news-item">
                <p class="news-text">{{ item.message }}</p>
              </div>
            </div>
          </div>
        </section>

        <!-- LAYOUT DE GUERRA -->
        <div class="war-room-layout">
          <aside class="campaign-list">
             <div v-for="planet in sortedCampaigns" :key="planet.planetIndex" class="campaign-card" :class="{ 'focused-card': focusedPlanetIndex === planet.planetIndex }">
                <div class="card-header">
                  <span class="p-name">{{ planet.name }}</span>
                  <span class="p-percent">{{ planet.percentage.toFixed(2) }}%</span>
                </div>
                <div class="progress-bar-bg">
                  <div class="progress-bar-fill" :style="{ width: planet.percentage + '%' }"></div>
                </div>
                <div class="card-footer">
                  <span :class="['faction-tag', planet.faction.toLowerCase()]">{{ planet.faction }}</span>
                  <span class="p-players">👥 {{ planet.players.toLocaleString() }}</span>
                </div>
                <div class="card-actions">
                  <button @click="focusOnMap(planet)" class="btn-action btn-locate">Localizar</button>
                  <button @click="openDetails(planet)" class="btn-action btn-details">Estadísticas</button>
                </div>
             </div>
          </aside>

          <!-- MAPA ESTILO SVELTE -->
          <section 
            class="map-container map-viewport" 
            :class="{ 'is-dragging': isDragging }"
            :style="{ '--zoom': zoomLevel, '--pan-x': panX, '--pan-y': panY }"
            @mousedown.prevent="startPan" 
            @mousemove="doPan" 
            @mouseup="endPan" 
            @mouseleave="endPan"
          >
            <div class="map-controls">
              <button @click.prevent="adjustZoom(1.5)">+</button>
              <button @click.prevent="resetMap()">Reset</button>
              <button @click.prevent="adjustZoom(0.66)">-</button>
            </div>

            <div class="map-wrapper svelte-like">
              <div class="inner map-inner">
                
                <!-- CAPA SVG (Solo para red y geometría) -->
                <svg class="map-svg-layer" viewBox="-1 -1 2 2">
                  <g class="grid-lines">
                    <circle v-for="r in [0.2, 0.4, 0.6, 0.8, 1.0]" :key="r" cx="0" cy="0" :r="r" class="grid-circle" />
                  </g>
                  <g class="supply-network">
                    <line v-for="(line, i) in supplyLines" :key="'l-'+i" 
                          :x1="line.x1" :y1="line.y1 * -1" 
                          :x2="line.x2" :y2="line.y2 * -1" class="waypoint-line" />
                  </g>
                  <circle cx="0" cy="0" :r="0.03" class="super-earth-dot" />
                </svg>

                <!-- CAPA HTML (Planetas estilo Svelte) -->
                <div class="planets">
                  <button 
                    v-for="planet in sortedCampaigns" 
                    :key="planet.planetIndex"
                    :data-index="planet.planetIndex"
                    :class="[
                      'planet', 
                      planet.faction.toLowerCase(), 
                      { controlled: planet.percentage >= 100 }
                    ]"
                    :style="{ 
                      '--x': planet.coords.x, 
                      '--y': planet.coords.y, 
                      '--percentage': planet.percentage + '%' 
                    }"
                    @click="openDetails(planet)"
                  >
                    <!-- Indicador de localización -->
                    <div v-if="focusedPlanetIndex === planet.planetIndex" class="focus-ring-html"></div>
                    
                    <div class="name">{{ planet.name }}</div>
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>

        <!-- MODAL DE ESTADÍSTICAS DETALLADAS -->
        <div v-if="selectedPlanet" class="modal-overlay" @click.self="closeModal">
          <div class="modal-content expanded-modal">
            <button class="close-btn" @click="closeModal">×</button>
            
            <header class="modal-header-main">
              <h2 class="modal-title">
                {{ selectedPlanet.name }}
                <span class="sector-tag">Sector {{ planetsDb[selectedPlanet.planetIndex]?.sector || 'Desconocido' }}</span>
              </h2>
            </header>

            <div class="modal-body">
              <section class="info-section">
                <h4 class="section-label">Geografía y Clima</h4>
                <div class="biome-box">
                  <strong class="yellow-text">{{ planetsDb[selectedPlanet.planetIndex]?.biome?.slug || 'Tipo Desconocido' }}</strong>
                  <p class="biome-desc">{{ planetsDb[selectedPlanet.planetIndex]?.biome?.description || 'No hay datos de superficie disponibles.' }}</p>
                </div>
                <div class="env-list">
                  <div v-for="env in planetsDb[selectedPlanet.planetIndex]?.environmentals" :key="env.name" class="env-tag">
                    <span class="env-name">⚠️ {{ env.name }}</span>
                    <span class="env-desc">{{ env.description }}</span>
                  </div>
                </div>
              </section>

              <section class="stats-section">
                <h4 class="section-label">Registro de Campaña</h4>
                
                <div v-if="isStatsLoading" class="stats-loading">
                  <div class="spinner"></div>
                  <p>Consultando base de datos galáctica...</p>
                </div>

                <div v-else-if="planetStats" class="stats-grid">
                  <div class="stat-card">
                    <label>Misiones Ganadas</label>
                    <span class="val green">{{ planetStats.missionsWon?.toLocaleString() }}</span>
                  </div>
                  <div class="stat-card">
                    <label>Misiones Fallidas</label>
                    <span class="val red">{{ planetStats.missionsLost?.toLocaleString() }}</span>
                  </div>
                  <div class="stat-card">
                    <label>Bajas de Terminids</label>
                    <span class="val bug">{{ planetStats.bugKills?.toLocaleString() }}</span>
                  </div>
                  <div class="stat-card">
                    <label>Bajas de Automata</label>
                    <span class="val bot">{{ planetStats.automatonKills?.toLocaleString() }}</span>
                  </div>
                  <div class="stat-card">
                    <label>Bajas de Illuminate</label>
                    <span class="val squid">{{ planetStats.illuminateKills?.toLocaleString() }}</span>
                  </div>
                  <div class="stat-card">
                    <label>Bajas de Helldivers</label>
                    <span class="val death">💀 {{ planetStats.deaths?.toLocaleString() }}</span>
                  </div>
                  <div class="stat-card full-width">
                    <label>Fuego Amigo Detectado</label>
                    <span class="val">🎯 {{ planetStats.friendlies?.toLocaleString() }}</span>
                  </div>
                  <div class="stat-card full-width">
                    <label>Precisión de la Campaña</label>
                    <div class="accuracy-bar">
                      <div class="accuracy-fill" :style="{ width: planetStats.accurracy + '%' }"></div>
                      <span>{{ planetStats.accurracy }}%</span>
                    </div>
                  </div>
                </div>
                <div v-else class="no-data">Estadísticas de combate no disponibles.</div>
              </section>
            </div>
          </div>
        </div>
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
      allPlanetsInfo: [],
      planetsDb: {}, 
      news: [],
      assignments: [],
      isLoading: true,
      selectedPlanet: null,
      planetStats: null,
      isStatsLoading: false,
      focusedPlanetIndex: null,
      zoomLevel: 1,
      panX: 0,
      panY: 0,
      isDragging: false,
      lastMouseX: 0,
      lastMouseY: 0
    }
  },
  computed: {
    sortedCampaigns() { return [...this.activeCampaigns].sort((a, b) => b.players - a.players); },
    recentNews() { return [...this.news].reverse().slice(0, 4); },
    supplyLines() {
      const lines = [];
      if (this.allPlanetsInfo.length === 0) return [];
      this.allPlanetsInfo.forEach(planet => {
        if (planet.waypoints) {
          planet.waypoints.forEach(targetIndex => {
            const target = this.allPlanetsInfo.find(p => p.index === targetIndex);
            if (target) {
              lines.push({
                x1: planet.position.x, y1: planet.position.y,
                x2: target.position.x, y2: target.position.y
              });
            }
          });
        }
      });
      return lines;
    }
  },
  methods: {
    async fetchWarData() {
      this.isLoading = true;
      try {
        const [campRes, infoRes, newsRes, assignRes, planetsRes] = await Promise.all([
          fetch('https://helldiverstrainingmanual.com/api/v1/war/campaign'),
          fetch('https://helldiverstrainingmanual.com/api/v1/war/info'),
          fetch('https://helldiverstrainingmanual.com/api/v1/war/news'),
          fetch('https://helldiverstrainingmanual.com/api/v1/war/major-orders'),
          fetch('https://helldiverstrainingmanual.com/api/v1/planets')
        ]);
        
        this.activeCampaigns = await campRes.json();
        const infoData = await infoRes.json();
        this.allPlanetsInfo = infoData.planetInfos;
        this.news = await newsRes.json();
        this.assignments = await assignRes.json();
        this.planetsDb = await planetsRes.json();

        this.activeCampaigns = this.activeCampaigns.map(c => {
          const pInfo = this.allPlanetsInfo.find(p => p.index === c.planetIndex);
          return { ...c, coords: pInfo ? pInfo.position : { x: 0, y: 0 } };
        });
      } catch (e) {
        console.error("Error al obtener datos:", e);
      } finally {
        this.isLoading = false;
      }
    },
    async openDetails(planet) {
      this.selectedPlanet = planet;
      this.isStatsLoading = true;
      this.planetStats = null;
      try {
        const res = await fetch(`https://helldiverstrainingmanual.com/api/v1/war/stats/${planet.planetIndex}`);
        this.planetStats = await res.json();
      } catch (e) {
        console.error("Error cargando stats");
      } finally {
        this.isStatsLoading = false;
      }
    },
    closeModal() {
      this.selectedPlanet = null;
      this.planetStats = null;
    },
    extractPlanetIndices(order) {
      if (!order.setting?.tasks) return [];
      return order.setting.tasks.filter(t => t.values && t.values.length >= 3).map(t => t.values[2]);
    },
    getPlanetName(index) {
      return this.planetsDb[index]?.name || `Sector ${index}`;
    },
    formatTime(seconds) {
      if (!seconds) return "--:--";
      const days = Math.floor(seconds / 86400);
      const hours = Math.floor((seconds % 86400) / 3600);
      const mins = Math.floor((seconds % 3600) / 60);
      return `${days}d ${hours}h ${mins}m`;
    },
    startPan(e) { 
      this.isDragging = true; 
      this.lastMouseX = e.clientX; 
      this.lastMouseY = e.clientY; 
    },
    doPan(e) {
      if (!this.isDragging) return;
      const dx = e.clientX - this.lastMouseX;
      const dy = e.clientY - this.lastMouseY;
      
      // Compensamos la escala visual para que el ratón "enganche" 1:1 el terreno
      this.panX += dx / this.zoomLevel;
      this.panY += dy / this.zoomLevel;
      
      this.lastMouseX = e.clientX;
      this.lastMouseY = e.clientY;
    },
    endPan() { 
      this.isDragging = false; 
    },
    adjustZoom(f) { 
      this.zoomLevel = Math.max(0.5, Math.min(this.zoomLevel * f, 15)); 
    },
    resetMap() { 
      this.zoomLevel = 1; 
      this.panX = 0; 
      this.panY = 0; 
      this.focusedPlanetIndex = null; 
    },
    focusOnMap(p) { 
      this.focusedPlanetIndex = p.planetIndex; 
      this.panX = -(p.coords.x * 400); 
      this.panY = (p.coords.y * 400); 
      this.zoomLevel = 4; 
    }
  },
  mounted() {
    this.fetchWarData();
    setInterval(() => {
      if (this.assignments.length > 0 && this.assignments[0].expiresIn > 0) {
        this.assignments[0].expiresIn -= 60;
      }
    }, 60000);
  }
}
</script>

<style scoped>
/* ESTRUCTURA GENERAL */
.page-container { display: flex; flex-direction: column; min-height: 100vh; font-family: 'Segoe UI', sans-serif; overflow-y: auto; }
.background { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: url("/SE_Background.jpg") center/cover no-repeat; z-index: -1; filter: brightness(0.15); }
.content { flex: 1; margin: 100px 5vw 40px; color: white; }
.title-blue { text-align: center; color: #41639C; letter-spacing: 3px; text-transform: uppercase; margin-bottom: 5px; }
.yellow-text { text-align: center; color: #FFE900; margin-bottom: 30px; }

/* PANELES SUPERIORES */
.top-panels { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-bottom: 30px; }
.panel-box { background: rgba(15, 20, 28, 0.85); border: 1px solid #1f3557; border-top: 3px solid #41639C; border-radius: 4px; display: flex; flex-direction: column; height: 220px; }
.panel-header { background: rgba(31, 53, 87, 0.4); padding: 10px 15px; border-bottom: 1px solid #1f3557; display: flex; justify-content: space-between; align-items: center; }
.panel-header h4 { margin: 0; color: #fff; text-transform: uppercase; font-size: 0.9rem; }
.panel-content { padding: 15px; overflow-y: auto; flex: 1; }
.timer-badge { background: #41639C; padding: 2px 8px; border-radius: 10px; font-size: 0.75rem; font-weight: bold; }

/* FEED NOTICIAS */
.news-item { background: rgba(0,0,0,0.4); padding: 10px; margin-bottom: 10px; border-left: 2px solid #41639C; font-size: 0.85rem; line-height: 1.4; color: #ddd; }

/* LAYOUT GUERRA */
.war-room-layout { display: flex; flex-wrap: wrap; gap: 20px; height: 75vh; min-height: 600px; margin-bottom: 20px; }
.campaign-list { flex: 1; min-width: 320px; height: 100%; overflow-y: auto; display: flex; flex-direction: column; gap: 12px; padding-right: 10px; }
.campaign-card { background: rgba(20, 25, 35, 0.9); padding: 15px; border-left: 4px solid #FFE900; border-right: 1px solid rgba(65, 99, 156, 0.2); }
.focused-card { background: rgba(40, 50, 70, 0.9); border-left-color: white; }

.card-header { display: flex; justify-content: space-between; font-weight: bold; margin-bottom: 10px; }
.p-name { color: #FFE900; font-size: 1.1rem; }
.progress-bar-bg { height: 10px; background: #111; border: 1px solid #333; margin-bottom: 10px; }
.progress-bar-fill { height: 100%; background: #41639C; transition: width 0.5s; }
.card-footer { display: flex; justify-content: space-between; font-size: 0.8rem; margin-bottom: 15px; }

/* BOTONES TARJETAS */
.card-actions { display: flex; gap: 10px; }
.btn-action { flex: 1; padding: 8px 4px; border: 1px solid #41639C; background: rgba(65, 99, 156, 0.1); color: white; font-size: 0.7rem; font-weight: bold; text-transform: uppercase; cursor: pointer; transition: all 0.2s; letter-spacing: 1px; }
.btn-locate:hover { background: #41639C; color: white; box-shadow: 0 0 10px rgba(65,99,156,0.5); }
.btn-details { border-color: #FFE900; color: #FFE900; background: rgba(255,233,0,0.05); }
.btn-details:hover { background: #FFE900; color: #000; box-shadow: 0 0 10px rgba(255,233,0,0.5); }

/* FACCIONES */
.faction-tag { padding: 2px 6px; border-radius: 3px; font-weight: bold; text-transform: uppercase; font-size: 0.7rem; }
.faction-tag.terminid, .faction-tag.terminids { background: #ff9d00; color: black; }
.faction-tag.automaton, .faction-tag.automatons { background: #ff4444; color: white; }
.faction-tag.illuminate, .faction-tag.illuminates { background: #a855f7; color: white; }
.focused-card { 
  background: rgba(65, 99, 156, 0.3) !important; 
  border-left-color: #ffffff !important;
  box-shadow: inset 0 0 15px rgba(255, 233, 0, 0.2);
}

/* --- NUEVO MAPA SVELTE-LIKE --- */

.map-viewport { flex: 2; min-width: 400px; height: 100%; background: radial-gradient(circle, #0a111a 0%, #020406 100%); border: 1px solid #1f3557; position: relative; overflow: hidden; cursor: grab; user-select: none; }
.map-viewport.is-dragging { cursor: grabbing; }

.map-controls { position: absolute; bottom: 20px; right: 20px; display: flex; flex-direction: column; gap: 5px; z-index: 50; }
.map-controls button { width: 35px; height: 35px; background: rgba(15, 20, 28, 0.9); border: 1px solid #41639C; color: white; cursor: pointer; font-weight: bold; transition: background 0.2s; }
.map-controls button:hover { background: #41639C; }

/* Contenedor estático para no bloquear clicks accidentalmente */
.svelte-like { position: absolute; width: 100%; height: 100%; top: 0; left: 0; pointer-events: none; }

.map-inner {
  position: absolute;
  top: 50%; left: 50%;
  width: 800px; height: 800px;
  /* Mantenemos tus transforms actuales */
  transform: translate(calc(-50% + var(--pan-x) * 1px), calc(-50% + var(--pan-y) * 1px)) scale(var(--zoom));
  transform-origin: center;
  pointer-events: auto;
  
  /* NUEVO: Suavizado de movimiento de cámara */
  transition: transform 0.6s cubic-bezier(0.25, 1, 0.5, 1);
}

/* Evitamos la transición mientras el usuario arrastra manualmente */
.is-dragging .map-inner {
  transition: none;
}

/* SVG DE FONDO ESTÁTICO (sólo para líneas) */
.map-svg-layer {
  position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 1; pointer-events: none;
}
.grid-circle { fill: none; stroke: rgba(65, 99, 156, 0.15); stroke-width: 0.005; }
.waypoint-line { stroke: rgba(255, 255, 255, 0.15); stroke-width: 0.003; stroke-dasharray: 0.01; }
.super-earth-dot { fill: #41639C; stroke: #fff; stroke-width: 0.005; }

/* CAPA HTML CON BOTONES SVELTE */
.planets { position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 2; pointer-events: none; }

/* Botón Planeta: 
   --x / --y gestionan su posición. 
   calc(... / var(--zoom)) evita que se vuelva gigante al acercar la cámara */
.planet {
  position: absolute;
  left: calc(50% + (var(--x) * 50%));
  top: calc(50% - (var(--y) * 50%)); /* Eje Y invertido (arriba = positivo) */
  width: calc(18px / var(--zoom));
  height: calc(18px / var(--zoom));
  transform: translate(-50%, -50%);
  border-radius: 50%;
  background: #111;
  border: calc(2px / var(--zoom)) solid #555;
  padding: 0;
  cursor: pointer;
  z-index: 10;
  pointer-events: auto; /* Permite clicks */
  transition: filter 0.2s, z-index 0.2s;
}

.planet:hover { filter: brightness(1.6); z-index: 20; }

/* Colores Facción */
.planet.terminids { background: #ff9d00; border-color: #ffe6a0; box-shadow: 0 0 calc(8px / var(--zoom)) #ff9d00; }
.planet.automatons { background: #ff4444; border-color: #ffbaba; box-shadow: 0 0 calc(8px / var(--zoom)) #ff4444; }
.planet.illuminates, .planet.illuminate { background: #a855f7; border-color: #e9d5ff; box-shadow: 0 0 calc(8px / var(--zoom)) #a855f7; }

/* Nombre del Planeta */
.planet .name {
  position: absolute;
  top: 130%; left: 50%;
  transform: translateX(-50%);
  color: #fff;
  font-size: calc(12px / var(--zoom));
  font-weight: 600;
  white-space: nowrap;
  pointer-events: none;
  text-shadow: 
    1px 1px calc(1px / var(--zoom)) #000, 
    -1px -1px calc(1px / var(--zoom)) #000, 
    0 0 calc(4px / var(--zoom)) rgba(0,0,0,0.9);
}

/* Progreso circular estilo Svelte (mediante background cónico) */
.planet::before {
  content: '';
  position: absolute;
  top: -15%; left: -15%; width: 130%; height: 130%;
  border-radius: 50%;
  background: conic-gradient(rgba(255,255,255,0.5) var(--percentage), transparent 0);
  z-index: -1;
  pointer-events: none;
}

/* Anillo de enfoque cuando se pulsa el botón "Localizar" */
.focus-ring-html {
  position: absolute;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  width: calc(40px / var(--zoom));
  height: calc(40px / var(--zoom));
  border: calc(2px / var(--zoom)) dashed #FFE900;
  border-radius: 50%;
  animation: spin 3s linear infinite;
  pointer-events: none;
}


/* --- MODAL DETALLES --- */
.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.85); z-index: 1000; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px); }
.expanded-modal { width: 95%; max-width: 650px; background: #0a0e14; border: 1px solid #1f3557; border-top: 4px solid #FFE900; padding: 30px; position: relative; max-height: 85vh; overflow-y: auto; box-shadow: 0 0 30px rgba(65, 99, 156, 0.4); }
.sector-tag { display: block; font-size: 0.8rem; color: #41639C; margin-top: 5px; text-transform: uppercase; }
.section-label { text-transform: uppercase; color: #888; font-size: 0.75rem; letter-spacing: 2px; border-bottom: 1px solid #1f3557; padding-bottom: 5px; margin: 25px 0 15px; }

/* ESTADÍSTICAS MODAL */
.stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
.stat-card { background: rgba(255,255,255,0.03); padding: 10px; border: 1px solid rgba(65,99,156,0.2); }
.stat-card label { font-size: 0.6rem; color: #777; text-transform: uppercase; display: block; margin-bottom: 4px; }
.stat-card .val { font-size: 1rem; font-weight: bold; font-family: monospace; }
.val.green { color: #44ff44; }
.val.red { color: #ff4444; }
.val.bug { color: #ff9d00; }
.val.bot { color: #ff4444; }
.val.squid { color: #a855f7; }
.full-width { grid-column: span 2; }

.accuracy-bar { height: 12px; background: #000; position: relative; border: 1px solid #333; margin-top: 5px; }
.accuracy-fill { height: 100%; background: #41639C; transition: width 1s ease-out; }
.accuracy-bar span { position: absolute; width: 100%; text-align: center; font-size: 0.65rem; font-weight: bold; line-height: 12px; }

/* ANIMACIONES */
.spinner { width: 40px; height: 40px; border: 4px solid rgba(255,255,255,0.1); border-top: 4px solid #FFE900; border-radius: 50%; animation: spin 1s linear infinite; margin: 20px auto; }
@keyframes spin { to { transform: translate(-50%, -50%) rotate(360deg); } } /* Update if generic spin is needed */
.close-btn { position: absolute; top: 10px; right: 15px; background: none; border: none; color: white; font-size: 2rem; cursor: pointer; }

@media (max-width: 900px) {
  .war-room-layout { height: auto; }
  .map-container { height: 400px; order: -1; min-width: 100%; }
}
</style>