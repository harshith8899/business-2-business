import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Login.css'

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [error, setError] = useState('')
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all fields')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    try {
      await register(formData.email, formData.password, formData.name)
      navigate('/browse')
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.')
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="auth-page">
      <div className="auth-page__container">
        <div className="auth-page__header">
          <h1 className="auth-page__title">B2B Market</h1>
          <p className="auth-page__subtitle">Create your account</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-page__form">
          {error && (
            <div className="auth-page__error">{error}</div>
          )}

          <div className="auth-page__field">
            <label htmlFor="name" className="auth-page__label">Full Name</label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              className="auth-page__input"
              placeholder="John Doe"
            />
          </div>

          <div className="auth-page__field">
            <label htmlFor="email" className="auth-page__label">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className="auth-page__input"
              placeholder="you@company.com"
            />
          </div>

          <div className="auth-page__field">
            <label htmlFor="password" className="auth-page__label">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              className="auth-page__input"
              placeholder="••••••••"
            />
          </div>

          <div className="auth-page__field">
            <label htmlFor="confirmPassword" className="auth-page__label">Confirm Password</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="auth-page__input"
              placeholder="••••••••"
            />
          </div>

          <button type="submit" className="auth-page__submit">
            Create Account
          </button>

          <div className="auth-page__footer">
            <p className="auth-page__footer-text">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="auth-page__link"
              >
                Sign in
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Register
