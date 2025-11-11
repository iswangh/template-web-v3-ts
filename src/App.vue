<script setup lang="ts">
import { Plus } from '@element-plus/icons-vue'
import { useQuery } from '@tanstack/vue-query'
import { useRequest } from 'alova/client'
import { baseTestAPI } from './apis'
import { useCounterStore } from './stores'
import { alovaClient, axiosClient, dateUtil } from './utils'

const countStore = useCounterStore()

const onClick = _debounce(() => {
  console.log('点击事件触发（1秒内只执行一次）')
}, 1000)

const windowSize = useWindowSize()

const onTestAxiosBase = async () => {
  const res = await baseTestAPI({ dictType: 'VSP_rule_type', arr: [1, 2, 3] })
  console.log('页面打印 axiosClient', res)
  return res
}

const onTestAxiosFormData = async () => {
  const formData = new FormData()
  await axiosClient.post('/qi/key-word/import/123', formData)
}

const { loading, data, error, send } = useRequest(
  () => {
    return alovaClient.Get('/biz/dict/data/list', {
      // cacheFor: 1000,
      params: { dictType: 'VSP_rule_type', arr: [1, 2, 3] },
    })
  },
  {
    immediate: false, // 是否立即发送请求，默认为 true
    // initialData: [], // 初始数据
    // manual: false, // 是否手动控制请求
    // force: true, // 是否强制请求（忽略缓存）
    // retry: 3, // 重试次数
    // retryInterval: 1000, // 重试间隔（毫秒）
  },
)

const onTestAlovaBase = async () => {
  await send()
  console.log('调用了 send', data.value)
  // const res = await alovaClient.Get('/biz/dict/data/list', { params: { dictType: 'VSP_rule_type', arr: [1, 2, 3] } })
  // console.log('页面打印 alova', res)
}

const onTestAlovaFormData = async () => {
  const formData = new FormData()
  await alovaClient.Post('/qi/key-word/import/123', formData)
}

const { data: tData, isLoading, isError } = useQuery({
  queryKey: ['test'],
  queryFn: () => onTestAxiosBase(),
})

const onTestTanstackQuery = async () => {
  console.log('页面打印 tanstackQuery', tData.value, tData.value?.data, isLoading.value, isError.value)
}
</script>

<template>
  <div class="p-4">
    <el-button type="primary" :icon="Plus">
      按钮1
    </el-button>

    <el-button type="primary">
      <template #icon>
        <IconEpPlus />
      </template>
      按钮2
    </el-button>
  </div>
  <div>
    请求测试
    <div>
      <button @click="onTestTanstackQuery">
        tanstack-query
      </button>
    </div>
    <div>
      <button @click="onTestAxiosBase">
        axiosClient - baseTestAPI
      </button>
      <button
        id="123" name="2123" @click="onTestAxiosFormData"
        @dblclick="onTestAxiosFormData"
      >
        axiosClient - FormData
      </button>
      <div>useRequest:{{ loading }},{{ data }},{{ error }}</div>
    </div>
    <div>
      <button @click="onTestAlovaBase">
        alova get
      </button>
      <button @click="onTestAlovaFormData">
        alova FormData
      </button>
    </div>
  </div>
  <div class="text">
    全局混入颜色变量
  </div>
  <hr>

  <div>
    element plus 图标：
    <IconMdiUser />
    <IconEpUser />
  </div>

  <div>
    本地图标：
    <IconSettingSetting />
    <IconUserUser />
  </div>
  <hr>

  <strong>pinia 持久化</strong>
  <div>{{ countStore.count }}</div>
  <button @click="countStore.count++">
    +
  </button>
  <button @click="countStore.count--">
    -
  </button>
  <hr>

  <strong>dayjs 封装</strong>
  <div>{{ dateUtil.now() }}</div>
  <div>format(dayjs 原生方法)：{{ dateUtil.now().format() }}</div>
  <div>format(dateUtil 方法)：{{ dateUtil.format(dateUtil.now()) }}</div>
  <div>{{ dateUtil.raw()("2024").isLeapYear() }}</div>
  <hr>

  <strong>lodash 按需引入</strong>
  <button @click="onClick">
    按钮
  </button>
  <hr>

  <strong>unocss</strong>
  <!-- 基础样式示例 -->
  <div class="rounded-lg bg-blue-100 m-4 p-4">
    <h2 class="text-2xl text-blue-800 font-bold mb-2">
      UnoCSS 示例
    </h2>

    <!-- 文字样式 -->
    <p class="text-green-600 font-medium mb-4">
      这是使用 UnoCSS 样式的文本
    </p>

    <!-- 按钮样式 -->
    <div class="flex flex-wrap gap-2 mb-4">
      <button class="text-white rounded bg-blue-500 transition-colors px-4 py-2 hover:bg-blue-600">
        主要按钮
      </button>
      <button class="text-white rounded bg-gray-500 transition-colors px-4 py-2 hover:bg-gray-600">
        次要按钮
      </button>
      <button class="text-white rounded bg-red-500 transition-colors px-4 py-2 hover:bg-red-600">
        危险按钮
      </button>
    </div>

    <!-- 布局示例 -->
    <div class="gap-4 grid grid-cols-1 mb-4 md:grid-cols-3">
      <div class="rounded bg-white shadow p-4">
        <h3 class="text-lg font-bold mb-2">
          列 1
        </h3>
        <p class="text-gray-600">
          这是第一列的内容
        </p>
      </div>
      <div class="rounded bg-white shadow p-4">
        <h3 class="text-lg font-bold mb-2">
          列 2
        </h3>
        <p class="text-gray-600">
          这是第二列的内容
        </p>
      </div>
      <div class="rounded bg-white shadow p-4">
        <h3 class="text-lg font-bold mb-2">
          列 3
        </h3>
        <p class="text-gray-600">
          这是第三列的内容
        </p>
      </div>
    </div>

    <!-- 响应式示例 -->
    <div class="text-center rounded bg-yellow-100 mb-4 p-4">
      <span class="font-semibold block md:text-lg sm:inline">
        响应式文本 - 在不同屏幕尺寸下会有不同表现
      </span>
    </div>

    <!-- 图标使用示例 -->
    <div class="flex gap-2 items-center mb-4">
      <IconSettingSetting class="text-2xl text-purple-500" />
      <i class="i-mdi-user" />
      <i class="i-ep-user" />
      <span>使用 UnoCSS 图标</span>
    </div>

    <!-- 动画示例 -->
    <div
      class="text-white font-bold rounded flex h-12 items-center justify-center animate-pulse from-cyan-500 to-blue-500 bg-gradient-to-r"
    >
      脉冲动画效果
    </div>

    <strong>unocss 自定义规则测试</strong>
    <div class="flex flex-col gap-4 p-4">
      <!-- 测试 margin 规则 -->
      <div>
        <h3 class="font-bold mb-2">
          Margin 规则测试:
        </h3>
        <div class="bg-blue-100 m-4 p-2">
          m-4 (margin: 1rem)
        </div>
        <div class="bg-green-100 mt-6 p-2">
          mt-6 (margin-top: 1.5rem)
        </div>
        <div class="bg-yellow-100 mx-8 p-2">
          mx-8 (margin-left & right: 2rem)
        </div>
        <div class="bg-red-100 m-2-4 p-2">
          m-2-4 (margin: 0.5rem 1rem)
        </div>
      </div>

      <!-- 测试 padding 规则 -->
      <div>
        <h3 class="font-bold mb-2">
          Padding 规则测试:
        </h3>
        <div class="bg-blue-100 p-4">
          p-4 (padding: 1rem)
        </div>
        <div class="bg-green-100 mt-2 pt-6">
          pt-6 (padding-top: 1.5rem)
        </div>
        <div class="bg-yellow-100 mt-2 px-8">
          px-8 (padding-left & right: 2rem)
        </div>
        <div class="bg-red-100 mt-2 p-2-4">
          p-2-4 (padding: 0.5rem 1rem)
        </div>
      </div>

      <!-- 测试多行截断规则 -->
      <div>
        <h3 class="font-bold mb-2">
          文本截断规则测试:
        </h3>
        <div class="bg-gray-100 w-64 p-2">
          <!-- unocss 属性化语法 -->
          <div truncate-2>
            这是一段很长的文本，用来测试多行截断功能。当文本超过指定行数时，会自动显示省略号。这是UnoCSS自定义规则的示例。
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="demo-item">
    <h4>vueuse 监听窗口尺寸</h4>
    <p>宽度: {{ windowSize.width }}px</p>
    <p>高度: {{ windowSize.height }}px</p>
  </div>
</template>

<style scoped lang="scss">
svg {
  width: 1em;
  height: 1em;
  fill: currentColor;
}

.text {
  color: $color-primary;
}
</style>
