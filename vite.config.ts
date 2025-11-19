import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import VueSetupExtend from 'vite-plugin-vue-setup-extend';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';

const target = 'http://192.168.1.147:81/prod-api/'
// const target = 'http://192.168.1.230/prod-api/'
// const target = 'http://192.168.1.123:8808/'
// const target = 'http://192.168.1.151:40001/'  //薛政

export default defineConfig({
	base: './',
	plugins: [
		vue(),
		VueSetupExtend(),
		AutoImport({
			resolvers: [ElementPlusResolver()]
		}),
		Components({
			resolvers: [ElementPlusResolver()]
		})
	],
	optimizeDeps: {
		include: ['schart.js']
	},
	server: {
		// host:'127.0.0.1',
		host: "0.0.0.0",
		port: 8808,
		// open: true,
		cors: true,
		proxy: {
			'/prod-api': {
				target: 'http://192.168.1.50',
				ws: true,
				changOrigin: true,
				secure: false,
			},
			'/device': {
				target,
				ws: true,
				changOrigin: true,
				secure: false,
			},
			// 选项写法
			'/ops': {
				target,
				ws: true,
				changOrigin: true,
				secure: false,
			},
			// 选项写法
			'/data': {
				target,
				ws: true,
				changOrigin: true,
				secure: false,
			},
			// 选项写法
			'/code': {
				target,
				ws: true,
				changOrigin: true,
				secure: false,
			}
		}
	}
});
