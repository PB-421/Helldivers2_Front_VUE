<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const overlayVisible = ref(false)
const overlayClass = ref('') // clase para animación del fondo
const loadingClass = ref('') // clase para animación del icono de carga

router.beforeEach((to, from, next) => {
  overlayVisible.value = true
  overlayClass.value = 'slide-in-dynamic' // animación del fondo
  loadingClass.value = ''                 // icono inicialmente oculto

  // Mostrar icono de carga después de que el fondo aparezca
  setTimeout(() => {
    loadingClass.value = 'loading-in'
  }, 1500) // coincide con la entrada del fondo

  setTimeout(() => next(), 2500) // esperar animaciones antes de cambiar ruta
})

router.afterEach(() => {
  // Ocultar icono de carga antes de que el fondo se vaya
  loadingClass.value = 'loading-out'

  // Animación de salida del fondo
  overlayClass.value = 'slide-out-dynamic'

  // Ocultar overlay completo después de animaciones
  setTimeout(() => overlayVisible.value = false, 1000)
})
</script>

<template>
  <div v-if="overlayVisible" :class="['overlay', overlayClass]">
    <img src="./icons/superearth.png" alt="SuperEarth Logo" class="overlay-img" />
    <div :class="['loading-icon', loadingClass]">
      <!-- Svg para el icono de carga -->
      <svg width="50" height="50" viewBox="0 0 50 50" fill="none">
        <circle cx="25" cy="25" r="20" stroke="white" stroke-width="5" stroke-linecap="round" stroke-dasharray="31.4 31.4">
          <animateTransform attributeName="transform" type="rotate" from="0 25 25" to="360 25 25" dur="1s" repeatCount="indefinite"/>
        </circle>
      </svg>
    </div>
  </div>
</template>

<style scoped>
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #41639C;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  z-index: 9999;
  flex-direction: column;
}

.overlay-img {
  max-width: 50%;
  max-height: 50%;
  opacity: 1;
}

/* Icono de carga */
.loading-icon {
  margin-top: 20px;
  opacity: 0;
  transform: translateY(20px);
}

/* Entrada del icono de carga */
.loading-in {
  animation: fadeInUp 0.5s forwards;
}

/* Salida del icono de carga */
.loading-out {
  animation: fadeOutDown 0.5s forwards;
}
/* Animaciones dinámicas del icono de carga */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeOutDown {
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(20px);
  }
}

/* Animaciones dinámicas del fondo */
@keyframes slideInDynamic {
  0% { transform: translateX(-100%) scaleX(0.8); }
  50% { transform: translateX(30%) scaleX(1.05); }
  80% { transform: translateX(-5%) scaleX(0.98); }
  100% { transform: translateX(0%) scaleX(1); }
}

@keyframes slideOutDynamic {
  0% { transform: translateX(0%) scaleX(1); }
  50% { transform: translateX(5%) scaleX(1.02); }
  100% { transform: translateX(100%) scaleX(0.8); }
}
/* Entrada del fondo */
.slide-in-dynamic {
  animation: slideInDynamic 1s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}
/* Salida del fondo */
.slide-out-dynamic {
  animation: slideOutDynamic 1s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}
</style>
