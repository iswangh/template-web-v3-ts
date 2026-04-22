<script setup lang="ts">
import AsyncLoadTab from './tabs/AsyncLoadTab.vue'
import BasicTab from './tabs/BasicTab.vue'
import ConfigEventsTab from './tabs/ConfigEventsTab.vue'
import ConfigSlotsTab from './tabs/ConfigSlotsTab.vue'
import EventsTab from './tabs/EventsTab.vue'
import SlotsTab from './tabs/SlotsTab.vue'

const activeTab = ref('basic')
</script>

<template>
  <div class="page">
    <ElCard header="SchemaFormItem 联调页">
      <ElTabs v-model="activeTab" class="tabs">
        <ElTabPane label="基础测试" name="basic" />
        <ElTabPane label="useLoadOptions" name="async" />
        <ElTabPane label="插槽测试" name="slots" />
        <ElTabPane label="事件测试" name="events" />
        <ElTabPane label="配置化插槽" name="config-slots" />
        <ElTabPane label="配置化事件" name="config-events" />
      </ElTabs>

      <BasicTab v-if="activeTab === 'basic'" />
      <AsyncLoadTab v-else-if="activeTab === 'async'" />
      <SlotsTab v-else-if="activeTab === 'slots'" />
      <EventsTab v-else-if="activeTab === 'events'" />
      <ConfigSlotsTab v-else-if="activeTab === 'config-slots'" />
      <ConfigEventsTab v-else />
    </ElCard>
  </div>
</template>

<style lang="scss" scoped>
.page {
  padding: 24px;
}

.tabs {
  margin-bottom: 12px;
}
</style>
