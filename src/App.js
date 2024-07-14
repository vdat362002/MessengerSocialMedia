import { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { GLOBAL_TYPES } from './redux/types/globalTypes'
import { refreshToken } from './redux/actions/authActions'
import io from 'socket.io-client'
import Dashboard from './pages/dashboard'
import Login from './pages/login'
import PageRender from './utils/PageRender'
import Alert from './components/general/Alert'
import SocketClient from './SocketClient'
import CallModal from './components/modal/CallModal'
import Peer from 'peerjs'
import SocialAuthFailed from './pages/SocialAuthFailed'

const App = () => {
  const [isFirst, setIsFirst] = useState(true)
  const { auth, call } = useSelector(state => state)
  const dispatch = useDispatch()

  useEffect(() => {
    if (!("Notification" in window)) {
      alert('This browser does not support desktop notification')
    }
    else if (Notification.permission === 'granted') { }
    else if (Notification.permission === 'denied') {
      Notification.requestPermission().then(function (permission) {
        if (permission === 'granted') { }
      })
    }
  }, [])

  useEffect(() => {
    dispatch(refreshToken())
    const socket = io(process.env.REACT_APP_MESSAGE_URL)
    dispatch({ type: GLOBAL_TYPES.SOCKET, payload: socket })
    return () => socket.close()
  }, [dispatch])

  useEffect(() => {
    const peer = new Peer();

    dispatch({ type: GLOBAL_TYPES.PEER, payload: peer })
  }, [dispatch])

  useEffect(() => {
    setIsFirst(false)
  }, [auth])
  return (
    !isFirst && <Router>
      <Alert />
      {auth.token && <SocketClient />}
      {call && <CallModal />}
      <Routes>
        <Route path='/' element={auth.user ? <Dashboard /> : <Login />} />
        <Route path='/:page' element={<PageRender />} />
        <Route path='/:page/:id' element={<PageRender />} />
        <Route path='/auth/message/:provider/failed' element={<SocialAuthFailed />} />

      </Routes>
    </Router>
  )
}

export default App