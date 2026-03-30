const isObject = (value) => value && typeof value === 'object' && !Array.isArray(value)

export function deepMerge(base, override) {
  if (Array.isArray(base)) {
    return Array.isArray(override) ? override : base
  }

  if (!isObject(base)) {
    return override ?? base
  }

  const result = { ...base }

  Object.keys(override || {}).forEach((key) => {
    const baseValue = base[key]
    const overrideValue = override[key]

    if (Array.isArray(baseValue)) {
      result[key] = Array.isArray(overrideValue) ? overrideValue : baseValue
      return
    }

    if (isObject(baseValue) && isObject(overrideValue)) {
      result[key] = deepMerge(baseValue, overrideValue)
      return
    }

    result[key] = overrideValue ?? baseValue
  })

  return result
}
