import React, { useState, useEffect } from 'react'
import dayjs from 'dayjs'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'

import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'

import { useAuth } from 'context/use-auth'
import client from 'services/client'
import Layout from 'components/layouts/Layout'
import './PendingCallPage.css'
import Button from 'components/shared/Forms/Button'
import Backdrop from 'components/shared/UI/Backdrop'
import Modal from 'components/shared/UI/Modal'
import LoadingSpinner from 'components/shared/UI/LoadingSpinner'
import DatePicker from 'react-datepicker'
import DateTimeInput from 'components/layouts/DateTimeInput'

dayjs.extend(isSameOrAfter)

const PendingCallPage = () => {
  const { user } = useAuth()
  const [pendingCalls, setPendingCalls] = useState([])
  const [loading, setLoading] = useState(false)
  const [pet, setPet] = useState(null)
  const [curItem, setCurItem] = useState(null)
  const [open, setOpen] = useState(false)
  const [openSch, setOpenSch] = useState(false)
  const [petLoading, setPetLoading] = useState(false)
  const [startDate, setStartDate] = useState(new Date())
  const [startTime, setStartTime] = useState(new Date())

  const getUserPendingCalls = async () => {
    setLoading(true)
    try {
      const pres = await client.get(`/pendingcalls/doctor/${user._id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.token}`,
        },
      })

      //   console.log('Ress', pres.data)
      setPendingCalls(pres.data.calls)
      setLoading(false)
    } catch (error) {
      setLoading(false)
      toast.error(
        error.response?.data?.msg ||
          'Something Went Wrong! Please try again later!'
      )
    }
  }

  useEffect(() => {
    getUserPendingCalls()
  }, [])

  const handleBtns = async (item, str) => {
    const allPCalls = [...pendingCalls]
    const pCall = allPCalls.find((p) => p._id === item._id)
    if (pCall) {
      pCall.status = str
    }
    setLoading(true)
    try {
      const pres = await client.patch(`/pendingcalls/${item._id}`, pCall, {
        headers: {
          Authorization: `Bearer ${localStorage.token}`,
        },
      })

      setLoading(false)
      setPendingCalls(allPCalls)
    } catch (error) {
      setLoading(false)
      toast.error(
        error.response?.data?.msg ||
          'Something Went Wrong! Please try again later!'
      )
    }
  }

  const handleRefresh = () => {
    getUserPendingCalls()
  }

  const toggleModal = () => {
    setOpen(!open)
  }
  const toggleModalSch = () => {
    setStartDate(new Date())
    setStartTime(new Date())
    setOpenSch(!openSch)
  }

  const onSchedule = (item) => {
    setCurItem(item)
    toggleModalSch()
  }

  const handleScheduleBtn = async () => {
    const item = curItem
    startDate.setTime(startTime.getTime())
    setLoading(true)
    const allPCalls = [...pendingCalls]
    const npCall = allPCalls.find((p) => p._id === item._id)
    if (npCall) {
      npCall.status = 'scheduled'
      npCall.extraInfo = `${startDate}`
    }

    try {
      await client.patch(`/pendingcalls/${item._id}`, npCall, {
        headers: {
          Authorization: `Bearer ${localStorage.token}`,
        },
      })

      await client.post(
        '/scheduledCalls',
        {
          date: startDate,
          userId: item.userId,
          doctorId: item.docId,
          doctorName: item.docName,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.token}`,
          },
        }
      )

      setLoading(false)
    } catch (error) {
      setLoading(false)
      toast.error(
        error.response?.data?.msg ||
          'Something Went Wrong! Please try again later!'
      )
    }

    setPendingCalls(allPCalls)
    toggleModalSch()
  }

  const handlePatModal = async (id) => {
    toggleModal()
    try {
      setPetLoading(true)
      const petRes = await client.get(`/pets/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.token}`,
        },
      })
      // console.log('PET', petRes)
      setPet(petRes.data.exPet)
      setPetLoading(false)
    } catch (error) {
      toast.error('Something Went Wrong! Please try again later!')
      setPetLoading(false)
    }
  }

  return (
    <Layout>
      {loading && <LoadingSpinner asOverlay />}
      {open && <Backdrop toggle={toggleModal} />}
      {openSch && <Backdrop toggle={toggleModalSch} />}
      {open && (
        <Modal toggle={toggleModal} title={`Pet Details`}>
          {petLoading && <LoadingSpinner asOverlay />}
          {pet && (
            <div className='pet__details'>
              <h5>
                Date: <span>{new Date(pet.createdAt).toLocaleString()}</span>
              </h5>
              <h5>
                Weight: <span>{pet.weight} Kg</span>
              </h5>

              <h5>
                Gender: <span>{pet.gender}</span>
              </h5>
              <h5>
                Species: <span>{pet.type}</span>
              </h5>
              <h5>
                Breed: <span>{pet.breed}</span>
              </h5>

              <h5>
                Age:
                <span>
                  {pet.years !== 0 && `${pet.years} Years`}{' '}
                  {pet.months !== 0 && `${pet.months} Months`}
                </span>
              </h5>

              {pet?.petHistoryImages?.length > 0 && (
                <>
                  <h5>Pet History Images: </h5>
                  <div className='pet__history__images'>
                    {pet.petHistoryImages.map((img, i) => (
                      <div key={`${img}-${i}`} className='pet__history__img'>
                        {/* <img
                          src={`http://192.168.43.242:8000/img/${img}`}
                          width='200'
                          height='200'
                          alt={`${pet.type}`}
                        /> */}
                        <img
                          src={`${img}`}
                          width='200'
                          height='200'
                          style={{ objectFit: 'cover' }}
                          alt={`${pet.type}`}
                        />
                      </div>
                    ))}
                  </div>
                </>
              )}

              {pet?.prescriptions?.length > 0 && <h5>Pet Prescriptions:</h5>}
              {pet?.prescriptions?.length > 0 &&
                pet.prescriptions.map((pr, i) => (
                  <div className='py-10' key={pr._id}>
                    <h5>
                      {i + 1}. Prescription: <span>{pr.prescription}</span>
                    </h5>
                    <h5>
                      Doctor's Name: <span>{pr.docname}</span>
                    </h5>
                    <h5>
                      Date: <span>{new Date(pr.date).toLocaleString()}</span>
                    </h5>
                    {pr.img && (
                      <>
                        <h5>Prescription image</h5>
                        <div className='pet__history__img'>
                          {/* <img
                            src={`http://192.168.43.242:8000/${pr.img}`}
                            width='200'
                            height='200'
                            style={{ maxHeight: '200px', maxWidth: '200px' }}
                            alt={`${pet.type}`}
                          /> */}
                          <img
                            src={`${pr.img}`}
                            width='200'
                            height='200'
                            style={{
                              maxHeight: '200px',
                              maxWidth: '200px',
                              objectFit: 'cover',
                            }}
                            alt={`${pet.type}`}
                          />
                        </div>
                      </>
                    )}
                    <hr />
                  </div>
                ))}

              {pet?.problems?.length > 0 && <h5>Pet Problems: </h5>}
              {pet?.problems?.length > 0 &&
                pet.problems.map((pb, i) => (
                  <div className='pet__problems py-10' key={pb._id}>
                    <h5>
                      {i + 1}. Problem: <span>{pb.problem}</span>
                    </h5>
                    <h5>
                      Doctor's Name: <span>{pb.docname}</span>
                    </h5>
                    <h5>
                      Time Period: <span>{pb.time}</span>
                    </h5>
                    <h5>
                      Appetite: <span>{pb.Appetite}</span>
                    </h5>
                    <h5>
                      Behaviour: <span>{pb.Behaviour}</span>
                    </h5>
                    <h5>
                      Eyes: <span>{pb.Eyes}</span>
                    </h5>
                    <h5>
                      Comment: <span>{pb.comment}</span>
                    </h5>
                    <h5>
                      Gait: <span>{pb.Gait}</span>
                    </h5>
                    <h5>
                      Mucous: <span>{pb.Mucous}</span>
                    </h5>

                    {pb.Ears?.length > 0 && <h5>Ears: </h5>}

                    {pb.Ears?.length > 0 &&
                      pb.Ears.map((er, i) => <h3 key={`${i}-Ears`}> {er}</h3>)}

                    {pb.Feces?.length > 0 && <h5>Faces: </h5>}

                    {pb.Feces?.length > 0 &&
                      pb.Feces.map((fc, i) => (
                        <h3 key={`Feces ${i}`}> {fc}</h3>
                      ))}
                    {pb.Urine?.length > 0 && <h5>Urines: </h5>}

                    {pb.Urine?.length > 0 &&
                      pb.Urine.map((ur, i) => (
                        <h3 key={`Urines ${i}`}> {ur}</h3>
                      ))}
                    {pb.Skin?.length > 0 && <h5>Skins: </h5>}

                    {pb.Skin?.length > 0 &&
                      pb.Skin.map((sk, i) => <h3 key={`Skins ${i}`}> {sk}</h3>)}

                    {pb?.images?.length && <h5>Pet Problem image</h5>}
                    <div className='pet__history__images'>
                      {pb?.images?.length > 0 &&
                        pb.images.map((img, i) => (
                          <div
                            key={`${img}-${i}`}
                            className='pet__history__img'
                          >
                            {/* <img
                              src={`http://192.168.43.242:8000/${img}`}
                              width='200'
                              height='200'
                              style={{ maxHeight: '200px', maxWidth: '200px' }}
                              alt={`${pet.type}`}
                            /> */}
                            <img
                              src={`${img}`}
                              width='200'
                              height='200'
                              style={{
                                maxHeight: '200px',
                                maxWidth: '200px',
                                objectFit: 'cover',
                              }}
                              alt={`${pet.type}`}
                            />
                          </div>
                        ))}
                    </div>
                    <hr />
                  </div>
                ))}
            </div>
          )}
        </Modal>
      )}
      {openSch && (
        <Modal toggle={toggleModalSch} title='Schedule Call'>
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
      <div className='pend-top'>
        <h1>Your Pending Calls</h1>
        <Button onClick={handleRefresh} disabled={loading}>
          Refresh
        </Button>
      </div>

      {pendingCalls.length > 0 ? (
        <div className='center'>
          {pendingCalls.map((item, index) => (
            <div className='pend__card' key={item._id}>
              <div className='pend__card__top'>
                <h3 style={{ textTransform: 'capitalize' }}>{item.userName}</h3>
                <Button
                  classNames='pet__btn'
                  onClick={() => handlePatModal(item.petId)}
                >
                  Pet Details
                </Button>
              </div>
              {item.status === 'requested' && (
                <>
                  <p style={{ fontSize: '25px', margin: '15px 8px' }}>
                    <span style={{ fontWeight: 'bold' }}>Status:</span> Patient
                    Requested
                  </p>
                  <div className='flex-center'>
                    <Button onClick={() => onSchedule(item)}>SCHEDULE</Button>
                    <Button onClick={() => handleBtns(item, 'deny')}>
                      DENY
                    </Button>
                    <Button onClick={() => handleBtns(item, 'accepted')}>
                      ACCEPT
                    </Button>
                  </div>
                </>
              )}

              {item.status === 'accepted' && (
                <p style={{ fontSize: '25px', margin: '15px 8px' }}>
                  <span style={{ fontWeight: 'bold' }}>Status:</span> Waiting
                  for payment
                </p>
              )}

              {item.status === 'paymentDone' && item.paymentDone && (
                <div style={{ paddingBottom: '15px' }}>
                  <p style={{ fontSize: '25px', margin: '15px 8px' }}>
                    <span style={{ fontWeight: 'bold' }}>Status:</span> Payment
                    Done Successfully. Please join the call
                  </p>
                  <Link
                    to={{
                      pathname: `/video-call/${item.userId}-${item.docId}`,
                      state: {
                        item,
                      },
                    }}
                    className='btn full'
                  >
                    Join Now
                  </Link>
                </div>
              )}

              {item.status === 'scheduled' && (
                <div>
                  <p style={{ fontSize: '25px', margin: '15px 8px' }}>
                    <span style={{ fontWeight: 'bold' }}>Status:</span> Waiting
                    for payment. You have scheduled the call at{' '}
                    <span style={{ fontWeight: 'bold' }}>
                      {dayjs(item.extraInfo).format('hh:mm A')}
                    </span>{' '}
                    on{' '}
                    <span style={{ fontWeight: 'bold' }}>
                      {dayjs(item.extraInfo).format('DD/MM/YYYY')}
                    </span>
                  </p>
                </div>
              )}

              {item.status === 'scheduledPayment' && item.paymentDone && (
                <div style={{ paddingBottom: '15px' }}>
                  <p style={{ fontSize: '25px', margin: '15px 8px' }}>
                    <span style={{ fontWeight: 'bold' }}>Status:</span> Payment
                    Done. Call Scheduled at{' '}
                    <span style={{ fontWeight: 'bold' }}>
                      {dayjs(item.extraInfo).format('hh:mm A')}
                    </span>{' '}
                    on{' '}
                    <span style={{ fontWeight: 'bold' }}>
                      {dayjs(item.extraInfo).format('DD/MM/YYYY')}
                    </span>
                  </p>
                  {dayjs().isSameOrAfter(dayjs(item.extraInfo)) && (
                    <Link
                      to={{
                        pathname: `/video-call/${item.userId}-${item.docId}`,
                        state: {
                          item,
                        },
                      }}
                      className='btn full'
                    >
                      Join Now
                    </Link>
                  )}
                </div>
              )}

              {item.status === 'deny' && (
                <p style={{ fontSize: '25px', margin: '15px 8px' }}>
                  <span style={{ fontWeight: 'bold' }}>Status: </span>Call has
                  been denied
                </p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <h3 className='text-center'>No pending calls</h3>
      )}
    </Layout>
  )
}

export default PendingCallPage
