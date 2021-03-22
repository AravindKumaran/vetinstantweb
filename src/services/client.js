import axios from 'axios'

const client = axios.create({
  baseURL: 'http://192.168.43.242:8000/api/v1',
  // baseURL: 'https://vetinstantbe.azurewebsites.net/api/v1',
})

export default client
