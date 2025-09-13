<script setup lang='ts'>
const countStore = useCounterStore()
</script>

<template>
  <div class="text"> 全局混入颜色变量 </div>
  <hr />

  <!-- element plus 图标 -->
  <IconEpUser />

  <!-- 本地图标 -->
  <IconSettingSetting />
  <IconUserUser />
  <hr />

  <strong>pinia 持久化</strong>
  <div>{{ countStore.count }}</div>
  <button @click="countStore.count++">+</button>
  <button @click="countStore.count--">-</button>
</template>

<style scoped lang='scss'>
svg {
  width: 1em;
  height: 1em;
  fill: currentColor;
}

.text{
  color: $color-primary;
}
</style>
