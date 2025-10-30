<template>
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
      <img src="../components/icons/automatons.png" alt="Imagen 3" />
      <p>Automatas</p>
    </div>
    <div class="flex-item" @click="goToUrl('url4')">
      <img src="../components/icons/illuminate.png" alt="Imagen 4" />
      <p>Iluminados</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Home',
  methods: {
    goToUrl(route) {
      this.$router.push(`/${route}`);
    }
  }
}
</script>

<style scoped>
.home-container {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  flex-wrap: wrap;
  padding: 20px;
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

.flex-item img {
  width: 100%;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.flex-item p {
  margin-top: 10px;
  text-align: center;
  font-size: 18px;
  font-weight: bold;
}
</style>
