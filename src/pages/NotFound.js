import React from 'react'
import Button from 'components/shared/Forms/Button'
import { useHistory } from 'react-router-dom'

const NotFound = () => {
  const history = useHistory()
  return (
    <div className='center' style={{ minHeight: '100vh' }}>
      <div>
        <h2>Page Doesn't exist</h2>
        <Button onClick={() => history.push('/')}>Go Back</Button>
      </div>
    </div>
  )
}

export default NotFound
