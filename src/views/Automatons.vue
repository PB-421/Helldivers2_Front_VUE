<template>
  <div class="page-container">
    <Header :startIndex="3"/>
    <main class="content">
      <h1>La Legión Automata</h1>
      <h3>Unos robots socialistas que pretenden envenenar la libertad de ideas socialistas.</h3>

      <div class="search-filter">
        <input type="text" v-model="searchQuery" placeholder="Buscar por nombre..." class="search-box" /> <!-- buscador por nombre-->
        <select v-model="selectedDivision" class="filter-select"> <!-- menu desplegable que filtra por division-->
          <option value="">Todas las divisiones/estructuras</option>
          <option v-for="type in availableDivisions" :key="type" :value="type">
            {{ type }}
          </option>
        </select>
      </div>

      <div v-if="isLoading" class="loading-container"> <!-- mensaje de carga-->
        <svg width="50" height="50" viewBox="0 0 50 50" fill="none">
          <circle cx="25" cy="25" r="20" stroke="#FFE900" stroke-width="5" stroke-linecap="round" stroke-dasharray="31.4 31.4" >
            <animateTransform attributeName="transform" type="rotate" from="0 25 25" to="360 25 25" dur="1s" repeatCount="indefinite" />
          </circle>
        </svg>
        <p class="loading-text">Cargando automatas...</p>
      </div>

      <div v-else> <!-- mostrar los resultados de groupedAutomatas por el tipo de division-->
        <div v-for="(group, division) in groupedAutomatas" :key="division" class="division-group" >
          <h2>{{ division }}</h2>
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
      </div>
    </main>

    <Footer />
  </div>
</template>

<script>
import Header from '../components/Header.vue'
import Footer from '../components/Footer.vue'

export default {
  name: 'Automatons',
  components: { Header, Footer },
  data() {
    return {
      automatas: [],
      searchQuery: '',
      selectedDivision: '',
      isLoading: true
    }
  },
  computed: { //Datos que se calculan a partir de otros datos, como el numero de divisiones
    availableDivisions() {
      const types = new Set(
        this.automatas.map(e => {
            if (e.division === 'N/A') return 'Estructuras'
            if (!e.division || e.division.trim() === '' || e.division === 'Ninguna') return 'Estandar'
            return e.division
          })
      )
      return Array.from(types).sort()
    },

    groupedAutomatas() {
      const filtered = this.automatas.filter(e => {
        const matchesName = e.name?.toLowerCase().includes(this.searchQuery.toLowerCase()) //nombre

        const divisionName = e.division === 'N/A' ? 'Estructuras': (!e.division || e.division.trim() === '' || e.division === 'Ninguna') ? 'Estandar' : e.division //division

        const matchesDivision = !this.selectedDivision || this.selectedDivision === divisionName //si no hay division selecionada

        return matchesName && matchesDivision
      })

      return filtered.reduce((groups, item) => {
        const divisionKey = item.division === 'N/A' ? 'Estructuras' : (!item.division || item.division.trim() === '' || item.division === 'Ninguna') ? 'Estandar' : item.division
        if (!groups[divisionKey]) groups[divisionKey] = []
        groups[divisionKey].push(item)
        return groups
      }, {})
    }
  },
  methods: {
    async fetchAutomatas() {
      this.isLoading = true
      try {
        const response = await fetch('https://helldivers2-api.onrender.com/api/automatons')
        if (!response.ok) throw new Error(`Error en la API: ${response.status}`)
        const data = await response.json()
        this.automatas = Array.isArray(data) ? data : []
      } catch (error) {
        console.error('Error al obtener datos:', error)
        this.automatas = []
      } finally {
        this.isLoading = false
      }
    }
  },
  mounted() {
    this.fetchAutomatas()
  }
}
</script>

<style scoped>

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

.division-group {
  margin-bottom: 40px;
}

.division-group h2 {
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

.flex-item p {
  word-wrap: break-word;       /* Soporta palabras largas */
  white-space: break-all;
  overflow-wrap: break-word;   /* Versión moderna */
  text-align: center;          /* Centra el texto, opcional */
  margin: 0 25px;
}

.flex-item img {
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
