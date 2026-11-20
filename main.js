import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

// Головні стилі інтерфейсу
import './assets/main.css';

const app = createApp(App);

// Підключення маршрутизатора Vue Router
app.use(router);

// Монтування до DOM
app.mount('#app');
