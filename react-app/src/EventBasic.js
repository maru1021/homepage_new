import React from 'react'

const EventBasic = () => {
  const currentDate = (type) => {
    const d = new Date();
    switch(type) {
      case 'date':
        alert(d.toLocaleDateString());
        break;
      case 'time':
        alert(d.toLocaleTimeString());
        break;
      default:
        alert(d.toLocaleString());
        break;
      }
  }
  return (
    <>
      <button onClick={() => currentDate('date')} className='btn btn-primary'>日付を取得</button>
      <button onClick={() => currentDate('time')} className='btn btn-primary'>時間を取得</button>
    </>
  )
}

export default EventBasic