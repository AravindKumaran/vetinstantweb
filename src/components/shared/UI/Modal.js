import React from 'react'
import ReactDom from 'react-dom'
import './Modal.css'

const Modal = ({ title, toggle, children, footer }) => {
  const content = (
    <div className='modal__wrapper'>
      <div className='modal__content'>
        <div className='modal__header'>
          <h2>{title}</h2>
          <div className='close__btn' onClick={toggle}>
            x
          </div>
        </div>
        <div className='modal__body'>{children}</div>
        <div className='modal__footer'>{footer}</div>
      </div>
    </div>
  )
  return ReactDom.createPortal(content, document.getElementById('modal'))
}

export default Modal
