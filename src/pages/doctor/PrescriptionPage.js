import React, { useEffect, useState } from 'react'
import * as Yup from 'yup'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { useAuth } from 'context/use-auth'
import toast from 'react-hot-toast'
import Layout from 'components/layouts/Layout'

import './PrescriptionPage.css'
import LoadingSpinner from 'components/shared/UI/LoadingSpinner'
import Select from 'components/shared/Forms/Select'
import Input from 'components/shared/Forms/Input'
import Button from 'components/shared/Forms/Button'
import client from 'services/client'

const validationSchema = Yup.object().shape({
  patientName: Yup.string()
    .required('Please select a patient')
    .label('Patient Name'),
  prescription: Yup.string().max(300).required().label('Prescription'),
  photo: Yup.mixed()
    .test(
      'imageSize',
      'Please select a .jpeg/.jpg image of size less than 1 Mb',
      (value) => {
        if (value && value[0].type !== 'image/jpeg') {
          return false
        }
        return value && value[0].size <= 1000000
      }
    )
    .label('Image'),
})

const PrescriptionPage = () => {
  const { handleSubmit, register, errors } = useForm({
    resolver: yupResolver(validationSchema),
  })

  const { user } = useAuth()
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const getPatients = async () => {
      setLoading(true)
      try {
        const res = await client.get(`/rooms/receiver/${user._id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.token}`,
          },
        })
        let pateintss = res.data.room
        let newPatients = pateintss.reduce((acc, item) => {
          acc.push({
            label:
              item.senderName.charAt(0).toUpperCase() +
              item.senderName.slice(1),
            value: item.petId,
          })
          return acc
        }, [])
        setPatients(newPatients)
        setLoading(false)
      } catch (error) {
        // console.log(error)
        toast.error('Something Went Wrong! Please try again later!')
        setLoading(false)
      }
    }
    getPatients()
  }, [])

  const onSubmit = async (data) => {
    const formData = new FormData()
    if (data.photo[0]) {
      formData.append('photo', data.photo[0])
    }
    formData.append('prescription', data.prescription)
    formData.append('docname', user.name)
    for (var key of formData.entries()) {
      console.log(key[0] + ', ' + key[1])
    }

    try {
      setLoading(true)
      const petRes = await client.patch(
        `/pets/prescription/${data.patientName}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.token}`,
          },
        }
      )
      console.log('PetRes', petRes)
      toast.success('Prescription Send Successfully!')
      setLoading(false)
    } catch (error) {
      console.log('Error', error)
      toast.error('Something Went Wrong! Please try again later!')
      setLoading(false)
    }
  }

  return (
    <Layout>
      <div className='center'>
        {loading && <LoadingSpinner asOverlay />}
        <div className='prescription'>
          <h3 className='text-center'> Please Provide Your Prescription </h3>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Select
              label='Select Patient Name'
              data={patients}
              name='patientName'
              myRef={register}
              error={errors.patientName}
            />
            <Input
              label='Prescription'
              placeholder='Enter your prescription'
              element='textarea'
              rows={5}
              name='prescription'
              myRef={register}
              error={errors.prescription}
            />
            <Input
              type='file'
              label='Select image'
              name='photo'
              myRef={register}
              error={errors.photo}
            />
            <Button classNames='full' type='submit'>
              Send Prescription
            </Button>
          </form>
        </div>
      </div>
    </Layout>
  )
}

export default PrescriptionPage