export const useCounterStore = defineStore('counter', () => {
  const count = ref(0)

  return { count }
}, { persist: true })
