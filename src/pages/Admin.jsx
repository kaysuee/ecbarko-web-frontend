import React, { useEffect, useState } from 'react'
import { deleteUser, get, post } from '../services/ApiEndpoint'
import { toast } from 'react-hot-toast'
import { Logout } from '../redux/AuthSlice'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'

export default function Admin() {
  const [users, setUsers] = useState('')
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const user = useSelector((state) => state.Auth.user)

  useEffect(() => {
    const GetUsers = async () => {
      try {
        const request = await get('/api/admin/getuser')
        const response = request.data
        if (request.status === 200) {
          setUsers(response.users)
        }
      } catch (error) {
        console.log(error)
      }
    }
    GetUsers()
  }, [])

  const handleDelet = async (id) => {
    try {
      const request = await deleteUser(`/api/admin/delet/${id}`)
      const response = request.data
      if (request.status === 200) {
        toast.success(response.message)
        setUsers(users.filter((user) => user._id !== id)) 
      }
    } catch (error) {
      if (error.response) {
        toast.error(error.response.data.message)
      }
    }
  }

  const handleLogout = async () => {
    try {
      const request = await post('/api/auth/logout')
      const response = request.data
      if (request.status === 200) {
        dispatch(Logout())
        navigate('/login')
      }
    } catch (error) {
      console.log(error)
    }
  }

  const gotoAdmin = () => {
    navigate('/admin')
  }

  return (
    <>
      <div className="admin-container">
        <div className="admin-header">
          <h2>Manage Users</h2>
          <div className="admin-actions">
            <button className="logout-btn" onClick={handleLogout}>Logout</button>
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {users && users.map((elem, index) => (
              <tr key={index}>
                <td>{elem.name}</td>
                <td>{elem.email}</td>
                <td>
                  <button onClick={() => handleDelet(elem._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
