import { createApp } from 'vue';
import { PixelPlugin, type PixelPluginConfig } from '@mekari/pixel3';
import './pixel.css';
import App from './App.vue';
import { router } from './router';

const app = createApp(App);
app.use(PixelPlugin, { pixelTheme: true } as PixelPluginConfig);
app.use(router);
app.mount('#app');
