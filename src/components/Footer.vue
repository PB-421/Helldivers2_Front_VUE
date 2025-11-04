<template>
  <footer class="footer">
    <p>Verificado por el Ministerio de la Verdad © {{ new Date().getFullYear() }}</p>
  </footer>
</template>

<script>
export default {
  name: "Footer",
};
</script>

<style scoped>
.footer {
  z-index: 2;
  background-color: #1f2833;
  color: #FFE900;
  text-align: center;
  padding: 15px 0;
  border-top: 2px solid #41639C;
  font-size: 14px;
  letter-spacing: 0.5px;
  position: fixed;
  bottom: 0;
  width: 100%;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.3);
}
</style>
