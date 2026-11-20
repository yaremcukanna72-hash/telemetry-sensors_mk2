<template>
  <div class="app-layout">
    <!-- Навігаційне меню -->
    <header class="app-header">
      <div class="container header-container">
        <router-link to="/sensors" class="brand-logo">
          <span class="logo-icon">📡</span>
          <div class="logo-text">
            <span class="logo-title">TelemetriaOps</span>
            <span class="logo-badge">МКР №2</span>
          </div>
        </router-link>

        <nav class="app-nav">
          <router-link to="/sensors" class="nav-link" active-class="nav-link-active">
            📋 Реєстр датчиків
          </router-link>
          <router-link to="/sensors/new" class="nav-link" active-class="nav-link-active">
            ➕ Додати датчик
          </router-link>
        </nav>
      </div>
    </header>

    <!-- Основний контент (SPA маршрути) -->
    <main class="app-main">
      <div class="container">
        <router-view />
      </div>
    </main>

    <!-- Підвал -->
    <footer class="app-footer">
      <div class="container footer-container">
        <p>Модульна контрольна робота №2 &copy; 2024</p>
        <p class="footer-sub">Двокомпонентний SPA-застосунок обліку телеметричних датчиків (Vue 3 + Node.js Express)</p>
      </div>
    </footer>

    <!-- Глобальні спливаючі сповіщення -->
    <ToastNotification />
  </div>
</template>

<script setup>
import ToastNotification from './components/ToastNotification.vue';
</script>

<style scoped>
.app-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.app-header {
  background-color: #ffffff;
  border-bottom: 1px solid var(--border-color);
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.03);
}

.header-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
}

.brand-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  color: var(--text-main);
}

.logo-icon {
  font-size: 26px;
  line-height: 1;
}

.logo-text {
  display: flex;
  align-items: center;
  gap: 8px;
}

.logo-title {
  font-size: 18px;
  font-weight: 700;
  letter-spacing: -0.3px;
  color: var(--text-main);
}

.logo-badge {
  background-color: var(--color-primary-light);
  color: var(--color-primary);
  border: 1px solid var(--color-primary-border);
  font-size: 11px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 4px;
}

.app-nav {
  display: flex;
  align-items: center;
  gap: 12px;
}

.nav-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-muted);
  text-decoration: none;
  border-radius: var(--border-radius-sm);
  transition: all 0.15s ease-in-out;
}

.nav-link:hover {
  color: var(--text-main);
  background-color: var(--bg-surface-alt);
}

.nav-link-active {
  color: var(--color-primary);
  background-color: var(--color-primary-light);
  font-weight: 600;
}

.app-main {
  flex: 1;
  padding-top: 28px;
}

.app-footer {
  background-color: #ffffff;
  border-top: 1px solid var(--border-color);
  padding: 20px 0;
  margin-top: auto;
  font-size: 13px;
  color: var(--text-muted);
}

.footer-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  text-align: center;
}

.footer-sub {
  font-size: 12px;
  color: var(--text-light);
}
</style>
