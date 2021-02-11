import React, { useEffect, useState } from 'react'
import { useAuth } from 'context/use-auth'
import client from 'services/client'
import toast from 'react-hot-toast'

import Layout from 'components/layouts/Layout'
import LoadingSpinner from 'components/shared/UI/LoadingSpinner'
import AddDoctorDetails from 'components/layouts/AddDoctorDetails'

import './HomePage.css'

const HomePage = () => {
  const { loadUser, user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [doctorDetails, setDoctorDetails] = useState()

  useEffect(() => {
    loadUser()
    // eslint-disable-next-line
  }, [])

  useEffect(() => {
    const getDoctorDetails = async () => {
      try {
        setLoading(true)
        const res = await client.get(`/doctors/user/${user._id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.token}`,
          },
        })
        setDoctorDetails(res.data.doctor)
        setLoading(false)
      } catch (err) {
        toast.error(
          err.response.data.msg
            ? 'Please add your details below'
            : 'Something Went Wrong! Try Again Later'
        )
        setLoading(false)
      }
    }
    if (user) {
      getDoctorDetails()
    }
  }, [user?._id])

  return (
    <Layout>
      {loading && <LoadingSpinner asOverlay />}
      {user && <h2 className='doc__title'>Welcome Doctor: {user.name}</h2>}
      {doctorDetails ? (
        <div className='doctor'>
          <h4>Here are your Details: </h4>
          <div className='doctor__card'>
            <h5>Phone Number:</h5>
            <p>{doctorDetails.phone}</p>
          </div>
          <div className='doctor__card'>
            <h5>Hospital/Clinic Name :</h5>
            <p>{doctorDetails.hospital.name}</p>
          </div>
          <div className='doctor__card'>
            <h5>Consultation Fees :</h5>
            <p>₹ {doctorDetails.fee}</p>
          </div>
          <div className='doctor__card'>
            <h5> Qualifications :</h5>
            <p>{doctorDetails.qlf}</p>
          </div>
          <div className='doctor__card'>
            <h5>Registration Number :</h5>
            <p>{doctorDetails.regNo}</p>
          </div>
          <div className='doctor__card'>
            <h5>Account Number :</h5>
            <p>{doctorDetails.accno}</p>
          </div>
          <div className='doctor__card'>
            <h5>Name On Card :</h5>
            <p>{doctorDetails.accname}</p>
          </div>
          <div className='doctor__card'>
            <h5>Account Type :</h5>
            <p>{doctorDetails.acctype}</p>
          </div>
          <div className='doctor__card'>
            <h5>IFSC Code :</h5>
            <p>{doctorDetails.ifsc}</p>
          </div>
          <div className='doctor__card'>
            <h5>Your Form File :</h5>
            <p>{doctorDetails.file}</p>
          </div>
          <div className='doctor__card'>
            <h5>Your Profile File :</h5>
            <p>{doctorDetails.profile}</p>
          </div>
        </div>
      ) : (
        <>
          <h3 className='text-center py-10'>Add Your Details Below!</h3>
          <AddDoctorDetails />
        </>
      )}
    </Layout>
  )
}

export default HomePage
