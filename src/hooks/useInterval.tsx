import { useEffect } from 'react'

export const useInterval = (cb: () => void, delay: number) => {
  useEffect(() => {
    const id = setInterval(cb, delay)

    return () => {
      clearInterval(id)
    }
  })
}
