import { useState, useEffect } from 'react'
import { AiOutlineClose } from 'react-icons/ai'
import { FaRegUser } from 'react-icons/fa'
import { useDispatch, useSelector } from 'react-redux'
import { getDataAPI, patchDataAPI } from './../../utils/fetchData'
import { GLOBAL_TYPES } from './../../redux/types/globalTypes'
import { checkTokenValidity } from './../../utils/checkTokenValidity'
import Avatar from './../general/Avatar'
import Loader from './../general/Loader'
import Avt from "../../image/avt.png"
import PersonCard from '../general/PersonCard'

const SearchPeopleModal = ({ searchPeopleRef, openSearchPeopleModal, setOpenSearchPeopleModal, setSelectContact }) => {
  const [keyword, setKeyword] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState([])

  const dispatch = useDispatch()
  const { auth } = useSelector(state => state)

  const handleSubmit = async e => {
    e.preventDefault()
    if (!keyword) {
      setResult([])
      return dispatch({ type: GLOBAL_TYPES.ALERT, payload: { errors: 'Please provide key.' } })
    }

    const tokenValidityResult = await checkTokenValidity(auth.token, dispatch)
    const accessToken = tokenValidityResult ? tokenValidityResult : auth.token

    setLoading(true)

    await getDataAPI(`user/search/${keyword}`, accessToken)
      .then(res => setResult(res.data.filter(pp => pp._id != auth.user._id)))
      .catch(err => {
        setResult([])
        return dispatch({ type: GLOBAL_TYPES.ALERT, payload: { errors: err.response.data.msg } })
      })
    setLoading(false)
  }

  return (
    <div className={`${openSearchPeopleModal ? 'opacity-100' : 'opacity-0'} ${openSearchPeopleModal ? 'pointer-events-auto' : 'pointer-events-none'} transition-opacity fixed top-0 left-0 bottom-0 right-0 bg-[rgba(0,0,0,.6)] flex items-center justify-center p-5 z-[9999]`}>
      <div ref={searchPeopleRef} className={`${openSearchPeopleModal ? 'translate-y-0' : '-translate-y-12'} transition-transform w-full max-w-[400px] bg-white rounded-md`}>
        <div className='flex items-center justify-between px-5 py-3 border-b-2'>
          <h1 className='text-xl'>Search People</h1>
          <AiOutlineClose className='text-xl cursor-pointer' onClick={() => setOpenSearchPeopleModal(oldValue => !oldValue)} />
        </div>
        <div className='p-5'>
          <form onSubmit={handleSubmit}>
            <div className='w-full border-2 rounded-md py-2 px-3 flex items-center'>
              <FaRegUser className='text-gray-500 mr-3' />
              <input type='text' placeholder='Key Search' autoComplete='off' value={keyword} onChange={e => setKeyword(e.target.value)} className='w-full outline-0' />
            </div>
            <button type='submit' className={`${loading ? 'bg-blue-300' : 'bg-blue-500'} mt-4 ${!loading ? 'hover:bg-blue-600' : undefined} transition-[background] w-20 h-9 text-white rounded-md float-right ${loading ? 'cursor-not-allowed' : 'cursor-pointer'}`} disabled={loading ? true : false}>
              {
                loading
                  ? <Loader />
                  : 'Search'
              }
            </button>
            <div className='clear-both' />
          </form>

          {/* {
            Object.keys(result).length > 0 &&
            <div className='text-center border-2 shadow-lg w-fit m-auto rounded-md p-4 mt-6'>
              <div className='flex justify-center'>
                <Avatar src={result.profilePicture?.url || Avt} alt={result?.name} />
              </div>
              <h1 className='text-lg my-3'>{result?.name}</h1>
              {
                result?._id !== auth.user?._id &&
                <button className={`${loadingAddFriend ? 'bg-blue-300' : 'bg-blue-500'} ${!loadingAddFriend ? 'hover:bg-blue-600' : undefined} ${loading ? 'cursor-not-allowed' : 'cursor-pointer'} text-sm transition-[background] w-20 h-8 text-white rounded-md`} disabled={loadingAddFriend ? true : false} onClick={() => addFriend(result?.userId)}>
                  {
                    loadingAddFriend
                      ? <Loader />
                      : isFriend ? 'Chat' : 'Add Friend'
                  }
                </button>
              }
            </div>
          } */}
          {
            result.map(people => (
              <PersonCard key={people._id} id={people._id} avatar={people.profilePicture} name={people.name || `@${people.username}`} username={people.username} setOpenContactListModal={setOpenSearchPeopleModal} setSelectContact={setSelectContact} />
            ))
          }
        </div>
      </div>
    </div>
  )
}

export default SearchPeopleModal