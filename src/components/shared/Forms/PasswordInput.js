import React, { useState } from 'react'

import { FiEye, FiEyeOff } from 'react-icons/fi'
import './Input.css'

const PasswordInput = ({
  label,
  name,
  placeholder,
  myRef,
  error,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className='form-group'>
      <label htmlFor={name}>{label}</label>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'relative',
        }}
      >
        <input
          type={showPassword ? 'text' : 'password'}
          id={name}
          name={name}
          placeholder={placeholder}
          ref={myRef}
          className={`form-control ${error ? 'error' : ''}`}
          {...props}
        />
        <span
          style={{
            cursor: 'pointer',
            position: 'absolute',
            right: '5px',
          }}
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? <FiEyeOff /> : <FiEye />}
        </span>
      </div>

      {error && <p className='error-message'>{error.message}</p>}
    </div>
  )
}

export default PasswordInput
