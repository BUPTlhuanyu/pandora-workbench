import {createApp} from 'vue';
import {createPinia} from 'pinia';
import Antd from 'ant-design-vue';
import App from './App.vue';

// Electron 菜单注册
import {registerContextMenu, registerTopMenuListener} from 'views/src/services/menu/electron';

const app = createApp(App);
app.use(createPinia());
app.use(Antd);
app.mount('#root');

// 设置electron上下文菜单
registerContextMenu();
// 设置顶部菜单监听
registerTopMenuListener();
