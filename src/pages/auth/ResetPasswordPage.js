import React, { useEffect, useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { useHistory, useParams } from 'react-router-dom'

import Button from 'components/shared/Forms/Button'
import PasswordInput from 'components/shared/Forms/PasswordInput'
import LoadingSpinner from 'components/shared/UI/LoadingSpinner'

import client from 'services/client'

const ResetPasswordPage = () => {
  const { handleSubmit, register, errors, watch } = useForm()
  const pass = useRef()
  pass.current = watch('password', '')
  const history = useHistory()
  const params = useParams()
  const [loading, setLoading] = useState(false)

  const onSubmit = async ({ password }) => {
    try {
      setLoading(true)
      await client.post(`/auth/resetpassword/${params.token}`, { password })
      setLoading(false)
      toast.success('Password Reset Success! Please login')
      setTimeout(() => {
        history.replace('/login')
      }, 2000)
    } catch (error) {
      setLoading(false)
      toast.error(
        error.response?.data.msg || 'Something Went Wrong, Please try again!'
      )
      setTimeout(() => {
        history.replace('/login')
      }, 2000)
    }
  }
  return (
    <div className='center'>
      {loading && <LoadingSpinner asOverlay />}
      <div className='form__wrapper'>
        <form onSubmit={handleSubmit(onSubmit)}>
          <h2 className='text-center'>Reset Your Password</h2>

          <PasswordInput
            label='Password'
            name='password'
            placeholder='********'
            myRef={register({
              required: 'Please enter your password',
              minLength: {
                value: 8,
                message: 'Password must be atleast 8 characters long',
              },
            })}
            error={errors.password}
          />
          <PasswordInput
            label='Repeat Password'
            name='repeatpassword'
            placeholder='********'
            myRef={register({
              validate: (value) =>
                value === pass.current || 'The passwords do not match',
            })}
            error={errors.repeatpassword}
          />

          <Button classNames='full' type='submit'>
            Reset Password
          </Button>
        </form>
      </div>
    </div>
  )
}

export default ResetPasswordPage
