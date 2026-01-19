<script setup>
import { ref } from 'vue'

defineProps({
  msg: String,
})

const count = ref(0)
</script>

<template>
  <h1>{{ msg }}</h1>

  <div class="card">
    <button type="button" @click="count++">当前计数是 {{ count }}</button>
    <p>
      编辑
      <code>components/HelloWorld.vue</code> 以测试热重载 (HMR)
    </p>
  </div>

  <p>
    查看
    <a href="https://vuejs.org/guide/quick-start.html#local" target="_blank"
      >create-vue</a
    >，官方 Vue + Vite 脚手架
  </p>
  <p>
    在
    <a
      href="https://vuejs.org/guide/scaling-up/tooling.html#ide-support"
      target="_blank"
      >Vue 文档进阶指南</a
    >
    中了解更多关于 IDE 支持的信息。
  </p>
  <p class="read-the-docs">点击 Vite 和 Vue 图标了解更多</p>
</template>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>
