import React, { useEffect, useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import * as Yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import toast from 'react-hot-toast'
import { FcGoogle } from 'react-icons/fc'
import { Link, useHistory } from 'react-router-dom'

import Button from 'components/shared/Forms/Button'
import Input from 'components/shared/Forms/Input'
import PasswordInput from 'components/shared/Forms/PasswordInput'
import LoadingSpinner from 'components/shared/UI/LoadingSpinner'
import Select from 'components/shared/Forms/Select'

import { useAuth } from 'context/use-auth'
import { GoogleLogin } from 'react-google-login'
import client from 'services/client'
import AddDoctorDetails from 'components/layouts/AddDoctorDetails'

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

const firstAv = [
  { label: 'Yes', value: true },
  { label: 'No', value: false },
]

const phoneRegExp = /^[6-9]\d{9}$/
const ifscRegExp = /^[A-Z]{4}0[A-Z0-9]{6}$/
const accRegExp = /^[0-9]{9,18}$/
const feeRegExp = /^[0-9]+$/
const emailRegExp = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i

const validationSchema = Yup.object().shape({
  name: Yup.string().required('Please enter your name').label('Name'),
  password: Yup.string()
    .required('Please enter your password')
    .min(8, 'Password must be atleast 8 characters long')
    .label('Password'),

  email: Yup.string()
    .matches(emailRegExp, 'Please enter valid email address')
    .required('Please enter your email')
    .label('Email'),

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
  regNo: Yup.string().required().label('Registration Number'),
  firstAvailaibeVet: Yup.string().required().label('First Available Vet'),
  qlf: Yup.string()
    .required('Please Pick a Qualifications')
    .label('Qualifications'),

  fee: Yup.string()
    .matches(feeRegExp, 'Please enter your fee')
    .required()
    .label('Consultation Fee'),
  acc: Yup.string()
    .matches(accRegExp, 'Bank Account Number not valid!')
    .test('acctest', 'Account number is required', function (value) {
      const { fee } = this.parent
      if (fee > 0 && !value) return false
      return true
    })
    .label('Account No.'),
  accname: Yup.string()
    .test('accnametest', 'Account name is required', function (value) {
      const { fee } = this.parent
      if (fee > 0 && !value) return false
      return true
    })
    .label('Name'),
  type: Yup.string()
    .test('acctyppe', 'Please select account type', function (value) {
      const { fee } = this.parent
      if (fee > 0 && !value) return false
      return true
    })
    .label('Account Type'),
  // .nullable()

  ifsc: Yup.string()
    .test('accifsc', 'IFSC code is required', function (value) {
      const { fee } = this.parent
      if (fee > 0 && !value) return false
      return true
    })
    .matches(ifscRegExp, 'IFSC code is not valid!')
    .label('IFSC Code'),
})

const LoginPage = () => {
  const { handleSubmit, register, errors, watch } = useForm({
    resolver: yupResolver(validationSchema),
  })
  const {
    registerUser,
    error,
    clearErrors,
    isAuthenticated,
    loadUser,
    msg,
    loading: cLoading,
    user,
  } = useAuth()
  const history = useHistory()
  const feeRef = useRef()
  feeRef.current = watch('fee', '')

  const [loading, setLoading] = useState(false)
  const [googleSignUp, setGoogleSignUp] = useState(false)
  const [hospitals, setHopitals] = useState([])

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

  useEffect(() => {
    if (isAuthenticated && user.role === 'doctor') {
      // setAuthToken(localStorage.token)
      history.replace('/')
    } else if (isAuthenticated && user.role === 'admin') {
      // setAuthToken(localStorage.token)
      history.replace('/dashboard')
    }

    if (error) {
      toast.error(error)
      clearErrors()
    }

    if (msg) {
      toast.success(msg)
      clearErrors()
    }

    // eslint-disable-next-line
  }, [error, isAuthenticated, msg])

  const onSubmit = async (values) => {
    console.log('Values', values)
    const regData = {
      name: values.name,
      emailID: values.email,
      password: values.password,
      role: 'doctor',
    }
    try {
      setLoading(true)
      const res = await client.post('/auth/signup', regData)
      localStorage.setItem('token', res.data.token)
    } catch (err) {
      setLoading(false)
      toast.error(
        err.response?.data.msg || 'Something Went Wrong! Try Again Later'
      )
    }
    const data = new FormData()
    let hsp = ''
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
        hsp = hosRes.data.newHospital._id
        data.append('hospital', hosRes.data.newHospital._id)
        // setLoading(false)
      } catch (error) {
        setLoading(false)
        toast.error(error.response.data.msg)
      }
    } else {
      hsp = values.selectHospName
      data.append('hospital', values.selectHospName)
    }

    data.append('file', values.file[0])
    data.append('phone', values.phone)
    data.append('qlf', values.qlf)
    data.append('firstAvailaibeVet', values.firstAvailaibeVet)
    data.append('regNo', values.regNo)
    data.append('fee', values.fee)
    if (+values.fee > 0) {
      data.append('accno', values.acc)
      data.append('accname', values.accname)
      data.append('acctype', values.type)
      data.append('ifsc', values.ifsc)
    }
    try {
      setLoading(true)
      await client.patch(
        '/users/updateDoctorHosp',
        { hospitalId: hsp },
        {
          headers: {
            Authorization: `Bearer ${localStorage.token}`,
          },
        }
      )
      const res = await client.post('/doctors', data, {
        headers: {
          'Content-Type':
            'multipart/form-data; boundary=<calculated when request is sent>',
          Authorization: `Bearer ${localStorage.token}`,
        },
      })
      console.log('Res', res)
      localStorage.removeItem('token')
      setLoading(false)
      toast.success('Registration SuccessFull! Please wait for approval')
      window.location.href = '/'
    } catch (error) {
      setLoading(false)
      toast.error(error.response?.data?.msg || 'Error in file submit')
    }
  }

  const handleGoogleAuth = async (res) => {
    try {
      setLoading(true)
      const password = res.profileObj.googleId + Date.now()
      const googleRes = await client.post('/auth/saveGoogle', {
        name: res.profileObj.name,
        emailID: res.profileObj.email,
        password: password,
        role: 'doctor',
      })

      // console.log('GoogleRes', googleRes)

      localStorage.setItem('token', googleRes.data.token)
      // loadUser()
      setLoading(false)
      setGoogleSignUp(true)
    } catch (error) {
      console.log('Error', error)
      toast.error(
        error.response?.data?.msg ||
          'Something Went Wrong! Please try after some time'
      )
      setLoading(false)
    }
  }

  return (
    <div className='center'>
      {loading && <LoadingSpinner asOverlay />}
      {!googleSignUp ? (
        <>
          <div className='form__wrapper'>
            <form onSubmit={handleSubmit(onSubmit)}>
              <h2 className='text-center'>New User!</h2>

              <Input
                label='Name'
                name='name'
                type='text'
                placeholder='john doe'
                myRef={register}
                error={errors.name}
              />
              <Input
                label='Email'
                name='email'
                type='email'
                placeholder='john@gmail.com'
                myRef={register}
                error={errors.email}
              />
              <PasswordInput
                label='Password'
                name='password'
                placeholder='********'
                myRef={register}
                error={errors.password}
              />

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
                data={firstAv}
                label='Want to be first available vet?'
                name='firstAvailaibeVet'
                myRef={register}
                error={errors.firstAvailaibeVet}
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
                placeholder='₹ 500'
                myRef={register}
                error={errors.fee}
              />

              {Number(feeRef.current) > 0 && (
                <>
                  <Input
                    label='Bank Account Number'
                    type='numeric'
                    name='acc'
                    maxLength={18}
                    placeholder='xxxx xxxx xxxx xxxx'
                    myRef={register}
                    error={errors.acc}
                  />

                  <Input
                    label='Account Holder Name'
                    name='accname'
                    placeholder='Account Holder Name'
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
                </>
              )}

              <Button classNames='full' type='submit'>
                Register
              </Button>
            </form>
            <hr />

            <GoogleLogin
              clientId='320113619885-gk7d3v66vs3bf4nksn6mf3tj2s6prgcs.apps.googleusercontent.com'
              buttonText='Login With Google'
              onSuccess={handleGoogleAuth}
              // onFailure={handleGoogleAuth}
              cookiePolicy={'single_host_origin'}
              render={(renderProps) => (
                <button onClick={renderProps.onClick} className='google_btn'>
                  <div className='flex-center'>
                    <FcGoogle style={{ fontSize: '2.5rem' }} />
                    <span className='google__text'>Register With Google</span>
                  </div>
                </button>
              )}
            />
          </div>
          <div className='flex-sbt py-10'>
            <span>Already have an account?</span>

            <Link to='/login' className='btn'>
              Login
            </Link>
          </div>
        </>
      ) : (
        <>
          <h2 className='text-center py-10'>Please Add Your Details Below!</h2>
          <AddDoctorDetails msg='Registration SuccessFull! Please wait for approval' />
        </>
      )}
    </div>
  )
}

export default LoginPage
