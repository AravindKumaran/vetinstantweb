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
  const [currentProblem, setCurrentProblem] = useState(null)
  const [previousProblem, setPreviousProblem] = useState(null)
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
      // console.log('PET', petRes)
      setPet(petRes.data.exPet)
      if (petRes.data.exPet.problems?.length > 0) {
        const allProb = petRes.data.exPet.problems.reverse()
        const curProbIndex = allProb.findIndex(
          (prob) => prob.docname === user.name
        )
        if (curProbIndex !== -1) {
          const cur = allProb[curProbIndex]
          setCurrentProblem(cur)
          allProb.splice(curProbIndex, 1)
          setPreviousProblem(allProb)
        } else {
          setPreviousProblem(allProb)
        }
      }
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
          title={`${currentPatient.senderName}'s Pet Details`}
        >
          <div className='chat-video_wrapper flex-center'>
            {/* <Link
              to={`/video-call/${currentPatient.name}`}
              className='btn flex-center'
            >
              <FiVideo className='icon' />
              Video Call
            </Link> */}
            <Link
              to={{
                pathname: `/chat/${currentPatient.name}`,
                state: { data: currentPatient },
              }}
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

              {currentProblem && <h5>Current Pet Problem: </h5>}
              {currentProblem && (
                <div className='pet__problems py-10'>
                  <h5>
                    Problem: <span>{currentProblem.problem}</span>
                  </h5>
                  <h5>
                    Doctor's Name: <span>{currentProblem.docname}</span>
                  </h5>
                  <h5>
                    Time Period: <span>{currentProblem.time}</span>
                  </h5>
                  <h5>
                    Appetite: <span>{currentProblem.Appetite}</span>
                  </h5>
                  <h5>
                    Behaviour: <span>{currentProblem.Behaviour}</span>
                  </h5>
                  <h5>
                    Eyes: <span>{currentProblem.Eyes}</span>
                  </h5>
                  <h5>
                    Comment: <span>{currentProblem.comment}</span>
                  </h5>
                  <h5>
                    Gait: <span>{currentProblem.Gait}</span>
                  </h5>
                  <h5>
                    Mucous: <span>{currentProblem.Mucous}</span>
                  </h5>

                  {currentProblem.Ears?.length > 0 && <h5>Ears: </h5>}

                  {currentProblem.Ears?.length > 0 &&
                    currentProblem.Ears.map((er, i) => (
                      <h3 key={`${i}-Ears`}> {er}</h3>
                    ))}

                  {currentProblem.Feces?.length > 0 && <h5>Faces: </h5>}

                  {currentProblem.Feces?.length > 0 &&
                    currentProblem.Feces.map((fc, i) => (
                      <h3 key={`Feces ${i}`}> {fc}</h3>
                    ))}
                  {currentProblem.Urine?.length > 0 && <h5>Urines: </h5>}

                  {currentProblem.Urine?.length > 0 &&
                    currentProblem.Urine.map((ur, i) => (
                      <h3 key={`Urines ${i}`}> {ur}</h3>
                    ))}
                  {currentProblem.Skin?.length > 0 && <h5>Skins: </h5>}

                  {currentProblem.Skin?.length > 0 &&
                    currentProblem.Skin.map((sk, i) => (
                      <h3 key={`Skins ${i}`}> {sk}</h3>
                    ))}

                  {currentProblem?.images?.length && <h5>Pet Problem image</h5>}
                  <div className='pet__history__images'>
                    {currentProblem?.images?.length > 0 &&
                      currentProblem.images.map((img, i) => (
                        <div key={`${img}-${i}`} className='pet__history__img'>
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
              )}

              {previousProblem?.length > 0 && <h5>Previous Pet Problems: </h5>}
              {previousProblem?.length > 0 &&
                previousProblem.map((pb, i) => (
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
      {patients.length === 0 && (
        <h3 className='text-center'>
          No Patients Have Contacted You, Please Comeback After Some Time!
        </h3>
      )}

      {patients.length > 0 && <h3 className='text-center'>Patients List:</h3>}
      {patients.length > 0 && (
        <div className='pat__grid center'>
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
