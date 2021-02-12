import React from 'react'
import ReactDOM from 'react-dom'

import './Backdrop.css'

const Backdrop = ({ toggle }) => {
  return ReactDOM.createPortal(
    <div className='backdrop' onClick={toggle}></div>,
    document.getElementById('backdrop')
  )
}

export default Backdrop
