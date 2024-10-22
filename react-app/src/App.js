import React, { useEffect, useState } from 'react'

export const App = () => {
  const [currentTime, setcurrentTime] = useState(new Date().toLocaleString())

  useEffect(() => {
    const timer = setInterval(() => {
      setcurrentTime(new Date().toLocaleString())
    },1000);
    return () => {
      clearInterval(timer);
    }
  }, [])

  return (
    <div>現在時刻{currentTime}</div>
  )
}

export default App