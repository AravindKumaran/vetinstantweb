import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { FcGoogle } from 'react-icons/fc'
import { Link, useHistory } from 'react-router-dom'

import Button from 'components/shared/Forms/Button'
import Input from 'components/shared/Forms/Input'
import PasswordInput from 'components/shared/Forms/PasswordInput'
import LoadingSpinner from 'components/shared/UI/LoadingSpinner'

import { useAuth } from 'context/use-auth'
import { GoogleLogin } from 'react-google-login'
import client from 'services/client'

const LoginPage = () => {
  const { handleSubmit, register, errors } = useForm()
  const {
    registerUser,
    error,
    clearErrors,
    isAuthenticated,
    loadUser,
    loading: cLoading,
  } = useAuth()
  const history = useHistory()
  const [loading, setLoading] = useState(false)

  console.log('C', cLoading)

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

  const onSubmit = ({ name, email, password }) => {
    registerUser({
      name,
      emailID: email,
      password,
      role: 'doctor',
    })
    clearErrors()
  }

  const handleGoogleAuth = async (res) => {
    console.log('Ress', res.profileObj)
    try {
      setLoading(true)
      const password = res.profileObj.googleId + Date.now()
      const googleRes = await client.post('/auth/saveGoogle', {
        name: res.profileObj.name,
        emailID: res.profileObj.email,
        password: password,
        role: 'doctor',
      })
      localStorage.setItem('token', googleRes.data.token)
      loadUser()
      setLoading(false)
    } catch (error) {
      console.log('Error', error)
      toast.error('Something Went Wrong! Please try after some time')
      setLoading(false)
    }
  }

  return (
    <div className='center'>
      {(loading || cLoading) && <LoadingSpinner asOverlay />}
      <div className='form__wrapper'>
        <form onSubmit={handleSubmit(onSubmit)}>
          <h2 className='text-center'>New User!</h2>

          <Input
            label='Name'
            name='name'
            type='text'
            placeholder='john doe'
            myRef={register({
              required: 'Please enter your name',
            })}
            error={errors.name}
          />
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
            Register
          </Button>
        </form>
        <hr />

        <GoogleLogin
          clientId='320113619885-gk7d3v66vs3bf4nksn6mf3tj2s6prgcs.apps.googleusercontent.com'
          buttonText='Login With Google'
          onSuccess={handleGoogleAuth}
          // onFailure={handleGoogleAuth}
          cookiePolicy={'single_host_origin'}
          render={(renderProps) => (
            <button onClick={renderProps.onClick} className='google_btn'>
              <div className='flex-center'>
                <FcGoogle style={{ fontSize: '2.5rem' }} />
                <span className='google__text'>Register With Google</span>
              </div>
            </button>
          )}
        />
      </div>
      <div className='flex-sbt py-10'>
        <span>Already have an account?</span>

        <Link to='/login' className='btn'>
          Login
        </Link>
      </div>
    </div>
  )
}

export default LoginPage
