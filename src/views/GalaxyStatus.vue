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
        
        <!-- PANELES SUPERIORES (ESTILO SVELTE INTEGRADO) -->
        <section class="top-panels">
          
          <!-- PANEL ÓRDENES SUPREMAS -->
          <div class="panel-box major-order-panel">
            <div class="panel-header">
              <h4>📋 Órdenes Supremas Activas</h4>
            </div>
            <div class="panel-content items svelte-1wfbp8s">
              <div v-if="assignments.length === 0" class="no-data">
                No hay Órdenes Supremas activas.
              </div>
              <div v-else class="item svelte-1wfbp8s" v-for="order in assignments" :key="order.id32">
                <h5 class="svelte-1wfbp8s">
                  <span class="order-title-text">{{ order.setting?.overrideTitle || 'Directiva Prioritaria' }}</span>
                  <div v-if="order.expiresIn" class="time svelte-1wfbp8s">
                    {{ formatTime(order.expiresIn) }}
                  </div>
                </h5>
                
                <p>{{ order.setting?.overrideBrief }}</p>
                <p class="light svelte-1wfbp8s">{{ order.setting?.taskDescription }}</p>
                
                <!-- Tareas de planetas estilo Svelte -->
                <div class="tasks svelte-1wfbp8s">
                  <div 
                    v-for="pIndex in extractPlanetIndices(order)" 
                    :key="pIndex" 
                    class="task svelte-1wfbp8s" 
                    :class="{ incomplete: !isPlanetControlled(pIndex) }"
                  >
                    <div>
                      <button 
                        @click.prevent="focusByPlanetIndex(pIndex)" 
                        aria-label="Locate planet on map" 
                        class="svelte-ndwnq1"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" height="16" width="16" viewBox="0 -960 960 960">
                          <path fill="currentColor" d="M480-480q33 0 56.5-23.5T560-560q0-33-23.5-56.5T480-640q-33 0-56.5 23.5T400-560q0 33 23.5 56.5T480-480Zm0 294q122-112 181-203.5T720-552q0-109-69.5-178.5T480-800q-101 0-170.5 69.5T240-552q0 71 59 162.5T480-186Zm0 106Q319-217 239.5-334.5T160-552q0-150 96.5-239T480-880q127 0 223.5 89T800-552q0 100-79.5 217.5T480-80Zm0-480Z"></path>
                        </svg>
                      </button>
                      {{ getPlanetName(pIndex) }}
                    </div>
                    <small class="svelte-1wfbp8s">{{ isPlanetControlled(pIndex) ? 'Controlled' : 'Incomplete' }}</small>
                  </div>
                </div>
                
                <!-- Recompensa estilo Svelte -->
                <div class="reward svelte-1wfbp8s" v-if="order.setting?.reward">
                  Reward: <strong class="svelte-1wfbp8s">{{ order.setting.reward.amount }} Medals</strong>
                </div>
              </div>
            </div>
          </div>

          <!-- PANEL FEED DE INTELIGENCIA -->
          <div class="panel-box">
            <div class="panel-header">
              <h4>📡 Feed de Inteligencia</h4>
            </div>
            <div class="panel-content items news-feed">
              <div 
                v-for="(item, index) in processedNews" 
                :key="index" 
                class="item" 
                :class="item.isCampaignEvent ? 'svelte-1cw9f40' : 'svelte-3k33f8'"
              >
                <!-- Render para Noticias / Dispatches -->
                <template v-if="!item.isCampaignEvent">
                  <h5 class="svelte-3k33f8" v-if="item.title">{{ item.title }}</h5>
                  <div class="date svelte-3k33f8">{{ item.formattedDate }}</div>
                  <div class="news-text" v-html="item.parsedMessage"></div>
                </template>
                
                <!-- Render para Eventos de Campaña (Conquistas) -->
                <template v-else>
                  <div class="date svelte-1cw9f40">{{ item.formattedDate }}</div>
                  <div class="news-text" v-html="item.parsedMessage"></div>
                </template>
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
                    <span class="val green">{{ (planetStats.missionsWon || 0).toLocaleString() }}</span>
                  </div>
                  <div class="stat-card">
                    <label>Misiones Fallidas</label>
                    <span class="val red">{{ (planetStats.missionsLost || 0).toLocaleString() }}</span>
                  </div>
                  <div class="stat-card">
                    <label>Bajas de Terminids</label>
                    <span class="val bug">{{ (planetStats.terminidKills || planetStats.bugKills || 0).toLocaleString() }}</span>
                  </div>
                  <div class="stat-card">
                    <label>Bajas de Automata</label>
                    <span class="val bot">{{ (planetStats.automatonKills || 0).toLocaleString() }}</span>
                  </div>
                  <div class="stat-card">
                    <label>Bajas de Illuminate</label>
                    <span class="val squid">{{ (planetStats.illuminateKills || 0).toLocaleString() }}</span>
                  </div>
                  <div class="stat-card">
                    <label>Bajas de Helldivers</label>
                    <span class="val death">💀 {{ (planetStats.deaths || 0).toLocaleString() }}</span>
                  </div>
                  <div class="stat-card full-width">
                    <label>Fuego Amigo Detectado</label>
                    <span class="val">🎯 {{ (planetStats.friendlies || 0).toLocaleString() }}</span>
                  </div>
                  <div class="stat-card full-width" v-if="planetStats.accurracy">
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
    processedNews() {
      if (!this.news) return [];
      return [...this.news].reverse().slice(0, 8).map(item => {
        let d = new Date();
        if (item.published) {
          d = typeof item.published === 'number' 
            ? new Date(item.published * 1000) 
            : new Date(item.published);
        }
        const formattedDate = d.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' });

        let rawMsg = item.message || '';
        let isCampaignEvent = rawMsg.includes(" taken by ") || item.type === 1;
        
        let parsedMessage = rawMsg
          .replace(/<i=1>/g, '<span class="highlight-text">')
          .replace(/<\/i=1>/g, '</span>')
          .replace(/\n/g, '<br>');

        let title = item.title;
        if (!title && !isCampaignEvent) {
          const firstBr = parsedMessage.indexOf('<br>');
          if (firstBr !== -1) {
            const firstLine = parsedMessage.substring(0, firstBr).trim();
            if (firstLine === firstLine.toUpperCase() && firstLine.length < 50) {
              title = firstLine;
              parsedMessage = parsedMessage.substring(firstBr).replace(/^(<br\s*\/?>)+/, '').trim();
            }
          }
        }

        if (isCampaignEvent) {
          parsedMessage = parsedMessage
            .replace(/Super Earth/g, '<strong class="super-earth svelte-1cw9f40">Super Earth</strong>')
            .replace(/Terminids/g, '<strong class="terminids svelte-1cw9f40">Terminids</strong>')
            .replace(/Automatons/g, '<strong class="automatons svelte-1cw9f40">Automatons</strong>')
            .replace(/Illuminate/g, '<strong class="illuminate svelte-1cw9f40">Illuminate</strong>');
          
          parsedMessage = parsedMessage.replace(/^([\w\s'-]+) was taken by/, '<strong class="svelte-1cw9f40">$1</strong> was taken by');
        }

        return { ...item, formattedDate, parsedMessage, isCampaignEvent, title };
      });
    },
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
    // MODIFICADO: Añadido parámetro 'silent' para las actualizaciones en segundo plano
    async fetchWarData(silent = false) {
      if (!silent) this.isLoading = true;
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
        if (!silent) this.isLoading = false;
      }
    },
    async openDetails(planet) {
      this.selectedPlanet = planet;
      this.isStatsLoading = true;
      this.planetStats = null;
      
      try {
        const res = await fetch(`https://helldiverstrainingmanual.com/api/v1/war/stats/${planet.planetIndex}`);
        if (!res.ok) throw new Error("Error en el servidor al obtener estadísticas");
        const data = await res.json();
        this.planetStats = data;
      } catch (e) {
        console.error("Estadísticas inaccesibles:", e);
        this.planetStats = null;
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
    isPlanetControlled(index) {
      const campaign = this.activeCampaigns.find(c => c.planetIndex === index);
      if (!campaign) return true;
      return campaign.percentage >= 100;
    },
    focusByPlanetIndex(index) {
      const campaign = this.activeCampaigns.find(c => c.planetIndex === index);
      if (campaign) {
        this.focusOnMap(campaign);
      } else {
        const pInfo = this.allPlanetsInfo.find(p => p.index === index);
        if (pInfo) {
          this.focusOnMap({ planetIndex: index, coords: pInfo.position });
        }
      }
    },
    formatTime(seconds) {
      if (!seconds) return "--:--";
      const days = Math.floor(seconds / 86400);
      const hours = Math.floor((seconds % 86400) / 3600);
      return `${days}D ${hours}H`;
    },
    startPan(e) { this.isDragging = true; this.lastMouseX = e.clientX; this.lastMouseY = e.clientY; },
    doPan(e) {
      if (!this.isDragging) return;
      const dx = e.clientX - this.lastMouseX;
      const dy = e.clientY - this.lastMouseY;
      this.panX += dx / this.zoomLevel;
      this.panY += dy / this.zoomLevel;
      this.lastMouseX = e.clientX;
      this.lastMouseY = e.clientY;
    },
    endPan() { this.isDragging = false; },
    adjustZoom(f) { this.zoomLevel = Math.max(0.5, Math.min(this.zoomLevel * f, 15)); },
    resetMap() { this.zoomLevel = 1; this.panX = 0; this.panY = 0; this.focusedPlanetIndex = null; },
    focusOnMap(p) { 
      this.focusedPlanetIndex = p.planetIndex; 
      this.panX = -(p.coords.x * 400); 
      this.panY = (p.coords.y * 400); 
      this.zoomLevel = 4; 
    }
  },
  mounted() {
    this.fetchWarData();

    // 2. Loop de actualización de la API cada 60 segundos
    this.apiInterval = setInterval(() => {
      this.fetchWarData(true);
    }, 60000);

    // 3. Loop local para decrementar el tiempo de la Orden Suprema cada minuto
    this.timerInterval = setInterval(() => {
      if (this.assignments.length > 0 && this.assignments[0].expiresIn > 0) {
        this.assignments[0].expiresIn -= 60;
      }
    }, 60000);
  },
  beforeDestroy() {
    clearInterval(this.apiInterval);
    clearInterval(this.timerInterval);
  },
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
.panel-box { background: rgba(15, 20, 28, 0.85); border: 1px solid #1f3557; border-top: 3px solid #41639C; border-radius: 4px; display: flex; flex-direction: column; height: 320px; }
.panel-header { background: rgba(31, 53, 87, 0.4); padding: 10px 15px; border-bottom: 1px solid #1f3557; display: flex; justify-content: space-between; align-items: center; }
.panel-header h4 { margin: 0; color: #fff; text-transform: uppercase; font-size: 0.9rem; }
.panel-content { padding: 15px; overflow-y: auto; flex: 1; }

/* CLASES SVELTE - ORDENES SUPREMAS */
.items.svelte-1wfbp8s { display: flex; flex-direction: column; gap: 15px; }
.item.svelte-1wfbp8s { background: rgba(5, 8, 12, 0.5); border: 1px solid rgba(65, 99, 156, 0.2); padding: 15px; border-radius: 4px; }
h5.svelte-1wfbp8s { margin: 0 0 10px 0; display: flex; justify-content: space-between; align-items: center; font-size: 0.95rem; color: #fff; text-transform: uppercase; letter-spacing: 1px; }
.order-title-text { max-width: 75%; overflow: hidden; text-overflow: ellipsis; }
.time.svelte-1wfbp8s { background: #FFE900; color: #000; padding: 2px 6px; font-weight: bold; font-family: monospace; font-size: 0.75rem; border-radius: 2px; white-space: nowrap; }
.light.svelte-1wfbp8s { color: #FFE900; font-size: 0.85rem; margin: 8px 0 12px; font-weight: 500; }
.tasks.svelte-1wfbp8s { display: flex; flex-direction: column; gap: 6px; margin: 12px 0; }
.task.svelte-1wfbp8s { display: flex; justify-content: space-between; align-items: center; background: rgba(65, 99, 156, 0.1); padding: 6px 12px; border-left: 3px solid #44ff44; font-size: 0.85rem; }
.task.svelte-1wfbp8s.incomplete { border-left-color: #ff4444; background: rgba(255, 68, 68, 0.03); }
.task.svelte-1wfbp8s div { display: flex; align-items: center; gap: 8px; }

.svelte-ndwnq1 { background: none; border: none; color: #FFE900; cursor: pointer; padding: 2px; display: flex; align-items: center; justify-content: center; transition: transform 0.2s, color 0.2s; }
.svelte-ndwnq1:hover { transform: scale(1.2); color: #fff; }
.task.svelte-1wfbp8s small { font-family: monospace; font-weight: bold; text-transform: uppercase; font-size: 0.75rem; }
.task.svelte-1wfbp8s:not(.incomplete) small { color: #44ff44; }
.task.svelte-1wfbp8s.incomplete small { color: #ff4444; }
.reward.svelte-1wfbp8s { font-size: 0.85rem; color: #aaa; border-top: 1px solid rgba(65, 99, 156, 0.15); padding-top: 10px; margin-top: 10px; text-transform: uppercase; letter-spacing: 0.5px; }
.reward.svelte-1wfbp8s strong { color: #FFE900; font-size: 0.85rem; }

/* NUEVAS CLASES SVELTE - FEED INTELIGENCIA */
.item.svelte-3k33f8 { background: rgba(5, 8, 12, 0.5); border: 1px solid rgba(65, 99, 156, 0.2); padding: 15px; border-radius: 4px; margin-bottom: 10px; }
h5.svelte-3k33f8 { margin: 0 0 5px 0; font-size: 0.95rem; color: #fff; text-transform: uppercase; }
.date.svelte-3k33f8, .date.svelte-1cw9f40 { color: #aaa; font-size: 0.75rem; text-transform: uppercase; margin-bottom: 8px; font-family: monospace; }
.item.svelte-1cw9f40 { background: rgba(15, 20, 28, 0.6); border-left: 3px solid #FFE900; padding: 10px 15px; margin-bottom: 10px; font-size: 0.85rem; border-radius: 2px; }

/* Estilos inyectados por v-html en el feed */
:deep(.highlight-text) { color: #FFE900; font-style: italic; font-weight: 500; }
:deep(.super-earth.svelte-1cw9f40) { color: #41639C; font-weight: bold; }
:deep(.terminids.svelte-1cw9f40) { color: #ff9d00; font-weight: bold; }
:deep(.automatons.svelte-1cw9f40) { color: #ff4444; font-weight: bold; }
:deep(.illuminate.svelte-1cw9f40) { color: #a855f7; font-weight: bold; }

/* LAYOUT GUERRA */
.war-room-layout { display: flex; flex-wrap: wrap; gap: 20px; height: 75vh; min-height: 600px; margin-bottom: 20px; }
.campaign-list { flex: 1; min-width: 320px; height: 100%; overflow-y: auto; display: flex; flex-direction: column; gap: 12px; padding-right: 10px; }
.campaign-card { background: rgba(20, 25, 35, 0.9); padding: 15px; border-left: 4px solid #FFE900; border-right: 1px solid rgba(65, 99, 156, 0.2); }

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
.focused-card { background: rgba(65, 99, 156, 0.3) !important; border-left-color: #ffffff !important; box-shadow: inset 0 0 15px rgba(255, 233, 0, 0.2); }

/* MAPA */
.map-viewport { flex: 2; min-width: 400px; height: 100%; background: radial-gradient(circle, #0a111a 0%, #020406 100%); border: 1px solid #1f3557; position: relative; overflow: hidden; cursor: grab; user-select: none; }
.map-viewport.is-dragging { cursor: grabbing; }

.map-controls { position: absolute; bottom: 20px; right: 20px; display: flex; flex-direction: column; gap: 5px; z-index: 50; }
.map-controls button { width: 35px; height: 35px; background: rgba(15, 20, 28, 0.9); border: 1px solid #41639C; color: white; cursor: pointer; font-weight: bold; transition: background 0.2s; }
.map-controls button:hover { background: #41639C; }

.svelte-like { position: absolute; width: 100%; height: 100%; top: 0; left: 0; pointer-events: none; }
.map-inner { position: absolute; top: 50%; left: 50%; width: 800px; height: 800px; transform: translate(-50%, -50%) scale(var(--zoom)) translate(calc(var(--pan-x) * 1px), calc(var(--pan-y) * 1px)); transform-origin: center; pointer-events: auto; transition: transform 0.6s cubic-bezier(0.25, 1, 0.5, 1); }
.is-dragging .map-inner { transition: none; }

.map-svg-layer { position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 1; pointer-events: none; }
.grid-circle { fill: none; stroke: rgba(65, 99, 156, 0.15); stroke-width: 0.005; }
.waypoint-line { stroke: rgba(255, 255, 255, 0.15); stroke-width: 0.003; stroke-dasharray: 0.01; }
.super-earth-dot { fill: #41639C; stroke: #fff; stroke-width: 0.005; }

.planets { position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 2; pointer-events: none; }
.planet { position: absolute; left: calc(50% + (var(--x) * 50%)); top: calc(50% - (var(--y) * 50%)); width: calc(18px / var(--zoom)); height: calc(18px / var(--zoom)); transform: translate(-50%, -50%); border-radius: 50%; background: #111; border: calc(2px / var(--zoom)) solid #555; padding: 0; cursor: pointer; z-index: 10; pointer-events: auto; transition: filter 0.2s, z-index 0.2s; }
.planet:hover { filter: brightness(1.6); z-index: 20; }
.planet.terminids { background: #ff9d00; border-color: #ffe6a0; box-shadow: 0 0 calc(8px / var(--zoom)) #ff9d00; }
.planet.automatons { background: #ff4444; border-color: #ffbaba; box-shadow: 0 0 calc(8px / var(--zoom)) #ff4444; }
.planet.illuminates, .planet.illuminate { background: #a855f7; border-color: #e9d5ff; box-shadow: 0 0 calc(8px / var(--zoom)) #a855f7; }
.planet .name { position: absolute; top: 130%; left: 50%; transform: translateX(-50%); color: #fff; font-size: calc(12px / var(--zoom)); font-weight: 600; white-space: nowrap; pointer-events: none; text-shadow: 1px 1px calc(1px / var(--zoom)) #000, -1px -1px calc(1px / var(--zoom)) #000, 0 0 calc(4px / var(--zoom)) rgba(0,0,0,0.9); }
.planet::before { content: ''; position: absolute; top: -15%; left: -15%; width: 130%; height: 130%; border-radius: 50%; background: conic-gradient(rgba(255,255,255,0.5) var(--percentage), transparent 0); z-index: -1; pointer-events: none; }
.focus-ring-html { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: calc(40px / var(--zoom)); height: calc(40px / var(--zoom)); border: calc(2px / var(--zoom)) dashed #FFE900; border-radius: 50%; animation: spin-ring 3s linear infinite; pointer-events: none; }
@keyframes spin-ring { to { transform: translate(-50%, -50%) rotate(360deg); } }

/* MODAL DETALLES */
.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.85); z-index: 1000; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px); }
.expanded-modal { width: 95%; max-width: 650px; background: #0a0e14; border: 1px solid #1f3557; border-top: 4px solid #FFE900; padding: 30px; position: relative; max-height: 85vh; overflow-y: auto; box-shadow: 0 0 30px rgba(65, 99, 156, 0.4); }
.sector-tag { display: block; font-size: 0.8rem; color: #41639C; margin-top: 5px; text-transform: uppercase; }
.section-label { text-transform: uppercase; color: #888; font-size: 0.75rem; letter-spacing: 2px; border-bottom: 1px solid #1f3557; padding-bottom: 5px; margin: 25px 0 15px; }

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

.spinner { width: 40px; height: 40px; border: 4px solid rgba(255,255,255,0.1); border-top: 4px solid #FFE900; border-radius: 50%; animation: spin 1s linear infinite; margin: 20px auto; }
@keyframes spin { to { transform: rotate(360deg); } }
.close-btn { position: absolute; top: 10px; right: 15px; background: none; border: none; color: white; font-size: 2rem; cursor: pointer; }

@media (max-width: 900px) {
  .war-room-layout { height: auto; }
  .map-container { height: 400px; order: -1; min-width: 100%; }
}
</style>