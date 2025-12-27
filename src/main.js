import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import loadingDirective from './directives/loading';

const app = createApp(App);

app.use(router);
app.use(store);
app.use(ElementPlus);

// Register custom directives
app.directive('loading', loadingDirective);

// Initialize auth state from localStorage
store.dispatch('auth/initAuth');

app.mount('#app');
