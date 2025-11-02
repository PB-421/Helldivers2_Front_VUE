<template>
  <div class="page-container">
    <Header />
    <main class="content">
      <h1>La Plaga Terminida</h1>
      <h3>Unos insectos fascistas que desprecian la libertad y la democracia gestionada.</h3>

      <div class="search-filter">
        <input type="text" v-model="searchQuery" placeholder="Buscar por nombre..." class="search-box" />

        <select v-model="selectedStrain" class="filter-select">
          <option value="">Todas las cepas/estructuras</option>
          <option v-for="type in availableStrains" :key="type" :value="type">
            {{ type }}
          </option>
        </select>
      </div>

      <div v-if="isLoading" class="loading-container">
        <svg width="50" height="50" viewBox="0 0 50 50" fill="none">
          <circle cx="25" cy="25" r="20" stroke="#FFE900" stroke-width="5" stroke-linecap="round" stroke-dasharray="31.4 31.4" >
            <animateTransform attributeName="transform" type="rotate" from="0 25 25" to="360 25 25" dur="1s" repeatCount="indefinite" />
          </circle>
        </svg>
        <p class="loading-text">Cargando terminidos...</p>
      </div>

      <div v-else>
        <div v-for="(group, strain) in groupedTerminidos" :key="strain" class="strain-group" >
          <h2>{{ strain }}</h2>
          <div class="home-container">
            <div class="flex-item" v-for="item in group" :key="item.id">
              <div class="info">
                <img v-if="item.photo_Url" :src="item.photo_Url" :alt="item.name" />
                <p class="name">{{ item.name }}</p>
                <div class="extra-info">
                  <p v-if="item.resistance && item.resistance !== 'N/A'">
                    Resistencia: {{ item.resistance }}
                  </p>
                  <p>{{ item.description }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="!Object.keys(groupedTerminidos).length" class="no-results">
          <p>No se encontraron resultados.</p>
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
  name: 'Terminids',
  components: { Header, Footer },
  data() {
    return {
      terminidos: [],
      searchQuery: '',
      selectedStrain: '',
      isLoading: true
    }
  },
  computed: {
    availableStrains() {
      const types = new Set(
        this.terminidos.map(e => {
            if (e.strain === 'N/A') return 'Estructuras'
            if (!e.strain || e.strain.trim() === '' || e.strain === 'Ninguna') return 'Sin Cepa'
            return e.strain
          })
      )
      return Array.from(types).sort()
    },

    groupedTerminidos() {
      const filtered = this.terminidos.filter(e => {
        const matchesName = e.name?.toLowerCase().includes(this.searchQuery.toLowerCase())

        const strainName = e.strain === 'N/A' ? 'Estructuras': (!e.strain || e.strain.trim() === '' || e.strain === 'Ninguna') ? 'Sin Cepa' : e.strain

        const matchesStrain = !this.selectedStrain || this.selectedStrain === strainName

        return matchesName && matchesStrain
      })

      return filtered.reduce((groups, item) => {
        const strainKey = item.strain === 'N/A' ? 'Estructuras' : (!item.strain || item.strain.trim() === '' || item.strain === 'Ninguna') ? 'Sin Cepa' : item.strain
        if (!groups[strainKey]) groups[strainKey] = []
        groups[strainKey].push(item)
        return groups
      }, {})
    }
  },
  methods: {
    async fetchTerminidos() {
      this.isLoading = true
      try {
        const response = await fetch('https://helldivers2-api.onrender.com/api/terminids')
        if (!response.ok) throw new Error(`Error en la API: ${response.status}`)
        const data = await response.json()
        this.terminidos = Array.isArray(data) ? data : []
      } catch (error) {
        console.error('Error al obtener datos:', error)
        this.terminidos = []
      } finally {
        this.isLoading = false
      }
    }
  },
  mounted() {
    this.fetchTerminidos()
  }
}
</script>

<style scoped>
img {
  width: 100%;
  object-fit: cover; 
  object-position: top; 
}

.page-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.content {
  flex: 1;
  margin: 10px 75px;
  padding-bottom: 80px;
}

.loading-container {
  text-align: center;
  margin-top: 40px;
  gap: 10px;
}

.loading-text {
  font-size: 18px;
  color: #FFE900;
  animation: blink 1.5s infinite;
}

@keyframes blink {
  50% { opacity: 0.5; }
}

h1 {
  text-align: center;
  margin-bottom: 20px;
  color: #41639C;
}

h3 {
  text-align: center;
  margin-bottom: 10px;
  color: #FFE900;
}

.search-filter {
  display: flex;
  justify-content: center;
  width: 100%;
  padding: 0px 90px;
  margin: 15px 0px;
  gap: 20px;
}

.search-box {
  display: block;
  padding: 10px 15px;
  width: 30%;
  border-radius: 8px;
  border: none;
  outline: none;
  font-size: 16px;
  background-color: #1f2833;
  color: #fff;
}

.filter-select {
  display: block;
  padding: 10px 15px;
  width: 20%;
  border-radius: 8px;
  border: none;
  outline: none;
  font-size: 16px;
  background-color: #1f2833;
  color: #fff;
  appearance: none;
  cursor: pointer;
}

.strain-group {
  margin-bottom: 40px;
}

.strain-group h2 {
  margin-bottom: 10px;
  border-bottom: 2px solid #FFE900;
  padding-bottom: 5px;
  color: #41639C;
}

.home-container {
  display: flex;
  justify-content: flex-start;
  gap: 20px;
  flex-wrap: wrap;
  padding: 10px 0;
}

.flex-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  width: 220px;
  padding: 10px;
  transition: all 0.3s ease-in-out;
  background-color: #1f2833;
  border-radius: 10px;
  color: #fff;
  overflow: hidden;
  position: relative;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.flex-item:hover {
  transform: scale(1.07);
  background-color: #2a3542;
}

.flex-item img {
  width: 100%;
  height: 150px;
  border-radius: 8px;
  object-fit: cover;
}

.info {
  text-align: center;
  margin-top: 10px;
}

.name {
  font-size: 18px;
  font-weight: bold;
}

.extra-info {
  max-height: 0;
  opacity: 0;
  overflow: hidden;
  transition: all 0.3s ease;
  font-size: 14px;
  margin-top: 8px;
}

.flex-item:hover .extra-info {
  max-height: 200px;
  opacity: 1;
}

.no-results {
  text-align: center;
  margin-top: 40px;
  color: #999;
}
</style>
