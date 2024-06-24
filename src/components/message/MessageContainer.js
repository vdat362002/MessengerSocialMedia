import { useState, useEffect, useCallback, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { MESSAGE_TYPES } from './../../redux/types/messageTypes'
import { checkTokenValidity } from './../../utils/checkTokenValidity'
import { getDataAPI } from './../../utils/fetchData'
import Loader from './../general/Loader'
import Message from './Message'
import HeadInfo from './../../utils/HeadInfo'
import { AiFillFileExcel, AiFillFilePdf, AiFillFilePpt, AiFillFileUnknown, AiFillFileWord, AiFillFileZip, AiOutlineDownload } from 'react-icons/ai'
import { BsCheck2All } from 'react-icons/bs'

const MessageContainer = ({ selectContact, messages, isSidebarOpen, calcHeight }) => {
  const [currPage, setCurrPage] = useState(2)
  const [isLoading, setIsLoading] = useState(false)
  const [firstLoad, setFirstLoad] = useState(false)
  const [activeTab, setActiveTab] = useState('images')

  const dispatch = useDispatch()
  const { auth, typing } = useSelector(state => state)

  const messageContainerRef = useRef()
  const loadMoreRef = useRef()

  const loadMoreMessages = useCallback(async () => {
    if (firstLoad) {
      const tokenValidity = await checkTokenValidity(auth.token, dispatch)
      const accessToken = tokenValidity ? tokenValidity : auth.token

      setIsLoading(true)
      const res = await getDataAPI(`message/${selectContact._id}?page=${currPage}`, accessToken)
      dispatch({
        type: MESSAGE_TYPES.LOAD_MESSAGE,
        payload: res.data
      })
      setCurrPage(prevVal => prevVal + 1)
      setIsLoading(false)
      document.getElementById('messageContainer').scroll(0, document.documentElement.scrollHeight + 300)
    }
  }, [auth.token, selectContact, currPage, dispatch, firstLoad])

  useEffect(() => {
    const observer = new IntersectionObserver(async entries => {
      if (entries[0].isIntersecting) {
        await loadMoreMessages()
      }
    }, {
      threshold: 1
    })

    if (messages.result === 9 * (currPage - 1) && !isLoading) {
      observer.observe(loadMoreRef.current)
    }
  }, [messages.result, isLoading, currPage, loadMoreMessages])

  useEffect(() => {
    if (messageContainerRef) {
      messageContainerRef.current.addEventListener('DOMNodeInserted', e => {
        const { currentTarget: target } = e
        target.scroll({ top: target.scrollHeight, behavior: 'smooth' })
      })
    }
  }, [])

  useEffect(() => {
    if (selectContact) {
      dispatch({ type: MESSAGE_TYPES.CLEAR_MESSAGE })
      setCurrPage(2)
      setFirstLoad(false)
    }
  }, [dispatch, selectContact])

  useEffect(() => {
    const load = setTimeout(() => {
      if (!firstLoad)
        setFirstLoad(true)
    }, 2000)

    return () => clearTimeout(load)
  }, [firstLoad])

  const filterMessages = (messages, filter) => {
    switch (filter) {
      case 'images':
        return messages.data.filter(msg => msg.media.length > 0)
      case 'files':
        return messages.data.filter(msg => msg.files.length > 0)
      case 'audio':
        return messages.data.filter(msg => msg.audio)
      default:
        return messages.data
    }
  }
  const renderFile = (file, idx) => {
    const fileExtension = file.split('.').pop().toLowerCase()
    const fileIcons = {
      'pdf': <AiFillFilePdf className='text-red-500 text-lg' />,
      'docx': <AiFillFileWord className='text-blue-500 text-lg' />,
      'doc': <AiFillFileWord className='text-blue-500 text-lg' />,
      'xlsx': <AiFillFileExcel className='text-green-500 text-lg' />,
      'xls': <AiFillFileExcel className='text-green-500 text-lg' />,
      'pptx': <AiFillFilePpt className='text-orange-500 text-lg' />,
      'ppt': <AiFillFilePpt className='text-orange-500 text-lg' />,
      'zip': <AiFillFileZip className='text-gray-500 text-lg' />,
      'unknown': <AiFillFileUnknown className='text-gray-500 text-lg' />
    }

    const fileIcon = fileIcons[fileExtension] || fileIcons['unknown']

    return (
      <div key={idx} className='flex items-center justify-between border rounded-md border-gray-500 p-3 pl-6 pr-6 gap-6 mb-2'>
        <div className='flex items-center justify-center gap-2'>
          {fileIcon}
          <p>{fileExtension.toUpperCase()} File</p>
        </div>
        <a href={file} alt={idx} target='_blank' rel='noreferrer'>
          <AiOutlineDownload className='text-lg' />
        </a>
      </div>
    )
  }
  return (
    <>
      <HeadInfo title={`Messenger - ${selectContact.name}`} />
      <div className="flex" style={{ height: calcHeight() }}>
        <div className='flex-1 overflow-x-hidden px-5 py-7 overflow-auto message-container bg-white text-black' id='messageContainer' ref={messageContainerRef}>
          {
            messages.result < 9 * (currPage - 1)
              ? ''
              : isLoading
                ? <Loader xl />
                : <button className='bg-gray-200 rounded-md p-3 w-full opacity-0' onClick={loadMoreMessages} ref={loadMoreRef}>Load More</button>
          }

          {
            filterMessages(messages, "all")?.map((item, idx) => (
              <Message
                key={idx}
                type={item.sender._id === auth.user?._id ? 'sender' : 'receiver'}
                sender={item.sender}
                recipientAvatar={item.sender?.profilePicture}
                message={item.text}
                media={item.media}
                audio={item.audio}
                files={item.files}
                isRead={item.isRead}
                call={item.call}
                timestamp={new Date(item.createdAt).toLocaleString()}
              />
            ))
          }
          <p className='animate-bounce'>{typing.message && typing.message}</p>
        </div>

        <div className={`transition-all duration-300 ${isSidebarOpen ? 'w-80 p-4' : 'w-0 p-0'} bg-white border-l border-gray-300`}>
          <div className="flex justify-between items-center mb-4">
            {isSidebarOpen && <h3 className="text-lg font-medium text-black">Media & Files</h3>}
          </div>
          <div className={`${isSidebarOpen ? 'block' : 'hidden'} h-full`}>
            <div className="space-y-4 p-4">
              <div className="flex">
                <button
                  className={`flex-1 p-2 border-b-2 ${activeTab === 'images' ? 'border-blue-500' : 'border-transparent'} text-center`}
                  onClick={() => setActiveTab('images')}
                >
                  Images
                </button>
                <button
                  className={`flex-1 p-2 border-b-2 ${activeTab === 'files' ? 'border-blue-500' : 'border-transparent'} text-center`}
                  onClick={() => setActiveTab('files')}
                >
                  Files
                </button>
                <button
                  className={`flex-1 p-2 border-b-2 ${activeTab === 'audio' ? 'border-blue-500' : 'border-transparent'} text-center`}
                  onClick={() => setActiveTab('audio')}
                >
                  Audio
                </button>
              </div>
            </div>
            <div className="mt-4 overflow-x-hidden overflow-auto" style={{ height: 'calc(100% - 120px)' }}>
              {
                filterMessages(messages, activeTab)?.map((item, idx) => {
                  if (activeTab === 'images' && item.media.length > 0)
                    return item.media.map((media, mediaIdx) => (
                      <div key={idx} className="p-2 bg-gray-300 rounded-md mb-2">
                        <img key={mediaIdx} src={media} alt="" className="w-full h-auto rounded-md mb-2" />
                      </div>
                    ))
                  if (activeTab === 'files' && item.files.length > 0)
                    return item.files.map((file, fileIdx) => (
                      <div key={idx} className="p-2 bg-gray-300 rounded-md mb-2">
                        {renderFile(file, fileIdx)}
                      </div>
                    ))
                  if (activeTab === 'audio' && item.audio)
                    return <div key={idx} className="p-2 bg-gray-300 rounded-md mb-2"> <audio controls src={item.audio} className="w-full"></audio></div>
                })
              }
            </div>
          </div>
        </div>
      </div >
    </>
  )
}

export default MessageContainer
