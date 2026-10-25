import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
  headers: { 'Content-Type': 'application/json' },
})

export const getEmployees = async () => {
  const response = await api.get('/employees')
  return response.data
}

export const createEmployee = async (employee) => {
  const response = await api.post('/employees', employee)
  return response.data
}

export const updateEmployee = async (id, employee) => {
  const response = await api.put(`/employees/${id}`, employee)
  return response.data
}

export const getApiError = (error) =>
  error?.response?.data?.message || 'Could not connect to the server. Check that the backend is running on port 8080.'
