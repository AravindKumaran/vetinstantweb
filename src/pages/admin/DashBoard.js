import React, { useEffect, useState, useMemo } from 'react'
import Layout from 'components/layouts/Layout'
import LoadingSpinner from 'components/shared/UI/LoadingSpinner'
import client from 'services/client'
import toast from 'react-hot-toast'
import { useTable } from 'react-table'
import Backdrop from 'components/shared/UI/Backdrop'
import Modal from 'components/shared/UI/Modal'

import './DashBoard.css'

const DashBoard = () => {
  const [allDoctors, setAllDoctors] = useState([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [currentDoc, setCurrentDoc] = useState('')

  const columns = useMemo(
    () => [
      {
        Header: 'Name',
        accessor: 'user.name',
        Cell: ({ row: { original } }) => (
          <p
            className='doc__name__link'
            onClick={() => handleShowDoctor(original)}
          >
            {original.user.name}
          </p>
        ),
      },
      {
        Header: 'Email',
        accessor: 'user.emailID',
      },
      {
        Header: 'Block',
        accessor: 'user.block',
        Cell: ({ row: { original } }) => (
          <p>{original.user.block === false ? 'No' : 'Yes'}</p>
        ),
      },
      {
        Header: 'Hospital Name',
        accessor: 'hospital.name',
      },
      {
        Header: 'Action',
        Cell: ({ row: { original } }) => (
          <button className='btn btn-row' onClick={() => handleBlock(original)}>
            {original.user.block === false ? 'Block' : 'UnBlock'}
          </button>
        ),
      },
    ],
    []
  )

  const data = useMemo(() => allDoctors, [allDoctors])

  useEffect(() => {
    const getAllDoctors = async () => {
      try {
        setLoading(true)
        const res = await client.get(`/doctors`, {
          headers: {
            Authorization: `Bearer ${localStorage.token}`,
          },
        })
        console.log('docos', res.data.doctors)
        setAllDoctors(res.data.doctors)
        setLoading(false)
      } catch (err) {
        if (err.response?.data?.msg) {
          toast.error('Something Went Wrong! Please try again later')
        }

        setLoading(false)
      }
    }

    getAllDoctors()
  }, [])

  const toggleModal = () => {
    setOpen(!open)
  }

  const handleShowDoctor = (doc) => {
    setCurrentDoc(doc)
    toggleModal()
  }

  const handleBlock = async (doc) => {
    console.log('Doc', doc)
    return
    doc.user.block = !doc.user.block
    try {
      setLoading(true)
      await client.patch(
        `/users/block/${doc.user._id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.token}`,
          },
        }
      )
      setLoading(false)
    } catch (err) {
      console.log('Error', err)
      toast.error('Something Went Wrong! Not able to block/unblock doctor')

      setLoading(false)
      return
    }
  }

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable({ columns, data })

  return (
    <Layout>
      {loading && <LoadingSpinner asOverlay />}
      {open && <Backdrop toggle={toggleModal} />}
      {open && (
        <Modal
          toggle={toggleModal}
          title={`Dr. ${currentDoc.user.name} Details`}
        >
          {currentDoc && (
            <div className='doctor'>
              <h4>Details: </h4>
              <div className='doctor__card'>
                <h5>Registration Number :</h5>
                <p>{currentDoc.regNo}</p>
              </div>
              <div className='doctor__card'>
                <h5>Phone Number:</h5>
                <p>{currentDoc.phone}</p>
              </div>
              <div className='doctor__card'>
                <h5>Hospital/Clinic Name :</h5>
                <p>{currentDoc?.hospital?.name}</p>
              </div>
              <div className='doctor__card'>
                <h5>Consultation Fees :</h5>
                <p>₹ {currentDoc.fee}</p>
              </div>
              <div className='doctor__card'>
                <h5> Qualifications :</h5>
                <p>{currentDoc.qlf}</p>
              </div>

              {+currentDoc.fee > 0 && (
                <>
                  <h4>Billing Details: </h4>
                  <div className='doctor__card'>
                    <h5>Bank Account Number :</h5>
                    <p>{currentDoc.accno}</p>
                  </div>
                  <div className='doctor__card'>
                    <h5>Account Holder Name :</h5>
                    <p>{currentDoc.accname}</p>
                  </div>
                  <div className='doctor__card'>
                    <h5>Account Type :</h5>
                    <p>{currentDoc.acctype}</p>
                  </div>
                  <div className='doctor__card'>
                    <h5>IFSC Code :</h5>
                    <p>{currentDoc.ifsc}</p>
                  </div>
                </>
              )}

              <div className='doctor__card'>
                <h5>Registration Certificate :</h5>
                <a
                  style={{ cursor: 'pointer' }}
                  href={currentDoc.file}
                  target='_blank'
                >
                  {currentDoc.file.split('/documents/')[1]}
                </a>
              </div>
            </div>
          )}
        </Modal>
      )}
      <div className='center'>
        <h1 className='py-10'>All Doctors</h1>
        <table {...getTableProps()}>
          <thead>
            {headerGroups.map((headerGroup) => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((column) => (
                  <th {...column.getHeaderProps()} className='table-header'>
                    {column.render('Header')}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()}>
            {rows.map((row) => {
              prepareRow(row)
              return (
                <tr {...row.getRowProps()}>
                  {row.cells.map((cell) => {
                    return (
                      <td {...cell.getCellProps()} className='table-rows'>
                        {cell.render('Cell')}
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </Layout>
  )
}

export default DashBoard
