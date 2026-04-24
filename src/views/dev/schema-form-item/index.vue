<script setup lang="ts">
import type { Component } from 'vue'
import AsyncLoadTab from './tabs/AsyncLoadTab.vue'
import BasicTab from './tabs/BasicTab.vue'
import ConfigEventsTab from './tabs/ConfigEventsTab.vue'
import ConfigSlotsTab from './tabs/ConfigSlotsTab.vue'
import EventPriorityTab from './tabs/EventPriorityTab.vue'
import EventsTab from './tabs/EventsTab.vue'
import ShowHideTab from './tabs/ShowHideTab.vue'
import SlotPriorityTab from './tabs/SlotPriorityTab.vue'
import SlotsTab from './tabs/SlotsTab.vue'

const tabItems = [
  { name: 'basic', label: '基础', component: BasicTab },
  { name: 'visibility', label: '显隐', component: ShowHideTab },
  { name: 'async', label: 'useLoadOptions', component: AsyncLoadTab },
  { name: 'slots', label: '模板插槽', component: SlotsTab },
  { name: 'config-slots', label: '配置化插槽', component: ConfigSlotsTab },
  { name: 'slot-priority', label: '插槽优先级', component: SlotPriorityTab },
  { name: 'events', label: '模板事件', component: EventsTab },
  { name: 'config-events', label: '配置化事件', component: ConfigEventsTab },
  { name: 'event-priority', label: '事件优先级', component: EventPriorityTab },
] as const satisfies readonly { name: string, label: string, component: Component }[]

type TabName = (typeof tabItems)[number]['name']

const activeTab = ref<TabName>(tabItems[0].name)

const activePanel = computed(() => {
  return tabItems.find(t => t.name === activeTab.value)?.component ?? BasicTab
})
</script>

<template>
  <div class="min-h-full p-4 md:p-6">
    <ElCard
      shadow="never"
      class="overflow-hidden border border-[var(--el-border-color-lighter)] rounded-xl"
    >
      <template #header>
        <div class="flex flex-col gap-1">
          <h1 class="text-xl font-semibold tracking-tight text-[var(--el-text-color-primary)] text-balance">
            SchemaFormItem 联调
          </h1>
          <p class="max-w-2xl text-3.25 leading-snug text-[var(--el-text-color-secondary)]">
            切换 Tab 验收表单、显隐、useLoadOptions、插槽与事件等用例。
          </p>
        </div>
      </template>
      <ElTabs
        v-model="activeTab"
        type="border-card"
        class="touch-manipulation"
        aria-label="SchemaFormItem 联调分类"
      >
        <ElTabPane
          v-for="tab in tabItems"
          :key="tab.name"
          :label="tab.label"
          :name="tab.name"
        />
      </ElTabs>

      <div
        id="schema-dev-panel"
        class="scroll-mt-4 pt-4 pb-2 outline-none"
        tabindex="-1"
      >
        <component :is="activePanel" />
      </div>
    </ElCard>
  </div>
</template>
