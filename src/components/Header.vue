<template>
  <header class="header">
    <div class="header-content" @click="goToUrl()">
        <img src="./icons/superearth2.png" alt="Super Earth Logo" class="logo" />

      <h1 class="title">Super Earth DB</h1>
    </div>
  </header>
</template>

<script>
export default {
  name: "Header",
  methods: {
    goToUrl() {
      this.$router.push(`/`);
    }
  }
};
</script>

<style scoped>
.header {
  background-color: #1f2833;
  color: #FFE900;
  padding: 10px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 2px solid #41639C;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.header-content {
  display: flex;
  align-items: center;
  width: 100%;
  max-width: 1200px;
}

.logo {
  width: 60px;
  height: 60px;
  object-fit: contain;
  cursor: pointer;
  transition: transform 0.2s ease;
  will-change: transform;
  backface-visibility: hidden;
}

.logo:hover {
  transform: scale(1.1);
}

.title {
  margin-left: 15px;
  font-size: 24px;
  font-weight: bold;
  color: #FFE900;
  letter-spacing: 1px;
  text-transform: uppercase;
}
</style>
