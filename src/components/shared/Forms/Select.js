import React from 'react'

const Select = ({ data, label, name, myRef, error }) => {
  return (
    <div className='form-group'>
      <label htmlFor={name}>{label}</label>
      <select
        ref={myRef}
        name={name}
        className={`form-control ${error ? 'error' : ''}`}
      >
        <option value=''>Please select a item</option>
        {data.length > 0 &&
          data.map((item, i) => (
            <option key={`${item.value}-${i}`} value={item.value}>
              {item.label}
            </option>
          ))}
      </select>
      {error && <p className='error-message'>{error.message}</p>}
    </div>
  )
}

export default Select
