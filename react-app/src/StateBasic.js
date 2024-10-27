import PropTypes from 'prop-types'
import React, { useState } from 'react'

const StateBasic = ({ init }) => {
  const [count, setCount] = useState(init)
  const handleClick = () => {
    setCount(count + 1)
  }

  return (
    <>
      <button onClick={handleClick} className='btn btn-primary'>カウント</button>
      <div>{ count }</div>
    </>
  )
}

StateBasic.propTypes = {
  init: PropTypes.number.isRequired
}

export default StateBasic