import { useContext, useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { Store } from "../Store";
import CheckoutSteps from "../subcomponents/CheckoutSteps";

const PaymentMethodScreen = () => {
    const navigate = useNavigate();
    const { state, dispatch: ctxDispatch } = useContext(Store);
    const { cart: { shippingAddress, paymentMethod } } = state;
    const [paymentMethodName, setPaymentMethod] = useState(paymentMethod || 'PayPal');
    useEffect(() => {
        if (!shippingAddress.address) navigate('/shipping');
    }, [shippingAddress, navigate]);
    const submitHandler = (e) => {
        e.preventDefault();
        ctxDispatch({ type: 'SAVE_PAYMENT_METHOD', payload: paymentMethodName });
        localStorage.setItem('paymentMethod', paymentMethodName);
        navigate('/placeorder');
    };
    return (
        <div className="mx-auto">
            <Helmet>
                <title>Payment Method</title>
            </Helmet>
            <CheckoutSteps step1 step2 step3></CheckoutSteps>
            <div className="mx-auto w-3/12">
                <h1 className="text-4xl mt-4">Payment Method</h1>
                <form className="mt-4" onSubmit={submitHandler}>
                    <div className="mb-3">
                        <div className="flex items-center h-5">
                            <input id="PayPal" type="radio" value="PayPal" className="w-4 h-4 bg-gray-50 rounded border border-gray-300 focus:ring-3 focus:ring-yellow-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-yellow-600 dark:ring-offset-gray-800" checked={paymentMethodName === 'PayPal'} onChange={(e) => setPaymentMethod(e.target.value)} />
                            <label for="PayPal" class="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">PayPal</label>
                        </div>
                    </div>
                    <div className="mb-3">
                        <div className="flex items-center h-5">
                            <input id="Stripe" type="radio" value="Stripe" className="w-4 h-4 bg-gray-50 rounded border border-gray-300 focus:ring-3 focus:ring-yellow-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-yellow-600 dark:ring-offset-gray-800" checked={paymentMethodName === 'Stripe'} onChange={(e) => setPaymentMethod(e.target.value)} />
                            <label for="Stripe" class="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Stripe</label>
                        </div>
                    </div>
                    <div className="mb-3">
                        <button type="submit" className="text-black bg-yellow-400 hover:bg-yellow-500 focus:ring-4 focus:outline-none focus:ring-yellow-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-yellow-600 dark:hover:bg-yellow-700 dark:focus:ring-yellow-800">Continue</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PaymentMethodScreen;