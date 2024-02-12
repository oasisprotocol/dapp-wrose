import { useEffect, useRef } from 'react'

export const useInterval = (cb: () => void, delay: number) => {
  const cbRef = useRef(() => {})

  useEffect(() => {
    cbRef.current = cb
  }, [cb])

  useEffect(() => {
    const id = setInterval(() => cbRef.current(), delay)

    return () => {
      clearInterval(id)
    }
  }, [delay])
}
