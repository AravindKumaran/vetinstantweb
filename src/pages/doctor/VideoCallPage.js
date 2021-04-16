import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import { useAuth } from 'context/use-auth'
import toast from 'react-hot-toast'

import LoadingSpinner from 'components/shared/UI/LoadingSpinner'
import client from 'services/client'
import Layout from 'components/layouts/Layout'
import Room from 'components/videoCall/Room'

import './VideoCallPage.css'

const VideoCallPage = () => {
  const params = useParams()
  const location = useLocation()
  console.log('Location', location.state.item)
  const { user } = useAuth()
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(false)

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

  return (
    <Layout>
      {loading && <LoadingSpinner asOverlay />}
      {token && (
        <Room roomName={params.id} token={token} handleLogout={handleLogout} />
      )}
    </Layout>
  )
}

export default VideoCallPage
