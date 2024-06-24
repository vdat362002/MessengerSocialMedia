import { useState, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { IoChevronBackOutline, IoInformationCircle } from 'react-icons/io5'
import { AiOutlineSearch } from 'react-icons/ai'
import { MdLogout } from 'react-icons/md'
import { RiPhoneFill } from 'react-icons/ri'
import { IoVideocam } from 'react-icons/io5'
import { GLOBAL_TYPES } from './../../redux/types/globalTypes'
import { logout } from './../../redux/actions/authActions'
import SearchPeopleModal from './../modal/SearchPeopleModal'
import Avatar from './Avatar'
import Avt from "../../image/avt.png"

const Header = ({ selectContact, setSelectContact, isSidebarOpen, setIsSidebarOpen }) => {
  const [openDropdown, setOpenDropdown] = useState(false)
  const [openSearchPeopleModal, setOpenSearchPeopleModal] = useState(false)

  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { auth, socket, peer } = useSelector(state => state)

  const dropdownRef = useRef()
  const contactListRef = useRef()
  const searchPeopleRef = useRef()

  const handleLogout = async () => {
    await dispatch(logout(auth.token, socket))
    navigate('/')
  }

  const caller = ({ video }) => {
    const { _id, profilePicture, name, username } = selectContact
    const msg = {
      sender: auth.user?._id,
      recipient: _id,
      avatar: auth.user?.profilePicture,
      profilePicture: auth.user?.profilePicture,
      name: auth.user?.name,
      username: auth.user?.username,
      video,
      recipientName: name,
      recipientUsername: username,
      recipientAvatar: profilePicture
    }
    dispatch({ type: GLOBAL_TYPES.CALL, payload: msg })
  }

  const callUser = ({ video }) => {
    const { _id, profilePicture, name, username } = auth.user

    const msg = {
      sender: _id,
      recipient: selectContact._id,
      avatar: profilePicture,
      profilePicture: profilePicture,
      name,
      username,
      video,
      recipientUsername: selectContact.username,
      recipientName: selectContact.name,
      recipientAvatar: selectContact.profilePicture
    }

    if (peer.open) msg.peerId = peer._id

    socket.emit('callUser', msg)
  }

  const handleAudioCall = () => {
    caller({ video: false })
    callUser({ video: false })
  }

  const handleVideoCall = () => {
    caller({ video: true })
    callUser({ video: true })
  }

  useEffect(() => {
    const checkIflickedOutside = e => {
      if (openDropdown && dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpenDropdown(false)
      }
    }

    document.addEventListener('mousedown', checkIflickedOutside)
    return () => document.removeEventListener('mousedown', checkIflickedOutside)
  }, [openDropdown])

  useEffect(() => {
    const checkIflickedOutside = e => {
      if (SearchPeopleModal && searchPeopleRef.current && !searchPeopleRef.current.contains(e.target)) {
        setOpenSearchPeopleModal(false)
      }
    }

    document.addEventListener('mousedown', checkIflickedOutside)
    return () => document.removeEventListener('mousedown', checkIflickedOutside)
  }, [openSearchPeopleModal])



  return (
    <>
      <div className='bg-white flex items-center justify-between border-b-2 py-1 md:px-12 sticky top-0 px-4 z-[50]'>
        <div className='flex items-center'>
          <img src={`${process.env.PUBLIC_URL}/images/logo.png`} alt='Messenger' width='35' />
          <h1 className='md:block hidden font-logo text-lg ml-4'>Messenger</h1>
        </div>
        {
          selectContact &&
          <div className='text-center'>
            <div className='flex items-center'>
              {selectContact && <IoChevronBackOutline className='md:hidden block translate-y-[2px] cursor-pointer' onClick={() => setSelectContact(false)} />}
            </div>
            <div className='flex items-center mt-1'>
              <p>Message</p>
              <RiPhoneFill className='ml-4 text-lg cursor-pointer' onClick={handleAudioCall} />
              <IoVideocam className='ml-4 text-lg cursor-pointer' onClick={handleVideoCall} />
              <IoInformationCircle className='ml-4 text-lg cursor-pointer' onClick={() => setIsSidebarOpen(!isSidebarOpen)} />
            </div>
          </div>
        }
        <div className='flex items-center'>
          <p className='mr-5 md:block hidden'>{auth.user?.name}</p>
          <div className='relative'>
            <div className='cursor-pointer' onClick={() => setOpenDropdown(oldState => !oldState)}>
              <Avatar size='20px' src={auth.user?.profilePicture?.url || Avt} alt={auth.user?.name} />
            </div>
            <div ref={dropdownRef} className={`border-2 transition-transform absolute origin-top translate-y-[10px] top-full right-0 w-[190px] bg-white drop-shadow-xl rounded-md ${openDropdown ? 'scale-y-100' : 'scale-y-0'}`}>
              <div className='flex items-center p-3 hover:bg-gray-100 cursor-pointer border-b-2 rounded-tl-md rounded-tr-md' onClick={() => setOpenSearchPeopleModal(true)}>
                <AiOutlineSearch className='mr-2 translate-y-[1px]' />
                <p>Search People</p>
              </div>
              <div className='flex items-center p-3 hover:bg-gray-100 cursor-pointer rounded-bl-md rounded-br-md' onClick={handleLogout}>
                <MdLogout className='mr-2 translate-y-[2px] text-xl' />
                <p>Logout</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <SearchPeopleModal searchPeopleRef={searchPeopleRef} openSearchPeopleModal={openSearchPeopleModal} setOpenSearchPeopleModal={setOpenSearchPeopleModal} setSelectContact={setSelectContact} />
    </>
  )
}

export default Header