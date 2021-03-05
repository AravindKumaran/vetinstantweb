import React, { useState, useEffect } from 'react'
import Layout from 'components/layouts/Layout'

import 'react-datepicker/dist/react-datepicker.css'
import './CallLogPage.css'
import client from 'services/client'
import { useAuth } from 'context/use-auth'
import LoadingSpinner from 'components/shared/UI/LoadingSpinner'
import CallLogCard from 'components/layouts/CallLogCard'
import toast from 'react-hot-toast'

import Backdrop from 'components/shared/UI/Backdrop'
import Modal from 'components/shared/UI/Modal'

import DatePicker from 'react-datepicker'
import DateTimeInput from 'components/layouts/DateTimeInput'
import Button from 'components/shared/Forms/Button'

const CallLogPage = () => {
  const { user } = useAuth()
  const [missedCall, setMissedCall] = useState([])
  const [completedCall, setCompletedCall] = useState([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [currentCall, setCurrentCall] = useState()
  const [startDate, setStartDate] = useState(new Date())
  const [startTime, setStartTime] = useState(new Date())

  useEffect(() => {
    const getMissedCall = async () => {
      setLoading(true)
      try {
        const res = await client.get(`/calllogs?receiverId=${user._id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.token}`,
          },
        })

        const callLogsArray = res.data.callLogs
        callLogsArray.forEach((log) => {
          if (log.callPending) {
            setMissedCall((prevLog) => [...prevLog, log])
          } else {
            setCompletedCall((prevLog) => [...prevLog, log])
          }
        })
        setLoading(false)
      } catch (error) {
        setLoading(false)
        toast.error(
          error.response.data?.msg ||
            'Something Went Wrong! Please try again later!'
        )
      }
    }

    getMissedCall()
  }, [])

  const toggleModal = () => {
    setOpen(!open)
  }

  const handleScheduleCall = (call) => {
    toggleModal()
    setCurrentCall(call)
  }

  const handleScheduleBtn = async () => {
    startDate.setTime(startTime.getTime())
    setLoading(true)
    try {
      const schRes = await client.post(
        '/scheduledCalls',
        {
          date: startDate,
          userId: currentCall.senderId._id,
          doctorId: currentCall.receiverId._id,
          doctorName: currentCall.receiverId.name,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.token}`,
          },
        }
      )

      setLoading(false)
      toast.success('Your Call has been schedule')
      window.location.href = '/'
    } catch (error) {
      setLoading(false)
      toast.error(
        error.response.data?.msg ||
          'Something Went Wrong! Please try again later!'
      )
    }
  }

  return (
    <Layout>
      {loading && <LoadingSpinner asOverlay />}
      {open && <Backdrop toggle={toggleModal} />}
      {open && (
        <Modal toggle={toggleModal} title='Schedule Call'>
          <div className='sch__modal'>
            <h4>Select Time</h4>
            <DatePicker
              selected={startTime}
              onChange={(date) => setStartTime(date)}
              showTimeSelect
              showTimeSelectOnly
              timeIntervals={15}
              timeCaption='Time'
              dateFormat='h:mm aa'
              customInput={<DateTimeInput time={true} />}
            />
            
            <h4>Choose Date</h4>
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              minDate={new Date()}
              customInput={<DateTimeInput />}
            />
          </div>
          <Button onClick={handleScheduleBtn} classNames='btn__sch'>
            Schedule
          </Button>
        </Modal>
      )}
      <div className='call-log__container'>
        <div className='missed__call call__common'>
          <h2 className='text-center'>Missed Calls</h2>
          {missedCall.length > 0 ? (
            <CallLogCard
              callLogs={missedCall}
              isSchedule={true}
              onSchedule={handleScheduleCall}
            />
          ) : (
            <h4 className='text-center'>No Missed Calls</h4>
          )}
        </div>
        <div className='completed__call call__common'>
          <h2 className='text-center'>Completed Calls</h2>
          {completedCall.length > 0 ? (
            <CallLogCard callLogs={completedCall} />
          ) : (
            <h4 className='text-center'>No Completed Calls</h4>
          )}
        </div>
      </div>
    </Layout>
  )
}

export default CallLogPage
