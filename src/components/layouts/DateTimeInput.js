import React from 'react'

import './DateTimeInput.css'

import { FiCalendar, FiClock } from 'react-icons/fi'

const DateTimeInput = ({ value, onClick, time }) => {
  return (
    <div className='custom__datetime' onClick={onClick}>
      {time ? (
        <FiClock style={{ marginRight: '15px' }} />
      ) : (
        <FiCalendar style={{ marginRight: '15px' }} />
      )}
      <p>{value}</p>
    </div>
  )
}

export default DateTimeInput
