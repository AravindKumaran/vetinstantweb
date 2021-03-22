import React, { useEffect, useState, useMemo } from 'react'
import Layout from 'components/layouts/Layout'
import LoadingSpinner from 'components/shared/UI/LoadingSpinner'
import client from 'services/client'
import toast from 'react-hot-toast'
import { useTable } from 'react-table'

const Hospitals = () => {
  const [allHospitals, setAllHospitals] = useState([])
  const [loading, setLoading] = useState(false)

  const columns = useMemo(
    () => [
      {
        Header: 'Name',
        accessor: 'name',
      },
      {
        Header: 'Block',
        accessor: 'block',
        Cell: ({ row: { original } }) => (
          <p>{original.block === false ? 'No' : 'Yes'}</p>
        ),
      },
      {
        Header: 'Action',
        Cell: ({ row: { original } }) => (
          <button className='btn btn-row' onClick={() => handleBlock(original)}>
            {original.block === false ? 'Block' : 'UnBlock'}
          </button>
        ),
      },
    ],
    []
  )

  const data = useMemo(() => allHospitals, [allHospitals])

  useEffect(() => {
    const getAllHospitals = async () => {
      try {
        setLoading(true)
        const res = await client.get(`/hospitals`, {
          headers: {
            Authorization: `Bearer ${localStorage.token}`,
          },
        })
        setAllHospitals(res.data.hospitals)
        setLoading(false)
      } catch (err) {
        if (err.response?.data?.msg) {
          toast.error('Something Went Wrong! Please try again later')
        }

        setLoading(false)
      }
    }

    getAllHospitals()
  }, [])

  const handleBlock = async (hosp) => {
    hosp.block = !hosp.block
    setLoading(true)
    try {
      await client.patch(
        `/hospitals/block/${hosp._id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.token}`,
          },
        }
      )
    } catch (err) {
      console.log('Error', err)
      toast.error('Something Went Wrong! Not able to block/unblock doctor')

      setLoading(false)
      return
    }
    setLoading(false)
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
        <h1 className='py-10'>All Hospitals</h1>
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

export default Hospitals
