<template>
	<el-config-provider :locale="zhCn">
    <router-view :key="route.fullPath" />
	</el-config-provider>
</template>

<script setup lang="ts">
import { ElConfigProvider } from 'element-plus';
import zhCn from 'element-plus/es/locale/lang/zh-cn';
import {useRoute} from "vue-router";
const route = useRoute();
</script>

<style>
/* 全局样式 - 确保一屏到底，无滚动 */
html, body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow: hidden; /* 禁止滚动 */
}

#app {
  width: 100vw;
  height: 100vh;
  overflow: hidden; /* 禁止滚动 */
  position: fixed;
  top: 0;
  left: 0;
}
</style>