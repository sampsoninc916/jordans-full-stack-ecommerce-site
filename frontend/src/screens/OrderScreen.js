import LoadingBox from "../subcomponents/LoadingBox";
import ErrorBox from "../subcomponents/ErrorBox";
import SuccessBox from "../subcomponents/SuccessBox";
import { useReducer, useEffect, useContext } from "react";
import { PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js';
import { Link, useNavigate, useParams } from "react-router-dom";
import { Store } from "../Store";
import { Helmet } from "react-helmet-async";
import { toast } from "react-toastify";

const reducer = (state, action) => {
    switch (action.type) {
        case 'FETCH_REQUEST':
            return { ...state, loading: true, error: '' };
        case 'FETCH_SUCCESS':
            return { ...state, loading: false, order: action.payload, error: '' };
        case 'FETCH_FAIL':
            return { ...state, loading: false, error: action.payload };
        case 'PAY_REQUEST':
            return { ...state, loadingPay: true };
        case 'PAY_SUCCESS':
            return { ...state, loadingPay: false, successPay: true };
        case 'PAY_FAIL':
            return { ...state, loadingPay: false };
        case 'PAY_RESET':
            return { ...state, loadingPay: false, successPay: false };
        case 'DELIVER_REQUEST':
            return { ...state, loadingDeliver: true };
        case 'DELIVER_SUCCESS':
            return { ...state, loadingDeliver: false, successDeliver: true };
        case 'DELIVER_FAIL':
            return { ...state, loadingDeliver: false };
        case 'DELIVER_RESET':
            return { ...state, loadingDeliver: false, successDeliver: false };
        default:
            return state;
    }
};

const OrderScreen = () => {
    const params = useParams();
    const { id: orderId } = params;
    const navigate = useNavigate();
    const { state } = useContext(Store);
    const { userInfo } = state;
    const [{ loading, error, order, successPay, loadingPay, loadingDeliver, successDeliver }, dispatch] = useReducer(reducer, {
        loading: true,
        order: {},
        error: '',
        successPay: false,
        loadingPay: false
    });
    const [{ isPending }, paypalDispatch] = usePayPalScriptReducer();
    const createOrder = (data, actions) => {
        return actions.order.create({
            purchase_units: [
                {
                    amount: { value: order.totalPrice }
                }
            ]
        }).then((orderID) => {
            return orderID;
        });
    };
    const onApprove = (data, actions) => {
        console.log(data);
        console.log(actions);
        console.log(actions.order.capture());
        return actions.order.capture().then(async (details) => {
            // console.log(details);
            dispatch({ type: 'PAY_REQUEST' });
            console.log(details);
            // console.log(details);
            const response = await fetch(`/api/orders/${order._id}/pay`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userInfo.token}`
                },
                body: JSON.stringify(details)
            });
            const data = await response.json();
            console.log(data);
            const { message } = data;
            if (message !== 'Order Not Found') {
                dispatch({ type: 'PAY_SUCCESS', payload: data });
                toast.success('Order Is Paid');
            } else {
                dispatch({ type: 'PAY_FAIL', payload: message });
                toast.error(message);
            }
        });
    };
    const onError = (err) => {
        toast.error(err);
    };
    useEffect(() => {
        const fetchOrder = async () => {
            try {
                dispatch({ type: 'FETCH_REQUEST' });
                const response = await fetch(`/api/orders/${orderId}`, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${userInfo.token}`
                    }
                });
                const data = await response.json();
                // const { message } = data;
                console.log(data);
                dispatch({ type: 'FETCH_SUCCESS', payload: { ...data, _id: orderId }});
            } catch (err) {
                console.log(err);
                dispatch({ type: 'FETCH_FAIL', payload: err });
            }
        };
        if (!userInfo) return navigate('/login');
        if (!order._id || successPay || successDeliver || (order._id && order._id !== orderId)) {
            fetchOrder();
            if (successPay) dispatch({ type: 'PAY_RESET' });
            if (successDeliver) dispatch({ type: 'DELIVER_RESET' });
        } else {
            const loadPaypalScript = async () => {
                const response = await fetch(`/api/keys/paypal`, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${userInfo.token}`
                    }
                });
                const clientId = await response.text();
                paypalDispatch({
                    type: 'resetOptions',
                    value: {
                        'client-id': clientId,
                        currency: 'USD'
                    }
                });
                paypalDispatch({ type: 'setLoadingStatus', value: 'pending' });
            };
            loadPaypalScript();
        }
    }, [order, userInfo, orderId, navigate, paypalDispatch, successPay, successDeliver]);

    const deliverOrderHandler = async () => {
        try {
            dispatch({ type: 'DELIVER_REQUEST' });
            const response = await fetch(`/api/orders/${order._id}/deliver`, {
                method: 'PUT',
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userInfo.token}`
                },
                body: JSON.stringify({})
            });
            const data = await response.json();
            dispatch({ type: 'DELIVER_SUCCESS', payload: data });
            toast.success('Order is delivered');
        } catch(err) {
            toast.error(err);
            dispatch({ type: 'DELIVER_FAIL' });
        }
    };

    return loading ? (<LoadingBox noMarginOrPadding={false}></LoadingBox>) : error ? (<ErrorBox message={error}></ErrorBox>) : (
        <div className="mx-auto w-6/12">
            <Helmet>
                <title>Order {orderId}</title>
            </Helmet>
            <h1 className="text-4xl my-3">Order {orderId}</h1>
            <div className="flex mx-auto">
                <div className="justify-center p-4 grid grid-cols-2 mx-auto">
                    <div className="grid gap-3">
                        <div className="grid bg-white border border-black rounded-lg pl-4 pr-4">
                            <h1 className="text-lg">Shipping</h1>
                            <span><strong className="">Name: </strong>{order.shippingAddress.fullName}</span>
                            <span><strong className="">Address: </strong>{order.shippingAddress.address}, {order.shippingAddress.city}, {order.shippingAddress.postalCode}, {order.shippingAddress.country}</span>
                            {order.isDelivered ? (<SuccessBox message={`Delivered at ${order.deliveredAt}`}></SuccessBox>) : (<ErrorBox message={`Not Delivered`}></ErrorBox>)}
                        </div>
                        <div className="grid bg-white border border-black rounded-lg pl-4 pr-4">
                            <h1 className="text-lg">Payment</h1>
                            <span><strong className="">Method: </strong>{order.paymentMethod}</span>
                            {order.isPaid ? (<SuccessBox message={`Paid at ${order.paidAt}`}></SuccessBox>) : (<ErrorBox message={`Not Paid`}></ErrorBox>)}
                        </div>
                        <div className="grid bg-white border border-black rounded-lg pl-4 pr-4">
                            <h1 className="text-lg">Items</h1>
                            <ul>
                                {order.orderItems.map((item) => (
                                    <li key={item._id} className="mt-2 mb-2">
                                        <div className="flex justify-between">
                                            <div className="grid grid-cols-4 flex">
                                                <img src={item.image} alt={item.name} className="border border-slate-400 rounded img-thumbnail"></img>{' '}
                                                <Link to={`/product/${item.slug}`} className="my-auto">{item.name}</Link>
                                            </div>
                                            <div className="grid grid-cols-3 flex">
                                                <span className="my-auto text-center w-8">{item.quantity}</span>
                                            </div>
                                            <div className="grid grid-cols-3 my-auto ml-10">${item.price}</div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    <div className="grid">
                        <div className="bg-white border border-black rounded-lg pl-4 pr-4 ml-4 mx-auto w-full">
                            <h1 className="text-2xl mb-4">Order Summary</h1>
                            <ul className="grid grid-rows-6 mb-4 mt-4">
                                <li className="grid grid-cols-2 flex">
                                    <span>Items</span>
                                    <span>${order.itemsPrice.toFixed(2)}</span>
                                </li>
                                <hr className="text-slate-400"></hr>
                                <li className="grid grid-cols-2 flex">
                                    <span>Shipping</span>
                                    <span>${order.shippingPrice.toFixed(2)}</span>
                                </li>
                                <hr className="text-slate-400"></hr>
                                <li className="grid grid-cols-2 flex">
                                    <span>Tax</span>
                                    <span>${order.taxPrice.toFixed(2)}</span>
                                </li>
                                <hr className="text-slate-400"></hr>
                                <li className="my-auto grid grid-cols-2 flex">
                                    <span><strong>Order Total </strong></span>
                                    <span><strong>${order.totalPrice.toFixed(2)}</strong></span>
                                </li>
                                {!order.isPaid && (
                                    <li className="grid grid-cols-1 flex">
                                        {isPending ? (<LoadingBox noMarginOrPadding></LoadingBox>) : (
                                            <div>
                                                <PayPalButtons createOrder={createOrder} onApprove={onApprove} onError={onError}></PayPalButtons>
                                            </div>
                                        )}
                                        {loadingPay && <LoadingBox noMarginOrPadding></LoadingBox>}
                                    </li>
                                )}
                                {userInfo.isAdmin && order.isPaid && !order.isDelivered && (
                                    <li className="grid grid-cols-1 flex">
                                        {loadingDeliver && <loadingBox noMarginOrPadding></loadingBox>}
                                        <button type="button" onClick={deliverOrderHandler} className="mb-3 text-black bg-yellow-400 hover:bg-yellow-500 focus:ring-4 focus:outline-none focus:ring-yellow-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-yellow-600 dark:hover:bg-yellow-700 dark:focus:ring-yellow-800">Deliver Order</button>
                                    </li>
                                )}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderScreen;