import React, { useState } from 'react'
import { Link } from 'react-router-dom'

const LoginPage = () => {
  const [values, setValues] = useState({
    email: '',
    password: '',
  })

  const { email, password } = values

  const handleChange = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value })
  }

  const handleLogin = () => {
    console.log('Clicked')
    console.log(values)
  }

  return (
    <div className='container'>
      <h2>LoginPage</h2>

      <div className='form-control'>
        <label htmlFor='email'>Email: </label>
        <input
          type='email'
          placeholder='Enter your email'
          id='email'
          name='email'
          value={email}
          onChange={handleChange}
        />
      </div>

      <div className='form-control'>
        <label htmlFor='password'>Password: </label>
        <input
          type='password'
          placeholder='Enter your password'
          id='password'
          name='password'
          value={password}
          onChange={handleChange}
        />
      </div>

      <button onClick={handleLogin}>Login</button>
      <br />
      <Link to='/register'>Register</Link>
    </div>
  )
}

export default LoginPage
