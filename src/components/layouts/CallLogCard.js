import React from 'react'
import Button from 'components/shared/Forms/Button'

import { FiCalendar, FiClock } from 'react-icons/fi'

import './CallLogCard.css'

const CallLogCard = ({ callLogs, onSchedule, isSchedule = false }) => {
  if (callLogs.length <= 0) return null

  return (
    <>
      {callLogs.map((call) => (
        <div className='calllog__card' key={call._id}>
          <div className='calllog__card__top flex-sbt'>
            <h2> {call.senderId.name}</h2>
            {isSchedule && (
              <Button
                onClick={() => onSchedule(call)}
                classNames='calllog__btn'
              >
                Schedule
              </Button>
            )}
          </div>
          <div className='calllog__card__bottom flex-sbt'>
            <div className='calllog__date'>
              <FiCalendar style={{ margin: '10px', color: '#9CA3AF' }} />
              {new Date(call.updatedAt).toLocaleDateString()}
            </div>

            <time className='calllog__time'>
              <FiClock style={{ margin: '10px', color: '#9CA3AF' }} />
              {new Date(call.updatedAt).toLocaleTimeString()}
            </time>
          </div>
        </div>
      ))}
    </>
  )
}

export default CallLogCard
