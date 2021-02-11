import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Link, useHistory } from 'react-router-dom'

import Button from 'components/shared/Forms/Button'
import Input from 'components/shared/Forms/Input'
import PasswordInput from 'components/shared/Forms/PasswordInput'
import LoadingSpinner from 'components/shared/UI/LoadingSpinner'

import { useAuth } from 'context/use-auth'
import setAuthToken from 'utils/setAuthToken'

const LoginPage = () => {
  const { handleSubmit, register, errors } = useForm()
  const { loginUser, error, clearErrors, isAuthenticated } = useAuth()
  const history = useHistory()

  useEffect(() => {
    if (isAuthenticated) {
      // setAuthToken(localStorage.token)
      history.replace('/')
    }

    if (error) {
      toast.error(error)
      clearErrors()
    }

    // eslint-disable-next-line
  }, [error, isAuthenticated])

  const onSubmit = ({ email, password }) => {
    console.log('cliekd')
    loginUser({
      emailID: email,
      password,
    })
    clearErrors()
  }

  return (
    <div className='center'>
      {/* {loading && <LoadingSpinner asOverlay />} */}
      <div className='form__wrapper'>
        <form onSubmit={handleSubmit(onSubmit)}>
          <h2 className='text-center'>Welcome</h2>

          <Input
            label='Email'
            name='email'
            type='email'
            placeholder='john@gmail.com'
            myRef={register({
              required: 'Please enter your email',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'invalid email address',
              },
            })}
            error={errors.email}
          />
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

          <Button classNames='full' type='submit'>
            Submit
          </Button>
        </form>

        <div className='flex-sbt py-10'>
          <span>Don't have an account?</span>

          <Link to='/register' className='btn'>
            Register
          </Link>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
