import { useState, useEffect } from 'react';
import { FaRegUser, FaEye, FaEyeSlash, FaGoogle } from 'react-icons/fa';
import { BiLock } from 'react-icons/bi';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login, googleLogin, facebookLogin, loginWithUrl } from './../redux/actions/authActions';
import { checkEmail } from './../utils/checkEmail';
import { GLOBAL_TYPES } from './../redux/types/globalTypes';
import { GOOGLE_CLIENT_ID, FACEBOOK_APP_ID } from './../utils/constant';
import GoogleLogin from 'react-google-login-lite';
import FacebookLogin from 'react-facebook-login-lite';
import Loader from './../components/general/Loader';
import HeadInfo from './../utils/HeadInfo';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { auth, alert, socket } = useSelector(state => state);
  const location = useLocation();

  const [userData, setUserData] = useState({
    email: '',
    password: ''
  });

  useEffect(() => {
    // Parse the query string
    const queryParams = new URLSearchParams(location.search);
    const accessData = queryParams.get('access_data');
    let parsedAccessData = null;

    if (accessData) {
      try {
        parsedAccessData = JSON.parse(decodeURIComponent(accessData));
        if (parsedAccessData) {
          dispatch(loginWithUrl(parsedAccessData, socket));
          queryParams.delete('access_data');
          navigate({
            pathname: location.pathname,
            search: queryParams.toString()
          }, { replace: true });
          // Reload the page after navigation
          window.location.reload();
        }
      } catch (e) {
        console.error('Failed to parse access_data', e);
      }
    }
  }, [location, navigate, dispatch, socket]);

  const onGoogleSuccess = response => {
    const { id_token } = response.getAuthResponse();
    dispatch(googleLogin(id_token, socket));
  };

  const onFacebookSuccess = response => {
    const { accessToken, userID } = response.authResponse;
    dispatch(facebookLogin(accessToken, userID, socket));
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setUserData({ ...userData, [name]: value });
  };

  const handleSubmit = async e => {
    e.preventDefault();

    if (!userData.email)
      return dispatch({ type: GLOBAL_TYPES.ALERT, payload: { errors: 'Please provide email field.' } });
    else if (!checkEmail(userData.email))
      return dispatch({ type: GLOBAL_TYPES.ALERT, payload: { errors: 'Please provide valid email address.' } });

    if (!userData.password)
      return dispatch({ type: GLOBAL_TYPES.ALERT, payload: { errors: 'Please provide password field.' } });

    await dispatch(login(userData, socket));
    setUserData({
      email: '', password: ''
    });
  };

  useEffect(() => {
    if (auth.user)
      navigate("/");
  }, [auth.user, navigate]);

  return (
    <>
      <HeadInfo title='Messenger - Login' />
      <div className='flex'>
        <div className='p-9 flex-1'>
          <div className='flex items-center mb-12'>
            <img src={`${process.env.PUBLIC_URL}/images/logo.png`} alt='Messenger' style={{ height: 150 }} />
            <h1 className='text-3xl ml-6 font-logo'>Messenger</h1>
          </div>
          <h1 className='text-3xl font-medium mb-7'>Sign In</h1>
          <form onSubmit={handleSubmit} className='mb-10'>
            <div className='border border-gray-500 flex items-center rounded-md px-3 mb-7'>
              <FaRegUser className='text-gray-500' />
              <input type='text' name='email' value={userData.email} onChange={handleChange} placeholder='Email Address' autoComplete='off' className='ml-5 w-full h-11 outline-0' />
            </div>
            <div className='mb-9'>
              <div className='border border-gray-500 flex items-center rounded-md px-3 pr-5 mb-3'>
                <BiLock className='text-gray-500 text-xl' />
                <input type={showPassword ? 'text' : 'password'} name='password' value={userData.password} onChange={handleChange} placeholder='Password' className='w-full h-11 outline-0 ml-5 pr-4' />
                {
                  showPassword
                    ? <FaEyeSlash className='text-gray-600 cursor-pointer' onClick={() => setShowPassword(false)} />
                    : <FaEye className='text-gray-600 cursor-pointer' onClick={() => setShowPassword(true)} />
                }
              </div>
            </div>
            <div className="flex flex-col items-center space-y-4">
              <a
                className="flex items-center justify-center w-full px-4 py-2 text-gray-800 bg-white border border-gray-200 rounded-full hover:bg-gray-100 transition"
                href={`${process.env.REACT_APP_SocialMedia_URL}/api/v1/auth/message/google`}
              >
                <FaGoogle className="mr-2 text-xl" />
                <span>Sign in with Google</span>
              </a>
              <button
                className={`flex items-center justify-center w-full px-4 py-2 text-white rounded-full transition ${alert.loading ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-700 cursor-pointer'}`}
                disabled={alert.loading}
              >
                {alert.loading ? <Loader /> : 'Sign In'}
              </button>
            </div>

          </form>
        </div>
        <div className='md:block hidden w-full flex-[2] pointer-events-none'>
          <img src={`${process.env.PUBLIC_URL}/images/authentication.png`} alt='Messenger Authentication' className='w-full h-screen object-cover' />
        </div>
      </div>
    </>
  );
};

export default Login;
