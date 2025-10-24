<script setup lang="ts">
import type { Slot } from 'vue'

interface Props {
  actionSlot?: Slot
}

defineOptions({ name: 'ElementPlusKitFormItemAction' })

const props = withDefaults(defineProps<Props>(), {})
console.log('props', props)

const attrs = useAttrs()
console.log('attrs', attrs)
</script>

<template>
  <el-form-item prop="action">
    <template v-if="!actionSlot">
      <el-button type="primary">
        确认
      </el-button>
      <el-button>取消</el-button>
    </template>

    <component :is="actionSlot" v-else prop="action" />
  </el-form-item>
</template>
