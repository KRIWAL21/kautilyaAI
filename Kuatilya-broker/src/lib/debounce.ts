import { ref } from "vue"

export function useDebounce<T extends (...args: any[]) => void>(
  fn: T,
  delay = 400
) {
  const timer = ref<ReturnType<typeof setTimeout> | null>(null)

  const debounced = (...args: Parameters<T>) => {
    if (timer.value) clearTimeout(timer.value)

    timer.value = setTimeout(() => {
      fn(...args)
    }, delay)
  }

  return debounced
}