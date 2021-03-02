import React, { useState, useEffect } from 'react'
import Layout from 'components/layouts/Layout'
import { useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'

import Input from 'components/shared/Forms/Input'
import Button from 'components/shared/Forms/Button'
import LoadingSpinner from 'components/shared/UI/LoadingSpinner'
import { FiSend } from 'react-icons/fi'
import { useAuth } from 'context/use-auth'
import socket from 'services/socket'
import { nanoid } from 'nanoid'

import './ChatPage.css'
import client from 'services/client'
import toast from 'react-hot-toast'

const ChatPage = () => {
  const { user } = useAuth()
  const { handleSubmit, register, reset } = useForm()
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const loc = useLocation()
  const { name: roomName, petId, senderName } = loc.state?.data

  useEffect(() => {
    const getAllChats = async () => {
      setLoading(true)
      try {
        const chatRes = await client.get(`/chats/room/${roomName}/${petId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.token}`,
          },
        })
        // console.log('Res', chatRes)
        const sortedChat = chatRes.data.chats.sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        )
        setMessages(sortedChat)
        setLoading(false)

        socket.emit('room', roomName)
        socket.on('chat', (data) => {
          const sortedData = data.sort(
            (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
          )
          setMessages(sortedData)
        })
      } catch (error) {
        console.log('Error', error)
        setLoading(false)
        toast.error(
          error.response?.data?.msg || 'Something went wrong! Please try again!'
        )
      }
    }

    getAllChats()
    // console.log('Socket', socket)
  }, [])

  const handleSendMessage = async ({ msg }) => {
    // console.log('Mssd', msg)
    const newMsg = {
      text: msg,
      roomName: roomName,
      petId: petId,
      userId: user._id,
      userName: user.name,
    }

    // console.log('NewMsg', newMsg)

    try {
      setLoading(true)
      const res = await client.post('/chats', newMsg, {
        headers: {
          Authorization: `Bearer ${localStorage.token}`,
        },
      })
      console.log('ResPost', res.data.newChat)
      setLoading(false)
      const allMsg = [...messages, res.data.newChat].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      )
      socket.emit('chat', {
        room: roomName,
        msg: allMsg,
      })
    } catch (error) {
      setLoading(false)
      toast.error(
        error.response?.data.msg || 'Something went wrong! Please try again!'
      )
    }

    reset()
  }
  return (
    <Layout>
      {loading && <LoadingSpinner asOverlay />}
      <div className='chat center'>
        <div className='chat__container'>
          <h2 className='text-center py-10'>Chatting With {senderName}</h2>
          <div className='chat__messages'>
            {messages.length > 0 &&
              messages.map((msg) => (
                <div
                  key={msg._id}
                  className={
                    msg.userId === user._id
                      ? 'chat__messages__local'
                      : 'chat__messages__remote'
                  }
                >
                  <div className=' message'>
                    <p
                      className={
                        msg.userId === user._id ? 'local__msg' : 'remote__msg'
                      }
                    >
                      {msg.text}
                    </p>
                    <p className='msg__date__time'>
                      {new Date(msg.createdAt).toLocaleDateString()}
                    </p>
                    <p className='msg__date__time'>
                      {new Date(msg.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
          </div>
          <form onSubmit={handleSubmit(handleSendMessage)}>
            <div className='chat__input'>
              <Input
                element='textarea'
                placeholder='Enter your message'
                name='msg'
                rows={2}
                myRef={register({
                  required: 'Please enter your message',
                })}
                // error={errors.msg}
              />
              <Button>
                <FiSend />
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  )
}

export default ChatPage
