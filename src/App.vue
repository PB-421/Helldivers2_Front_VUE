<script setup lang="ts">
import PageTransition from './components/PageTransition.vue'

</script>

<template>
  <!-- Aquí usamos el PageTransition para la animación -->
  <PageTransition />
  
  <!-- definicion de RouterLink -->
  <div style="display: none;">
    <RouterLink to="/superearth" />
    <RouterLink to="/ruta2"/>
    <RouterLink to="/ruta3"/>
    <RouterLink to="/ruta4"/>
  </div>

  <RouterView />
</template>