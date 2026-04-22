# 表单项 `compType` / 运行映射 / 手写类型的维护说明

> 约定：**当前不实现**「单源键列表 + 生成代码」等自动化，仅记录决策与边界，避免后续讨论失忆。  
> 对应实现与类型主要在 **`src/components/SchemaFormItem/`**。

## 背景

- `SchemaFormItem/config/comp.ts`（或等价模块）维护 **运行时** `compType` → Element Plus 组件的映射。
- `SchemaFormItem/types/comp.d.ts` 等维护 **手写** 的 `FormItemComp`、`FormItemCompProps<T>` 等，用于配置编写时的类型提示，并控制抽 npm / 组件库场景下 **声明体积与推断范围**。
- 曾讨论用 `as const` 元组推导 `FormItemComp`、用 `satisfies` 绑死 map 的 key 等做法；在本地验证中 **`satisfies` 与过宽的组件值类型** 可能影响开发者侧类型体验，故 **不强制采用 satisfies 承担「写 schema 时的 props 提示」**。

## 加新组件时要动哪些地方（无法合并成「只改一处」）

语义上至少两处：

1. **运行映射**：在 `FORM_ITEM_COMP_MAP`（及扩展表）中增加 `import` 与键值。
2. **类型映射**：在 `comp.d.ts`（等）中为新 `compType` 补 `ElCompMap` / `FormItemCompProps` 等分支。

这是 **「值类型」与「props/slots 形状」** 两类信息，除非引入 **代码生成**（从一份 manifest 生成上述片段），否则无法单靠 TS 合并成一处编辑。

## 若以后仍想减轻「键名」漂移

可选方向（**非当前任务**）：

- **键名 SSOT**：小文件内 `as const` 元组 → 推导 `FormItemComp`；运行 map 的 key 与该联合对齐（测试断言 `keyof typeof MAP` 与 `FormItemComp`，或仅锁 key 的 `satisfies`，与「props 提示」解耦）。
- **代码生成**：从 JSON / 清单生成 `comp.ts` 片段与 `comp.d.ts` 骨架，真正做到「清单只维护一份」。

## `colProps` / `meta`（类型层）

- `colProps` 使用 **`src/components/SchemaFormItem/types/el.d.ts`** 中的 **`ElColProps = ColInstance['$props']`**，与 **`ElFormItemProps = FormItemInstance['$props']`** 同一策略；**组件运行时可以不消费**，供外层按配置用 `el-col` 循环布局。
- `meta?: Record<string, any>` 为业务扩展袋；根节点是否再挂其它字段由业务约定，类型层不强行统一。
