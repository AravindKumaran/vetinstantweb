import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { useHistory } from 'react-router-dom'

import Button from 'components/shared/Forms/Button'
import Input from 'components/shared/Forms/Input'
import LoadingSpinner from 'components/shared/UI/LoadingSpinner'
import client from 'services/client'

const ForgotPasswordPage = () => {
  const { handleSubmit, register, errors } = useForm()
  const history = useHistory()
  const [loading, setLoading] = useState(false)

  const onSubmit = async ({ email }) => {
    try {
      setLoading(true)
      await client.post('/auth/forgotpassword', { emailID: email })
      setLoading(false)
      toast.success('Email Sent! Please check your inbox')
      setTimeout(() => {
        history.replace('/login')
      }, 2000)
    } catch (error) {
      setLoading(false)
      toast.error(
        error.response?.data.msg || 'Something Went Wrong, Please try again!'
      )
    }
  }
  return (
    <div className='center'>
      {loading && <LoadingSpinner asOverlay />}
      <div className='form__wrapper'>
        <form onSubmit={handleSubmit(onSubmit)}>
          <h2 className='text-center' style={{ marginBottom: '40px' }}>
            Forgot Password?
          </h2>

          <Input
            name='email'
            type='email'
            placeholder='Enter your email address'
            myRef={register({
              required: 'Please enter your email',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'invalid email address',
              },
            })}
            error={errors.email}
          />

          <Button classNames='full' type='submit'>
            Submit
          </Button>
        </form>
      </div>
    </div>
  )
}

export default ForgotPasswordPage
