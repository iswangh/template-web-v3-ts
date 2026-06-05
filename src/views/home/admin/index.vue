<script setup lang='ts'>

</script>

<template>
  <div class="admin-home">
    <h1 class="admin-home__title">
      管理端首页
    </h1>
    <RouterLink class="admin-home__test-entry" to="/dev/schema-form-item">
      前往测试页面（SchemaFormItem）
    </RouterLink>
  </div>
</template>

<style lang="scss" scoped>
.admin-home {
  padding: 24px;
}

.admin-home__title {
  margin: 0 0 12px;
  font-size: 20px;
  font-weight: 600;
}

.admin-home__test-entry {
  color: #0a84ff;
  text-decoration: none;
}

.admin-home__test-entry:hover {
  text-decoration: underline;
}
</style>
