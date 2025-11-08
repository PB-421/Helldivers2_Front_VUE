<template>
  <Header :startIndex="0"/>
  <div class="background"></div>
  <main class="content">
    <h1>Bienvenido a la Base de Datos de Supertierra</h1>
    <h2>Todo lo que conocemos de los enemigos de la libertad y las estratagemas para defenderla</h2>
    <h3>Selecciona una facción</h3>
    <div class="home-container">
      <div class="flex-item" @click="goToUrl('superearth')">
        <img src="/superearth2.png" alt="Imagen 1" />
        <p>SuperTierra</p>
      </div>
      <div class="flex-item" @click="goToUrl('terminids')">
        <img src="/terminids.png" alt="Imagen 2" />
        <p>Terminidos</p>
      </div>
      <div class="flex-item" @click="goToUrl('automatons')">
        <img src="/automatons.png" alt="Imagen 3"/>
        <p>Automatas</p>
      </div>
      <div class="flex-item" @click="goToUrl('illuminates')">
        <img src="/illuminate.png" alt="Imagen 4" />
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

.background {
  position: fixed;        
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: url("/Home_Background.jpg") center/cover no-repeat;
  z-index: -1;             
  filter: brightness(0.3);
}


.content {
  position: relative;
  z-index: 1;              /* asegura que esté por encima del fondo */
  flex: 1;
  margin: 100px 75px;
  color: white;            /* si el fondo es oscuro */
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

.flex-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  width: 22%;
  padding: 10px;
  min-width: 200px;
  transition: transform 0.3s ease-in-out;
}

.flex-item:hover {
  transform: scale(1.05);
}

.flex-item:hover p {
  color: #FFE900;
}

.flex-item:active {
  transform: scale(0.95);
}

.flex-item img {
  width: 100%;
  height: auto;
  border-radius: 8px;
}

.flex-item p {
  margin-top: 10px;
  text-align: center;
  color: #FFFFFF;
  font-size: 18px;
  font-weight: bold;
}
</style>
