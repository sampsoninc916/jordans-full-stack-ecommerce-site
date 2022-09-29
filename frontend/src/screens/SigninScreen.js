import { useContext, useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Store } from "../Store";
import { toast } from 'react-toastify';

const SigninScreen = () => {
    const navigate = useNavigate();
    const { search } = useLocation();
    const redirectInURL = new URLSearchParams(search).get('redirect');
    const redirect = redirectInURL ? redirectInURL : '/';

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const { state, dispatch: ctxDispatch } = useContext(Store);
    const { userInfo } = state;

    const submitHandler = async (e) => {
        e.preventDefault();
        const response = await fetch('/api/users/signin', {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email,
                password
            })
        });
        const data = await response.json();
        console.log(data);
        const { message } = data;
        if (!message) {
            ctxDispatch({ type: 'USER_SIGNIN', payload: data });
            localStorage.setItem('userInfo', JSON.stringify(data));
            navigate(redirect || '/');
        }
        toast.error(message);
    };

    useEffect(() => {
        if (userInfo) navigate(redirect);
    }, [navigate, redirect, userInfo]);

    return (
        <div className="mx-auto w-3/12">
            <Helmet>
                <title>Sign In</title>
            </Helmet>
            <h1 className="text-4xl mt-4">Sign In</h1>
            <form className="mt-4" onSubmit={submitHandler}>
                <div className="mb-3">
                    <label for="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Email</label>
                    <input type="email" id="email" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-yellow-500 focus:border-yellow-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-yellow-500 dark:focus:border-yellow-500" placeholder="name@flowbite.com" required onChange={(e) => setEmail(e.target.value)}/>
                </div>
                <div className="mb-3">
                    <label for="password" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Password</label>
                    <input type="password" id="password" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-yellow-500 focus:border-yellow-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-yellow-500 dark:focus:border-yellow-500" required onChange={(e) => setPassword(e.target.value)}/>
                </div>
                <button type="submit" className="text-black bg-yellow-400 hover:bg-yellow-500 focus:ring-4 focus:outline-none focus:ring-yellow-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-yellow-600 dark:hover:bg-yellow-700 dark:focus:ring-yellow-800">Sign In</button>
                <div className="flex items-start mb-3">
                    <span>New customer?{` `}<Link to={`/signup?redirect=${redirect}`}>Create your account</Link></span>
                </div>
            </form>
        </div>
    );
};

export default SigninScreen;