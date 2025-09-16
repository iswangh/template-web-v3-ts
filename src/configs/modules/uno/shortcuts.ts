import type { UserShortcuts } from 'unocss'

export const flexShortcuts: UserShortcuts = [
  // 基础布局
  ['flex-row', 'flex flex-row'],
  ['flex-col', 'flex flex-col'],

  // 常用组合
  ['flex-center', 'flex justify-center items-center'],
  ['flex-between-center', 'flex justify-between items-center'],
  ['flex-around-center', 'flex justify-around items-center'],
  ['flex-evenly-center', 'flex justify-evenly items-center'],

  ['flex-start-center', 'flex justify-start items-center'],
  ['flex-end-center', 'flex justify-end items-center'],

  ['flex-center-start', 'flex justify-center items-start'],
  ['flex-center-end', 'flex justify-center items-end'],
]

export const layoutShortcuts: UserShortcuts = [
  // 传统居中方式：使用 transform
  ['absolute-center', 'absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'],
  // 现代居中方式：使用 inset 和 auto margin
  ['absolute-center-inset', 'absolute inset-0 m-auto'],
]

export const unoShortcuts: UserShortcuts = [
  ['full', 'w-full h-full'],
  ...flexShortcuts,
  ...layoutShortcuts,
]
