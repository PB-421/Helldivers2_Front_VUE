<template>
  <div class="super-earth">
    <h1>Bienvenido a Super Earth</h1>
    <p>¡Explora los planetas del sistema solar!</p>

    <div class="planets">
      <div class="planet" @click="goToPlanet('tierra')">
        <p>Tierra</p>
      </div>
      <div class="planet" @click="goToPlanet('mars')">
        <p>Marte</p>
      </div>
      <div class="planet" @click="goToPlanet('venus')">
        <p>Venus</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "SuperEarth",
  methods: {
    goToPlanet(planet) {
      this.$router.push(`/super-earth/${planet}`);
    }
  }
}
</script>

<style scoped>
.super-earth {
  text-align: center;
  padding: 20px;
}

.planets {
  display: flex;
  justify-content: space-around;
  gap: 20px;
  margin-top: 20px;
}

.planet {
  cursor: pointer;
  text-align: center;
  transition: transform 0.3s ease;
}

.planet:hover {
  transform: scale(1.1);
}

.planet img {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
}

.planet p {
  margin-top: 10px;
  font-size: 16px;
  font-weight: bold;
}
</style>