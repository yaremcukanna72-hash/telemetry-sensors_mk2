import { createRouter, createWebHistory } from 'vue-router';
import SensorListView from '../views/SensorListView.vue';
import SensorDetailView from '../views/SensorDetailView.vue';
import SensorFormView from '../views/SensorFormView.vue';
import NotFoundView from '../views/NotFoundView.vue';

const routes = [
  //Головний реєстр датчиків
  {
    path: '/',
    redirect: '/sensors'
  },
  {
    path: '/sensors',
    name: 'sensor-list',
    component: SensorListView,
    meta: { title: 'Реєстр телеметричних датчиків' }
  },
  // Форма створення нового датчика 
  {
    path: '/sensors/new',
    name: 'sensor-create',
    component: SensorFormView,
    meta: { title: 'Додавання датчика' }
  },
  // Детальна картка конкретного датчика
  {
    path: '/sensors/:id',
    name: 'sensor-detail',
    component: SensorDetailView,
    meta: { title: 'Картка датчика' }
  },
  // Форма редагування наявного датчика
  {
    path: '/sensors/:id/edit',
    name: 'sensor-edit',
    component: SensorFormView,
    meta: { title: 'Редагування датчика' }
  },
  //Сторінка помилки 404 
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: NotFoundView,
    meta: { title: '404 - Сторінку не знайдено' }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Динамічне оновлення заголовка сторінки у вкладці браузера
router.afterEach((to) => {
  document.title = to.meta.title 
    ? `${to.meta.title} | Облік телеметрії` 
    : 'Облік телеметричних датчиків';
});

export default router;
