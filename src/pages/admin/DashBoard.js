import React, { useEffect, useState, useMemo } from 'react'
import Layout from 'components/layouts/Layout'
import LoadingSpinner from 'components/shared/UI/LoadingSpinner'
import client from 'services/client'
import toast from 'react-hot-toast'
import { useTable } from 'react-table'

import './DashBoard.css'

const DashBoard = () => {
  const [allDoctors, setAllDoctors] = useState([])
  const [loading, setLoading] = useState(false)

  const columns = useMemo(
    () => [
      {
        Header: 'Name',
        accessor: 'user.name',
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
        // setDoctorDetails(res.data?.doctor)
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

  const handleBlock = async (doc) => {
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
