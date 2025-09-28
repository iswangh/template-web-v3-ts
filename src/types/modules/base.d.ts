/**
 * 标识符类型
 *
 * 用于表示实体的唯一标识，可以是字符串或数字
 */
export type Identifier = string | number

/**
 * 可拓展泛型对象类型，用于表示键值对对象
 *
 * 用于替代 Record<string, unknown> 的公共类型，支持泛型，默认为 unknown
 *
 * @template T - 对象值的类型，默认为 unknown
 */
export type ExtendableObject<T = unknown> = Record<string, T>
