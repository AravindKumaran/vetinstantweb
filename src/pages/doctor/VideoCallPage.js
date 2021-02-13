import React, { useState, useEffect, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from 'context/use-auth'
import toast from 'react-hot-toast'

import LoadingSpinner from 'components/shared/UI/LoadingSpinner'
import client from 'services/client'
import Layout from 'components/layouts/Layout'
import Room from 'components/videoCall/Room'

import './VideoCallPage.css'

const VideoCallPage = () => {
  const params = useParams()
  const { user } = useAuth()
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const getVideoToken = async () => {
      try {
        setLoading(true)
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
