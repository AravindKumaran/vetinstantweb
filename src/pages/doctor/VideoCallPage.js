import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import { useAuth } from 'context/use-auth'
import toast from 'react-hot-toast'

import LoadingSpinner from 'components/shared/UI/LoadingSpinner'
import client from 'services/client'
import Layout from 'components/layouts/Layout'
import Room from 'components/videoCall/Room'
import Backdrop from 'components/shared/UI/Backdrop'
import Modal from 'components/shared/UI/Modal'

import './VideoCallPage.css'

const VideoCallPage = () => {
  const params = useParams()
  const location = useLocation()
  // console.log('Location', location.state.item)
  const { user } = useAuth()
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(false)
  const [pet, setPet] = useState(null)
  const [open, setOpen] = useState(false)
  const [petLoading, setPetLoading] = useState(false)
  const [currentProblem, setCurrentProblem] = useState(null)
  const [previousProblem, setPreviousProblem] = useState(null)

  const handleDeleteCall = async () => {
    // const callRes = await pendingsApi.singleCallPending(
    //   route.params?.item._id
    // )
    // if (callRes.ok) {
    //   const call = callRes.data.call
    //   call.userJoined && call.docJoined
    //     ? await pendingsApi.deleteCallPending(call._id)
    //     : await pendingsApi.updateCallPending(call._id, {
    //         userJoined: false,
    //       })
    // }
    const item = location.state.item
    try {
      const cRes = await client.get(`/pendingcalls/${item._id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.token}`,
        },
      })

      const call = cRes.data.call
      call.userJoined && call.docJoined
        ? await client.delete(`/pendingcalls/${item._id}`, {
            headers: {
              Authorization: `Bearer ${localStorage.token}`,
            },
          })
        : await client.patch(
            `/pendingcalls/${item._id}`,
            { docJoined: false },
            {
              headers: {
                Authorization: `Bearer ${localStorage.token}`,
              },
            }
          )
    } catch (error) {
      console.log('Error', error)
    }
  }

  useEffect(() => {
    const getVideoToken = async () => {
      try {
        setLoading(true)
        await client.patch(
          `/pendingcalls/${location.state.item._id}`,
          { docJoined: true },
          {
            headers: {
              Authorization: `Bearer ${localStorage.token}`,
            },
          }
        )
        const tokenRes = await client.post(
          `/users/getToken`,
          {
            userName: user.name,
            roomName: params.id,
          },
          {
            headers: { Authorization: `Bearer ${localStorage.token}` },
          }
        )
        setToken(tokenRes.data)
        setLoading(false)
      } catch (error) {
        console.log('Error', error)
        toast.error('Something went wrong! Please try again later!')
        setLoading(false)
      }
    }
    getVideoToken()
  }, [user.name])

  const handleLogout = useCallback((event) => {
    // handleDeleteCall()
    setToken(null)
    window.location.href = '/'
  }, [])
  const toggleModal = () => {
    setOpen(!open)
  }

  const handlePetModal = async (id) => {
    toggleModal()
    try {
      setPetLoading(true)
      const petRes = await client.get(`/pets/${location.state.item.petId}`, {
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
      {token && (
        <Room
          roomName={params.id}
          token={token}
          handleLogout={handleLogout}
          handlePetDetails={handlePetModal}
        />
      )}
    </Layout>
  )
}

export default VideoCallPage
