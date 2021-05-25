import axios from "axios";

const client = axios.create({
  // baseURL: 'http://192.168.43.242:8000/api/v1',
  // baseURL: 'https://vetinstantbe.azurewebsites.net/api/v1',
  baseURL:
    "https://ec2-13-126-97-116.ap-south-1.compute.amazonaws.com:8000/api/v1",
});

export default client;
