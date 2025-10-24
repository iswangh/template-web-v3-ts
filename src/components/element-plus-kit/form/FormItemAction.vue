<script setup lang="ts">
import type { Slot } from 'vue'
import type { ActionConfig } from './types'

interface Props {
  actionSlot?: Slot
  actionConfig?: ActionConfig
}

interface Emits {
  (e: 'submit'): void
  (e: 'reset'): void
}

defineOptions({ name: 'ElementPlusKitFormItemAction' })

withDefaults(defineProps<Props>(), {})

defineEmits<Emits>()
</script>

<template>
  <el-form-item prop="action">
    <template v-if="!actionSlot">
      <el-button type="primary" @click="$emit('submit')">
        确认
      </el-button>
      <el-button @click="$emit('reset')">
        取消
      </el-button>
    </template>

    <component :is="actionSlot" v-else prop="action" />
  </el-form-item>
</template>
