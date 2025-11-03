<template>
  <div class="page-container">
    <Header :startIndex="4"/>
    <main class="content">
      <h1>El Culto Iluminado</h1>
      <h3>Una raza de calamares tiránicos cuyo proposito es la destrucción de la democracia gestionada.</h3>

      <div class="search-filter">
        <input type="text" v-model="searchQuery" placeholder="Buscar por nombre..." class="search-box" /> <!-- buscador por nombre-->
        <select v-model="selectedFilter" class="filter-select"> <!-- menu desplegable que filtra estructura o enemigo solo-->
          <option value="">Enemigos y estructuras</option>
          <option value="enemigos">Enemigos</option>
          <option value="estructuras">Estructuras</option>
        </select>
      </div>

      <div v-if="isLoading" class="loading-container"> 
        <svg width="50" height="50" viewBox="0 0 50 50" fill="none">
          <circle cx="25" cy="25" r="20" stroke="#FFE900" stroke-width="5" stroke-linecap="round" stroke-dasharray="31.4 31.4" >
            <animateTransform attributeName="transform" type="rotate" from="0 25 25" to="360 25 25" dur="1s" repeatCount="indefinite" />
          </circle>
        </svg>
        <p class="loading-text">Cargando iluminados...</p>
      </div>

      <div v-else> <!-- mostrar los resultados de groupedIluminados por el tipo de unidad (estructura o enemigo)-->
        <div v-for="(group, tipo) in groupedIluminados" :key="tipo" class="division-group">
          <h2>{{ tipo }}</h2>
          <div class="home-container">
            <div class="flex-item" v-for="item in group" :key="item.id">
              <div class="info">
                <img v-if="item.photo_Url" :src="item.photo_Url" :alt="item.name" class="item-image" />
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

        <div v-if="!Object.keys(groupedIluminados).length" class="no-results">
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
  name: 'Illuminates',
  components: { Header, Footer },
  data() {
    return {
      iluminados: [],
      searchQuery: '',
      selectedFilter: '',
      isLoading: true
    }
  },
  computed: { //Datos que se calculan a partir de otros datos, aqui filtramos por estructura o enemigo solo, pues no hay cepas ni divisiones
    filteredIluminados() {
      return this.iluminados.filter(e => {
        const matchesName = e.name?.toLowerCase().includes(this.searchQuery.toLowerCase()) //nombre

        let matchesType = true //estructura
        if (this.selectedFilter === 'enemigos') matchesType = e.structure === false
        else if (this.selectedFilter === 'estructuras') matchesType = e.structure === true

        return matchesName && matchesType
      })
    },

    groupedIluminados() {
      const groups = this.filteredIluminados.reduce((acc, item) => {
        const tipo = item.structure ? 'Estructuras' : 'Enemigos'
        if (!acc[tipo]) acc[tipo] = []
        acc[tipo].push(item)
        return acc
      }, {})
      return groups
    }
  },
  methods: {
    async fetchIluminados() {
      this.isLoading = true
      try {
        const response = await fetch('https://helldivers2-api.onrender.com/api/illuminate')
        if (!response.ok) throw new Error(`Error en la API: ${response.status}`)
        const data = await response.json()
        this.iluminados = Array.isArray(data) ? data : []
      } catch (error) {
        console.error('Error al obtener datos:', error)
        this.iluminados = []
      } finally {
        this.isLoading = false
      }
    }
  },
  mounted() {
    this.fetchIluminados()
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

h2 {
  margin-bottom: 10px;
  border-bottom: 2px solid #FFE900;
  padding-bottom: 5px;
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

.item-image {
  height: 150px;
  border-radius: 8px;
  object-fit: cover;
  object-position: center;
}

.flex-item p {
  word-wrap: break-word;       /* Soporta palabras largas */
  white-space: break-all;
  overflow-wrap: break-word;   /* Versión moderna */
  text-align: center;          /* Centra el texto, opcional */
  margin: 0 25px;
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
