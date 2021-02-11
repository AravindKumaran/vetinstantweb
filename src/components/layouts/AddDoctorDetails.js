import React, { useState, useEffect } from 'react'
import * as Yup from 'yup'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'

import Input from 'components/shared/Forms/Input'
import './AddDoctorDetails.css'
import Button from 'components/shared/Forms/Button'
import Select from 'components/shared/Forms/Select'
import client from 'services/client'
import toast from 'react-hot-toast'
import LoadingSpinner from 'components/shared/UI/LoadingSpinner'

const accType = [
  { label: 'Savings', value: 'savings' },
  { label: 'Current', value: 'current' },
]

const qualifs = [
  { label: 'BVSc', value: 'BVSc' },
  { label: 'BVSc& AH', value: 'BVSc& AH' },
  { label: 'MVSc', value: 'MVSc' },
  { label: 'PhD', value: 'PhD' },
]

const phoneRegExp = /^[6-9]\d{9}$/
const ifscRegExp = /^[A-Z]{4}0[A-Z0-9]{6}$/
const accRegExp = /^[0-9]{9,18}$/

const validationSchema = Yup.object().shape({
  hospname: Yup.string()
    .test(
      'samefield',
      'Please either enter or select Hospital name',
      function (value) {
        const { selectHospName } = this.parent
        if (selectHospName && value) return false
        if (!selectHospName) return value != null
        return true
      }
    )
    .max(100)
    .label('Hospital/Clinic Name'),
  selectHospName: Yup.string()
    .test(
      'samefield',
      'Please either enter or select Hospital name',
      function (value) {
        const { hospname } = this.parent
        if (hospname && value) return false
        if (!hospname) return value != null
        return true
      }
    )
    .nullable()
    .label('Hospital/Clinic Name'),
  phone: Yup.string()
    .matches(phoneRegExp, 'Phone number is not valid')
    .required()
    .label('Phone'),
  file: Yup.mixed()
    .required('Please select a .pdf form file')
    .test(
      'filleSize',
      'Please select a .pdf file of size less than 1 Mb',
      (value) => {
        if (value && value[0].type !== 'application/pdf') {
          return false
        }
        return value && value[0].size <= 1000000
      }
    )
    .label('Document'),
  profile: Yup.mixed()
    .required('Please select a .pdf profile file')
    .test(
      'profileSize',
      'Please select a .pdf file of size less than 5 Mb',
      (value) => {
        console.log('Fielss', value)
        if (value && value[0].type !== 'application/pdf') {
          return false
        }
        return value && value[0].size <= 5000000
      }
    )
    .label('Profile'),
  acc: Yup.string()
    .matches(accRegExp, 'Account Number not valid!')
    .required()
    .label('Account No.'),
  accname: Yup.string().required().label('Name'),
  type: Yup.string().required('Please Pick Account Type').label('Account Type'),
  qlf: Yup.string()
    .required('Please Pick a Qualifications')
    .label('Qualifications'),
  ifsc: Yup.string()
    .matches(ifscRegExp, 'IFSC code is not valid!')
    .required()
    .label('IFSC Code'),
  fee: Yup.string().required().label('Consultation Fee'),
  regNo: Yup.string().required().label('Registration Number'),
})

const AddDoctorDetails = () => {
  const { register, handleSubmit, errors } = useForm({
    resolver: yupResolver(validationSchema),
  })

  const [loading, setLoading] = useState(false)
  const [hospitals, setHopitals] = useState([])

  const [docFile, setDocFile] = useState(null)

  useEffect(() => {
    const getAllHospitals = async () => {
      setLoading(true)
      try {
        const res = await client.get('/hospitals', {
          headers: {
            Authorization: `Bearer ${localStorage.token}`,
          },
        })
        let allHospitals = res.data.hospitals

        let newHospitals = allHospitals.reduce((acc, item) => {
          acc.push({
            label: item.name.charAt(0).toUpperCase() + item.name.slice(1),
            value: item._id,
          })
          return acc
        }, [])
        setHopitals(newHospitals)
        setLoading(false)
      } catch (error) {
        toast.error('Something Went Wrong! Please try again later!')
        setLoading(false)
      }
    }
    getAllHospitals()
  }, [])

  const handleInput = (e) => {
    console.log('Files', e.target.files)
    setDocFile(e.target.files[0])
  }

  const onSubmit = async (values) => {
    const data = new FormData()
    if (!values.selectHospName) {
      try {
        setLoading(true)
        const hosRes = await client.post(
          '/hospitals',
          {
            name: values.hospname,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.token}`,
            },
          }
        )
        data.append('hospital', hosRes.data.newHospital._id)
        // setLoading(false)
      } catch (error) {
        setLoading(false)
        toast.error(error.response.data.msg)
      }
    } else {
      data.append('hospital', values.selectHospName)
    }

    data.append('file', docFile)
    // data.append('file', {
    //   name: 'file',
    //   type: 'application/pdf',
    //   uri: values.file[0].name,
    // })
    // data.append('profile', {
    //   name: 'profile',
    //   type: 'application/pdf',
    //   uri: values.profile[0].name,
    // })
    // data.append('profile', values.profile[0])
    data.append('phone', values.phone)
    data.append('accno', values.acc)
    data.append('accname', values.accname)
    data.append('acctype', values.type)
    data.append('ifsc', values.ifsc)
    data.append('fee', values.fee)
    data.append('qlf', values.qlf)
    data.append('regNo', values.regNo)

    for (var key of data.entries()) {
      console.log(key[0] + ', ' + key[1])
    }

    try {
      setLoading(true)
      const res = await client.post(
        '/doctors',
        {
          data,
        },
        {
          headers: {
            // 'Content-Type': 'multipart/form-data',
            'Content-Type':
              'multipart/form-data; boundary=<calculated when request is sent>',
            Authorization: `Bearer ${localStorage.token}`,
          },
        }
      )
      console.log('Res', res)
      setLoading(false)
      toast.success('Your data has been saved')
      // window.location.href = '/'
    } catch (error) {
      setLoading(false)
      toast.error(error.response.data.msg || 'Error in file submit')
    }
  }

  return (
    <div className='add__details'>
      {loading && <LoadingSpinner asOverlay />}
      <form onSubmit={handleSubmit(onSubmit)}>
        <Input
          element='textarea'
          label='Hospital/Clinic Name'
          placeholder='Hospital/Clinic Name'
          name='hospname'
          myRef={register}
          error={errors.hospname}
        />

        <Select
          data={hospitals}
          label='Select Hospital Name If Exists!'
          name='selectHospName'
          myRef={register}
          error={errors.selectHospName}
        />

        <Input
          label='Registration Number'
          name='regNo'
          type='numeric'
          placeholder='Enter your registration number'
          maxLength={10}
          myRef={register}
          error={errors.regNo}
        />

        <Select
          data={qualifs}
          label='Select Your Qualifications'
          name='qlf'
          myRef={register}
          error={errors.qlf}
        />

        <Input
          label='Document Form File'
          type='file'
          name='file'
          myRef={register}
          error={errors.file}
        />

        <Input
          label='Phone Number'
          name='phone'
          type='numeric'
          placeholder='Enter your phone number'
          maxLength={10}
          myRef={register}
          error={errors.phone}
        />
        <Input
          label='Consultation Fee'
          name='fee'
          type='numeric'
          placeholder='consultation fee in ruppes (₹)'
          myRef={register}
          error={errors.fee}
        />

        <Input
          label='Account Number'
          type='numeric'
          name='acc'
          maxLength={18}
          placeholder='xxxx xxxx xxxx xxxx'
          myRef={register}
          error={errors.acc}
        />

        <Input
          label='Name Of Merchant'
          name='accname'
          placeholder='Name Of Merchant'
          myRef={register}
          error={errors.accname}
        />

        <Select
          data={accType}
          label='Account Type'
          name='type'
          myRef={register}
          error={errors.type}
        />

        <Input
          label='IFSC Code'
          name='ifsc'
          placeholder='Enter your bank ifsc code'
          maxLength={11}
          myRef={register}
          error={errors.ifsc}
        />
        <Input
          label='Profile Document'
          type='file'
          name='profile'
          myRef={register}
          error={errors.profile}
        />

        <input type='file' name='file' onChange={handleInput} />

        <Button type='submit'>Submit</Button>
      </form>
    </div>
  )
}

export default AddDoctorDetails
