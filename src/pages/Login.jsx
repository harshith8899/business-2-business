import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Login.css'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Please fill in all fields')
      return
    }

    try {
      await login(email, password)
      navigate('/browse')
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.')
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-page__container">
        <div className="auth-page__header">
          <h1 className="auth-page__title">B2B Market</h1>
          <p className="auth-page__subtitle">Sign in to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-page__form">
          {error && (
            <div className="auth-page__error">{error}</div>
          )}

          <div className="auth-page__field">
            <label htmlFor="email" className="auth-page__label">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="auth-page__input"
              placeholder="you@company.com"
            />
          </div>

          <div className="auth-page__field">
            <label htmlFor="password" className="auth-page__label">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="auth-page__input"
              placeholder="••••••••"
            />
          </div>

          <button type="submit" className="auth-page__submit">
            Sign In
          </button>

          <div className="auth-page__footer">
            <p className="auth-page__footer-text">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => navigate('/register')}
                className="auth-page__link"
              >
                Sign up
              </button>
            </p>
          </div>
        </form>

        <div className="auth-page__demo">
          <p className="auth-page__demo-title">Demo: Create a test account to get started</p>
        </div>
      </div>
    </div>
  )
}

export default Login
