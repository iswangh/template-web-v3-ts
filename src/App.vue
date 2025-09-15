<script setup lang='ts'>
import { dateUtil } from './utils'

const countStore = useCounterStore()
</script>

<template>
  <div class="text"> 全局混入颜色变量 </div>
  <hr />

  <div>
    element plus 图标：
    <IconEpUser />
  </div>

  <div>
    本地图标：
    <IconSettingSetting />
    <IconUserUser />
  </div>
  <hr />

  <strong>pinia 持久化</strong>
  <div>{{ countStore.count }}</div>
  <button @click="countStore.count++">+</button>
  <button @click="countStore.count--">-</button>
  <hr />

  <strong>dayjs 封装</strong>
  <div>{{ dateUtil.now() }}</div>
  <div>format(dayjs 原生方法)：{{ dateUtil.now().format() }}</div>
  <div>format(dateUtil 方法)：{{ dateUtil.format(dateUtil.now()) }}</div>
  <div>{{ dateUtil.raw()('2024').isLeapYear() }}</div>
  <hr />
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
