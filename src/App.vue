<script setup lang="ts">
import PageTransition from './components/PageTransition.vue'

</script>

<template>
  <!-- Aquí usamos el PageTransition para la animación -->
  <PageTransition />
  <Header />
  <RouterView />
  <Footer />
</template>

