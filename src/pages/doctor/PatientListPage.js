import React, { useState, useEffect } from 'react'
import Layout from 'components/layouts/Layout'
import client from 'services/client'
import toast from 'react-hot-toast'
import { FiMessageCircle, FiVideo } from 'react-icons/fi'

import './PatientListPage.css'

import { useAuth } from 'context/use-auth'
import LoadingSpinner from 'components/shared/UI/LoadingSpinner'
import { FiChevronRight } from 'react-icons/fi'
import Backdrop from 'components/shared/UI/Backdrop'
import Modal from 'components/shared/UI/Modal'
import { Link } from 'react-router-dom'

const PatientListPage = () => {
  const { user } = useAuth()
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [currentPatient, setCurrentPatient] = useState()
  const [pet, setPet] = useState(null)
  const [petLoading, setPetLoading] = useState(false)

  useEffect(() => {
    const getPatients = async () => {
      setLoading(true)
      try {
        const res = await client.get(`/rooms/receiver/${user._id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.token}`,
          },
        })
        // console.log('Res', res)
        setPatients(res.data.room)
        setLoading(false)
      } catch (error) {
        // console.log(error)
        toast.error('Something Went Wrong! Please try again later!')
        setLoading(false)
      }
    }
    getPatients()
  }, [])

  const toggleModal = () => {
    setOpen(!open)
  }

  const handlePatModal = async (pat) => {
    setCurrentPatient(pat)
    toggleModal()
    try {
      setPetLoading(true)
      const petRes = await client.get(`/pets/${pat.petId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.token}`,
        },
      })
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
      {open && (
        <Modal
          toggle={toggleModal}
          title={`${currentPatient.senderName} pet details`}
        >
          <div className='chat-video_wrapper flex-center'>
            <Link
              to={`/video-call/${currentPatient.name}`}
              className='btn flex-center'
            >
              <FiVideo className='icon' />
              Video Call
            </Link>
            <Link
              to={`/chat/${currentPatient.name}`}
              className='btn flex-center'
            >
              <FiMessageCircle className='icon' />
              Chat
            </Link>
          </div>
          {petLoading && <LoadingSpinner asOverlay />}
          {pet && (
            <div className='pet__details'>
              <h5>
                Weight: <span>{pet.weight} Kg</span>
              </h5>

              <h5>
                Gender: <span>{pet.gender}</span>
              </h5>
              <h5>
                Pet Type: <span>{pet.type}</span>
              </h5>

              <h5>
                Age:
                <span>
                  {pet.years !== 0 && `${pet.years} years`}
                  {pet.months !== 0 && `${pet.months} months`}
                </span>
              </h5>

              {pet.petHistoryImages.length > 0 && (
                <>
                  <h5>Pet History Images: </h5>
                  <div className='pet__history__images'>
                    {pet.petHistoryImages.map((img, i) => (
                      <div key={`${img}-${i}`} className='pet__history__img'>
                        <img
                          src={`http://192.168.43.242:8000/${img}`}
                          width='160'
                          height='160'
                        />
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </Modal>
      )}
      {patients.length === 0 && (
        <h3 className='text-center'>
          No Patients Have Contacted You, Please Comeback After Some Time!
        </h3>
      )}

      {patients.length > 0 && (
        <h3 className='text-center'>Here are your patients list:</h3>
      )}
      {patients.length > 0 && (
        <div className='center'>
          {patients.map((pat) => (
            <div
              key={pat._id}
              className='patient__list'
              onClick={() => handlePatModal(pat)}
            >
              <div className='patient__list__item'>
                <p className='patient__list__item__img'>{pat.senderName[0]}</p>
                <p className='patient__list__item__name'>{pat.senderName}</p>
              </div>
              <FiChevronRight style={{ fontSize: '2.5rem' }} />
            </div>
          ))}
        </div>
      )}
    </Layout>
  )
}

export default PatientListPage
