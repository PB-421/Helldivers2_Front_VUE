<template>
  <Header />
  <main class="content">
    <h1>Bienvenido a la Base de Datos de Supertierra</h1>
    <h2>Todo lo que conocemos de los enemigos de la libertad y las herramientas para defenderla</h2>
    <h3>Selecciona una faccion</h3>
    <div class="home-container">
      <div class="flex-item" @click="goToUrl('superearth')">
        <img src="../components/icons/superearth2.png" alt="Imagen 1" />
        <p>SuperTierra</p>
      </div>
      <div class="flex-item" @click="goToUrl('url2')">
        <img src="../components/icons/terminids.png" alt="Imagen 2" />
        <p>Terminidos</p>
      </div>
      <div class="flex-item" @click="goToUrl('url3')">
        <img src="../components/icons/automatons.png" alt="Imagen 3"/>
        <p>Automatas</p>
      </div>
      <div class="flex-item" @click="goToUrl('url4')">
        <img src="../components/icons/illuminate.png" alt="Imagen 4" />
        <p>Iluminados</p>
      </div>
    </div>
  </main>
  <Footer />
</template>

<script>
import Header from '../components/Header.vue'
import Footer from '../components/Footer.vue'
export default {
  name: 'Home',
  components: {
    Header,
    Footer
  },
  methods: {
    goToUrl(route) {
      this.$router.push(`/${route}`);
    }
  }
}
</script>

<style scoped>

.content {
  flex: 1;
  margin: 10px 75px;
}

h1 {
  text-align: center;
  margin-bottom: 20px;
  color: #41639C;
}

h2 {
  text-align: center;
  margin-bottom: 10px;
  color: #FFE900;
}

h3 {
  text-align: center;
  margin-bottom: 10px;
  color: #FFFFFF;
}

.home-container {
  display: flex;
  justify-content: space-between;
  margin: 0px 100px;
  margin-top: 60px;
  gap: 20px;
  flex-wrap: wrap;
  padding: 75px;
}

/* Estilo para cada "flexbox" */
.flex-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  width: 22%;
  padding: 10px;
  transition: transform 0.3s ease-in-out;
}

.flex-item:hover {
  transform: scale(1.05);
}

.flex-item:hover p {
  color: #FFE900;
}

.flex-item img {
  width: 100%;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.flex-item p {
  margin-top: 10px;
  text-align: center;
  color: #FFFFFF;
  font-size: 18px;
  font-weight: bold;
}
</style>
