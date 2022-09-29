import { useContext, useEffect, useReducer } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
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
        default:
            return state;
    }
};

const OrderHistoryScreen = () => {
    const { state } = useContext(Store);
    const { userInfo } = state;
    const navigate = useNavigate();
    const [{ loading, error, orders }, dispatch] = useReducer(reducer, {
        loading: true,
        error: ''
    });
    useEffect(() => {
        const fetchData = async () => {
            try {
                dispatch({ type: 'FETCH_REQUEST' });
                const response = await fetch(`/api/orders/mine`, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${userInfo.token}`
                    }
                });
                const data = await response.json();
                console.log(data);
                dispatch({ type: 'FETCH_SUCCESS', payload: data });
            } catch (err) {
                dispatch({ type: 'FETCH_FAIL', payload: err });
            }
        };
        fetchData();
    }, [userInfo]);
    return (
        <div className="mx-auto w-9/12">
            <Helmet>
                <title>Order History</title>
            </Helmet>
            <h1 className="text-4xl my-3">Order History</h1>
            {loading ? (<LoadingBox noMarginOrPadding={false}></LoadingBox>) : error ? (<ErrorBox message={error}></ErrorBox>) : (
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <td scope="col" className="py-3 px-6">ID</td>
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
                                <td scope="row" className="py-4 px-6">{order.createdAt.substring(0, 10)}</td>
                                <td scope="row" className="py-4 px-6">{order.totalPrice.toFixed(2)}</td>
                                <td scope="row" className="py-4 px-6">{order.isPaid ? order.paidAt.substring(0, 10) : 'No'}</td>
                                <td scope="row" className="py-4 px-6">{order.isDelivered ? order.deliveredAt.substring(0, 10) : 'No'}</td>
                                <td scope="row" className="py-4 px-6">
                                    <button type="button" onClick={() => navigate(`/order/${order._id}`)} className="text-black bg-yellow-400 hover:bg-yellow-500 focus:ring-4 focus:outline-none focus:ring-yellow-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-yellow-600 dark:hover:bg-yellow-700 dark:focus:ring-yellow-800">Details</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default OrderHistoryScreen;