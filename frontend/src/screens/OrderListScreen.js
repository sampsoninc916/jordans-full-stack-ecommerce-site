import { useContext, useEffect, useReducer } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Store } from "../Store";
import ErrorBox from "../subcomponents/ErrorBox";
import LoadingBox from "../subcomponents/LoadingBox";

const reducer = (state, action) => {
    switch (action.type) {
        case 'FETCH_REQUEST':
            return { ...state, loading: true };
        case 'FETCH_SUCCESS':
            return { ...state, orders: action.payload, loading: false };
        case 'FETCH_FAIL':
            return { ...state, loading: false, error: action.payload };
        case 'DELETE_REQUEST':
            return { ...state, loadingDelete: true, successDelete: false };
        case 'DELETE_SUCCESS':
            return { ...state, loadingDelete: false, successDelete: false };
        case 'DELETE_FAIL':
            return { ...state, loadingDelete: false };
        case 'DELETE_RESET':
            return { ...state, loadingDelete: false, successDelete: false };
        default:
            return state;
    }
};

const OrderListScreen = () => {
    const navigate = useNavigate();
    const { state } = useContext(Store);
    const { userInfo } = state;
    const [{ loading, error, orders, loadingDelete, successDelete }, dispatch] = useReducer(reducer, {
        loading: true,
        error: ''
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                dispatch({ type: 'FETCH_REQUEST' });
                const response = await fetch(`/api/orders`, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${userInfo.token}`
                    }
                });
                const data = await response.json();
                const { message } = data;
                dispatch({ type: 'FETCH_SUCCESS', payload: data });
            } catch(err) {
                toast.error(err);
                dispatch({ type: 'FETCH_FAIL' });
            }
        };
        if (successDelete) {
            dispatch({ type: 'DELETE_RESET' });
        } else {
            fetchData();
        }
    }, [userInfo, successDelete]);

    const deleteHandler = async (order) => {
        if (window.confirm('Are you sure you want to delete?')) {
            try {
                dispatch({ type: 'DELETE_REQUEST' });
                const response = await fetch(`/api/orders/${order._id}`, {
                    method: 'DELETE',
                    mode: 'cors',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${userInfo.token}`
                    } 
                });
                const data = await response.json();
                toast.success('Order deleted successfully');
                dispatch({ type: 'DELETE_SUCCESS' });
            } catch(err) {
                toast.error(err);
                dispatch({ type: 'DELETE_FAIL' });
            }
        }
    };

    return (
        <div className="mx-auto w-10/12">
            <Helmet>
                <title>Orders</title>
            </Helmet>
            <h1 className="text-4xl mt-4">Orders</h1>
            {loadingDelete && (<LoadingBox noMarginOrPadding></LoadingBox>)}
            {loading ? (<LoadingBox noMarginOrPadding={false}></LoadingBox>) : error ? (<ErrorBox message={error}></ErrorBox>) : (
                <table className="my-3 w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <td scope="col" className="py-3 px-6">ID</td>
                            <td scope="col" className="py-3 px-6">USER</td>
                            <td scope="col" className="py-3 px-6">DATE</td>
                            <td scope="col" className="py-3 px-6">TOTAL</td>
                            <td scope="col" className="py-3 px-6">PAID</td>
                            <td scope="col" className="py-3 px-6">DELIVERED</td>
                            <td scope="col" className="py-3 px-6">ACTIONS</td>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((order) => (
                            <tr key={order._id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                <td scope="row" className="py-4 px-6">{order._id}</td>
                                <td scope="row" className="py-4 px-6">{order.user ? order.user.name : 'DELETED_USER'}</td>
                                <td scope="row" className="py-4 px-6">{order.createdAt.substring(0, 10)}</td>
                                <td scope="row" className="py-4 px-6">${order.totalPrice.toFixed(2)}</td>
                                <td scope="row" className="py-4 px-6">{order.isPaid ? order.paidAt.substring(0, 10) : 'No'}</td>
                                <td scope="row" className="py-4 px-6">{order.isDelivered ? order.deliveredAt.substring(0, 10) : 'No'}</td>
                                <td className="py-4 px-6">
                                    <button type="button" onClick={() => navigate(`/order/${order._id}`)} className="text-black bg-yellow-400 hover:bg-yellow-500 focus:ring-4 focus:outline-none focus:ring-yellow-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-yellow-600 dark:hover:bg-yellow-700 dark:focus:ring-yellow-800">Details</button>
                                    <button type="button" onClick={() => deleteHandler(order)} className="ml-3 text-black bg-yellow-400 hover:bg-yellow-500 focus:ring-4 focus:outline-none focus:ring-yellow-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-yellow-600 dark:hover:bg-yellow-700 dark:focus:ring-yellow-800">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default OrderListScreen;