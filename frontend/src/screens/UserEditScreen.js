import { useContext, useEffect, useReducer, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { Store } from "../Store";
import ErrorBox from "../subcomponents/ErrorBox";
import LoadingBox from "../subcomponents/LoadingBox";

const reducer = (state, action) => {
    switch (action.type) {
        case 'FETCH_REQUEST':
            return { ...state, loading: true };
        case 'FETCH_SUCCESS':
            return { ...state, loading: false };
        case 'FETCH_FAIL':
            return { ...state, loading: false, error: action.payload };
        case 'UPDATE_REQUEST':
            return { ...state, loadingUpdate: true };
        case 'UPDATE_SUCCESS':
            return { ...state, loadingUpdate: false };
        case 'UPDATE_FAIL':
            return { ...state, loadingUpdate: false };
        default:
            return state;
    }
};

const UserEditScreen = () => {
    const navigate = useNavigate();
    const [{ loading, error, loadingUpdate }, dispatch] = useReducer(reducer, {
        loading: true,
        error: ''
    });
    const { state } = useContext(Store);
    const { userInfo } = state;
    const params = useParams();
    const { id: userId } = params;

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                dispatch({ type: 'FETCH_REQUEST' });
                const response = await fetch(`/api/users/${userId}`, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${userInfo.token}`
                    }
                });
                const data = await response.json();
                setName(data.name);
                setEmail(data.email);
                setIsAdmin(data.isAdmin);
                dispatch({ type: 'FETCH_SUCCESS' });
            } catch (err) {
                dispatch({ type: 'FETCH_FAIL', payload: err });
            }
        };
        fetchData();
    }, [userId, userInfo]);

    const submitHandler = async (e) => {
        e.preventDefault();
        try {
            dispatch({ type: 'UPDATE_REQUEST' });
            const response = await fetch(`/api/users/${userId}`, {
                method: 'PUT',
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userInfo.token}`
                },
                body: JSON.stringify({
                    _id: userId,
                    name,
                    email,
                    isAdmin
                })
            });
            const data = await response.json();
            dispatch({ type: 'UPDATE_SUCCESS' });
            toast.success('User updated successfully');
            navigate('/admin/users');
        } catch (err) {
            toast.error(err);
            dispatch({ type: 'UPDATE_FAIL' });
        }
    };
    return (
        <div className="mx-auto w-4/12">
            <Helmet>
                <title>Edit User {userId}</title>
            </Helmet>
            <h1 className="text-4xl mt-4">Edit User {userId}</h1>
            {loading ? (<LoadingBox noMarginOrPadding></LoadingBox>) : error ? (<ErrorBox message={error}></ErrorBox>) : (
                <form className="mt-4" onSubmit={submitHandler}>
                    <div className="mb-3">
                        <label for="name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Name</label>
                        <input type="text" id="name" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-yellow-500 focus:border-yellow-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-yellow-500 dark:focus:border-yellow-500" value={name} required onChange={(e) => setName(e.target.value)}/>
                    </div>
                    <div className="mb-3">
                        <label for="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Email</label>
                        <input type="text" id="email" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-yellow-500 focus:border-yellow-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-yellow-500 dark:focus:border-yellow-500" value={email} required onChange={(e) => setEmail(e.target.value)}/>
                    </div>
                    <div className="mb-3 flex items-center">
                        <label for="isAdmin" className="my-auto block text-sm font-medium text-gray-900 dark:text-gray-300">isAdmin</label>
                        <div className="flex items-center">
                            <input type="checkbox" id="isAdmin" className="ml-2 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-yellow-500 focus:border-yellow-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-yellow-500 dark:focus:border-yellow-500" checked={isAdmin} onChange={(e) => setIsAdmin(e.target.checked)}/>
                        </div>
                    </div>
                    <button type="submit" disabled={loadingUpdate} className="mb-3 text-black bg-yellow-400 hover:bg-yellow-500 focus:ring-4 focus:outline-none focus:ring-yellow-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-yellow-600 dark:hover:bg-yellow-700 dark:focus:ring-yellow-800">Update</button>
                    {loadingUpdate && (<LoadingBox noMarginOrPadding></LoadingBox>)}
                </form>
            )}
        </div>
    )
};

export default UserEditScreen;