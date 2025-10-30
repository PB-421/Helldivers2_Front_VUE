//Evitar problemas de localizacion
declare module '*.vue' {
  import { DefineComponent } from 'vue';
  const component: DefineComponent<{}, {}, any>;
  export default component;
}