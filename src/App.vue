<script setup lang='ts'>

</script>

<template>
  <div class="text"> 全局混入颜色变量 </div>

  <!-- element plus 图标 -->
  <IconEpUser />

  <!-- 本地图标 -->
  <IconSettingSetting />
  <IconUserUser />
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
