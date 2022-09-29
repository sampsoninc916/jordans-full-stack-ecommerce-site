import { useContext } from "react";
import { Helmet } from "react-helmet-async";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Store } from "../Store";
import ProductScreen from "./ProductScreen";

const CartScreen = (props) => {
    const navigate = useNavigate();
    const { state, dispatch: ctxDispatch } = useContext(Store);
    const { cart: { cartItems } } = state;

    const updateCartHandler = async (item, quantity) => {
        const response = await fetch(`/api/products/${item._id}`);
        const data = await response.json();
        if (data.countInStock < quantity) {
            window.alert('Sorry. Product is out of stock');
            return;
        }
        ctxDispatch({
            type: 'CART_ADD_ITEM',
            payload: { ...item, quantity },
        });
    };
    const removeItemHandler = (item) => {
        ctxDispatch({ type: 'CART_REMOVE_ITEM', payload: item });
    };
    const checkoutHandler = () => {
        navigate('/signin?redirect=/shipping');
    };
    return (
        <div className="w-10/12 mx-auto">
            <Helmet>
                <title>Shopping Cart</title>
            </Helmet>
            <h1 className="text-4xl">Shopping Cart</h1>
            <div className="flex flex-wrap justify-center p-4">
                <div className={cartItems.length === 0 ? 'grid bg-white h-full pl-4 pr-4' : 'grid bg-white border border-black rounded-lg h-full pl-4 pr-4'}>
                    {
                        cartItems.length === 0 ? (
                            <div className="p-4 m-4 text-sm text-sky-700 bg-sky-100 rounded-lg dark:bg-sky-200 dark:text-sky-800 mx-auto w-full" role="alert">
                                <span className="font-medium">Cart is empty. <Link to="/">Go Shopping</Link></span>
                            </div>
                        ) :
                        (
                            <ul className="my-auto">
                                {cartItems.map((item) => (
                                    <li key={item._id} className="m-4">
                                        <div className="flex justify-between">
                                            <div className="grid grid-cols-4 flex">
                                                <img src={item.image} alt={item.name} className="border border-slate-400 rounded img-thumbnail"></img>{' '}
                                                <Link to={`/product/${item.slug}`} className="my-auto">{item.name}</Link>
                                            </div>
                                            <div className="grid grid-cols-3 flex">
                                                <button disabled={item.quantity === 1} onClick={() => updateCartHandler(item, item.quantity-1)}>
                                                    <i className="fas fa-minus-circle text-slate-500"></i>
                                                </button>{' '}
                                                <span className="my-auto text-center w-8">{item.quantity}</span>
                                                <button disabled={item.quantity === item.countInStock} onClick={() => updateCartHandler(item, item.quantity+1)}>
                                                    <i className="fas fa-plus-circle text-slate-500"></i>
                                                </button>
                                            </div>
                                            <div className="grid grid-cols-3 my-auto ml-10">${item.price}</div>
                                            <div className="grid grid-cols-3 my-auto flex">
                                                <button onClick={() => removeItemHandler(item)}>
                                                    <i className="fas fa-trash"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )
                    }
                </div>
                <div className="grid ml-4">
                    <div className="p-4 bg-white border border-black rounded-lg flex">
                        <ul>
                            <li>
                                <h3 className="text-3xl">
                                    Subtotal ({cartItems.reduce((a,b) => a + b.quantity, 0)}{' '}
                                    items) : <br/>${cartItems.reduce((a,b) => a + b.price * b.quantity, 0)}
                                </h3>
                            </li>
                            <hr className="mt-5"></hr>
                            <li>
                                <div className="grid mt-5">
                                    <button type="button" variant="primary" disabled={cartItems.length === 0} className="bg-yellow-400 p-2 rounded-md hover:bg-yellow-500 text-black" onClick={checkoutHandler}>Proceed to Checkout</button>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
};

export default CartScreen;