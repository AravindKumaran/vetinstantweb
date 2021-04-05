import toast from 'react-hot-toast'
import { onMessageListener } from '../firebaseInit'

const showNotifs = async () => {
  try {
    const payload = await onMessageListener()
    if (payload) {
      console.log('Payload', payload)
      const { title, body } = payload.data
      toast(` ${title} \n ${body}`, {
        icon: 'ⓘ',
      })
    }
  } catch (error) {
    console.log('Notif Error', error)
  }
}

export default showNotifs
