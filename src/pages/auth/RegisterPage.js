import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Link, useHistory } from 'react-router-dom'

import Button from 'components/shared/Forms/Button'
import Input from 'components/shared/Forms/Input'
import PasswordInput from 'components/shared/Forms/PasswordInput'

import { useAuth } from 'context/use-auth'

const LoginPage = () => {
  const { handleSubmit, register, errors } = useForm()
  const { registerUser, error, clearErrors, isAuthenticated } = useAuth()
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

  const onSubmit = ({ name, email, password }) => {
    registerUser({
      name,
      emailID: email,
      password,
      role: 'doctor',
    })
    clearErrors()
  }

  return (
    <div className='center'>
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
            Submit
          </Button>
        </form>
        <div className='flex-sbt py-10'>
          <span>Already have an account?</span>

          <Link to='/login' className='btn'>
            Login
          </Link>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
