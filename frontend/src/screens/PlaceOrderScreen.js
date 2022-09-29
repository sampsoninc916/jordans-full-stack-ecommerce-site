import { useContext, useEffect, useReducer } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Store } from "../Store";
import CheckoutSteps from "../subcomponents/CheckoutSteps";
import LoadingBox from "../subcomponents/LoadingBox";

const reducer = (state, action) => {
    switch (action.type) {
        case 'CREATE_REQUEST':
            return { ...state, loading: true };
        case 'CREATE_SUCCESS':
            return { ...state, loading: false };
        case 'CREATE_FAIL':
            return { ...state, loading: false };
        default:
            return state;
    }
};

const PlaceOrderScreen = () => {
    const navigate = useNavigate();
    const [{ loading }, dispatch] = useReducer(reducer, {
        loading: false
    });
    const { state, dispatch: ctxDispatch } = useContext(Store);
    const { cart, userInfo } = state;
    const round2 = (num) => Math.round(num * 100 + Number.EPSILON) / 100;
    cart.itemsPrice = round2(
        cart.cartItems.reduce((a, c) => a + c.quantity * c.price, 0)
    );
    cart.shippingPrice = cart.itemsPrice > 100 ? round2(0) : round2(10);
    cart.taxPrice = round2(0.15 * cart.itemsPrice);
    cart.totalPrice = cart.itemsPrice + cart.shippingPrice + cart.taxPrice;
    const placeOrderHandler = async () => {
        dispatch({ type: 'CREATE_REQUEST' });
        const response = await fetch('/api/orders', {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userInfo.token}`
            },
            body: JSON.stringify({
                orderItems: cart.cartItems,
                shippingAddress: cart.shippingAddress,
                paymentMethod: cart.paymentMethod,
                itemsPrice: cart.itemsPrice,
                shippingPrice: cart.shippingPrice,
                taxPrice: cart.taxPrice,
                totalPrice: cart.totalPrice
            })
        });
        const data = await response.json();
        const { message } = data;
        console.log(data);
        if (!message) {
            dispatch({ type: 'CREATE_FAIL' });
            toast.error('Invalid Request for Order');
            // do stuff
        } else {
            ctxDispatch({ type: 'CART_CLEAR' });
            dispatch({ type: 'CREATE_SUCCESS' });
            localStorage.removeItem('cartItems');
            navigate(`/order/${data.order._id}`);
        }
    };
    
    useEffect(() => {
        if (!cart.paymentMethod) navigate('/payment');
    }, [cart, navigate])
    return (
        <div className="mx-auto">
            <Helmet>
                <title>Preview Order</title>
            </Helmet>
            <CheckoutSteps step1 step2 step3 step4></CheckoutSteps>
            <div className="mx-auto w-6/12">
                <h1 className="text-4xl mt-4">Preview Order</h1>
                <div className="flex flex-start">
                    <div className="justify-center p-4 grid grid-cols-1">
                        <div className="grid gap-3">
                            <div className="grid grid-rows-4 bg-white border border-black rounded-lg pl-4 pr-4">
                                <h1 className="text-lg">Shipping</h1>
                                <span><strong className="">Name: </strong>{cart.shippingAddress.fullName}</span>
                                <span><strong className="">Address: </strong>{cart.shippingAddress.address}, {cart.shippingAddress.city}, {cart.shippingAddress.postalCode}, {cart.shippingAddress.country}</span>
                                <Link to="/shipping" className="">Edit</Link>
                            </div>
                            <div className="grid bg-white border border-black rounded-lg pl-4 pr-4">
                                <h1 className="text-lg">Items</h1>
                                <ul className="my-auto">
                                    {cart.cartItems.map((item) => (
                                        <li key={item._id} className="mt-2">
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
                                <Link to="/cart" className="mt-2">Edit</Link>
                            </div>
                            <div className="grid grid-rows-3 bg-white border border-black rounded-lg pl-4 pr-4">
                                <h1 className="text-lg">Payment</h1>
                                <span><strong>Method: </strong>{cart.paymentMethod}</span>
                                <Link to="/payment" className="">Edit</Link>
                            </div>
                        </div>
                    </div>
                    <div className="justify-center p-4 grid grid-cols-1">
                        <div className="grid gap-3">
                            <div className="grid bg-white border border-black rounded-lg pl-4 pr-4">
                                <h1 className="text-lg">Order Summary</h1>
                                <ul className="-mt-24 grid grid-rows-5 w-52 mb-4 mt-4">
                                    <li className="-mt-4 grid grid-cols-2 flex">
                                        <span>Items</span>
                                        <span>${cart.itemsPrice.toFixed(2)}</span>
                                    </li>
                                    <hr className="text-slate-400"></hr>
                                    <li className="-mt-4 grid grid-cols-2 flex">
                                        <span>Shipping</span>
                                        <span>${cart.shippingPrice.toFixed(2)}</span>
                                    </li>
                                    <hr className="text-slate-400"></hr>
                                    <li className="-mt-4 grid grid-cols-2 flex">
                                        <span>Tax</span>
                                        <span>${cart.taxPrice.toFixed(2)}</span>
                                    </li>
                                    <hr className="text-slate-400"></hr>
                                    <li className="mb-4 mt-4 my-auto grid grid-cols-2 flex">
                                        <span><strong>Order Total</strong></span>
                                        <span><strong>${cart.totalPrice.toFixed(2)}</strong></span>
                                    </li>
                                    <hr className="text-slate-400"></hr>
                                    <li className="grid mb-2 mt-2">
                                        <button type="button" onClick={placeOrderHandler} disabled={cart.cartItems.length === 0} className="text-black bg-yellow-400 hover:bg-yellow-500 focus:ring-4 focus:outline-none focus:ring-yellow-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-yellow-600 dark:hover:bg-yellow-700 dark:focus:ring-yellow-800">Place Order</button>
                                    </li>
                                    {loading && <LoadingBox noMarginOrPadding></LoadingBox>}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlaceOrderScreen;