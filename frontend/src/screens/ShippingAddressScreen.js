import { useContext, useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Navigate, useNavigate } from "react-router-dom";
import { Store } from "../Store";
import CheckoutSteps from "../subcomponents/CheckoutSteps";

const ShippingAddressScreen = () => {
    const navigate = useNavigate();
    const { state, dispatch: ctxDispatch } = useContext(Store);
    const { cart: { shippingAddress }, userInfo } = state;

    const [fullName, setFullName] = useState(shippingAddress.fullName || '');
    const [address, setAddress] = useState(shippingAddress.address || '');
    const [city, setCity] = useState(shippingAddress.city || '');
    const [postalCode, setPostalCode] = useState(shippingAddress.postalCode || '');
    const [country, setCountry] = useState(shippingAddress.country || '');
    const submitHandler = (e) => {
        e.preventDefault();
        ctxDispatch({
            type: 'SAVE_SHIPPING_ADDRESS',
            payload: {
                fullName,
                address,
                city,
                postalCode,
                country
            }
        });
        localStorage.setItem(
            'shippingAddress',
            JSON.stringify({
                fullName,
                address,
                city,
                postalCode,
                country
            })
        );
        navigate('/payment');
    };

    useEffect(() => {
        if (!userInfo) navigate('/signin?redirect=/shipping');
    }, [userInfo, navigate]);

    return <div className="mx-auto">
        <Helmet>
            <title>Shipping Address</title>
        </Helmet>
        <CheckoutSteps step1 step2></CheckoutSteps>
        <div className="mx-auto w-3/12">
            <h1 className="text-4xl mt-4">Shipping Address</h1>
            <form className="mt-4" onSubmit={submitHandler}>
                <div className="mb-3">
                    <label for="fullName" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Full Name</label>
                    <input type="text" id="fullName" value={fullName} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-yellow-500 focus:border-yellow-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-yellow-500 dark:focus:border-yellow-500" placeholder="Full Name" required onChange={(e) => setFullName(e.target.value)}/>
                </div>
                <div className="mb-3">
                    <label for="address" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Address</label>
                    <input type="text" id="address" value={address} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-yellow-500 focus:border-yellow-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-yellow-500 dark:focus:border-yellow-500" placeholder="Address" required onChange={(e) => setAddress(e.target.value)}/>
                </div>
                <div className="mb-3">
                    <label for="city" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">City</label>
                    <input type="text" id="city" value={city} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-yellow-500 focus:border-yellow-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-yellow-500 dark:focus:border-yellow-500" placeholder="City" required onChange={(e) => setCity(e.target.value)}/>
                </div>
                <div className="mb-3">
                    <label for="postalCode" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Postal Code</label>
                    <input type="text" id="postalCode" value={postalCode} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-yellow-500 focus:border-yellow-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-yellow-500 dark:focus:border-yellow-500" placeholder="Postal Code" required onChange={(e) => setPostalCode(e.target.value)}/>
                </div>
                <div className="mb-3">
                    <label for="country" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Country</label>
                    <input type="text" id="country" value={country} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-yellow-500 focus:border-yellow-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-yellow-500 dark:focus:border-yellow-500" placeholder="Country" required onChange={(e) => setCountry(e.target.value)}/>
                </div>
                <div className="mb-3">
                    <button type="submit" className="text-black bg-yellow-400 hover:bg-yellow-500 focus:ring-4 focus:outline-none focus:ring-yellow-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-yellow-600 dark:hover:bg-yellow-700 dark:focus:ring-yellow-800">Continue</button>
                </div>
            </form>
        </div>
    </div>;
};

export default ShippingAddressScreen;