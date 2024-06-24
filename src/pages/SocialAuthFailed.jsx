import { Link } from "react-router-dom";

const SocialAuthFailed = () => {

  return (
    <div className="container mx-auto pt-14 h-full">
      <h1 className="mt-8 text-2xl laptop:text-4xl text-gray-900 dark:text-white">
        Failed to authenticate
      </h1>
      <br />
      <h4 className="text-gray-600 dark:text-gray-400">Possible cause(s):</h4>
      <ul className="text-gray-500 list-disc ml-8">
        <li>
          Same email/username has been already linked to other social login
          e.g., Google
        </li>
      </ul>

      <Link
        to="/"
        className="inline-block mt-8 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:bg-blue-600"
      >
        Back to Login
      </Link>
    </div>
  );
};

export default SocialAuthFailed;
