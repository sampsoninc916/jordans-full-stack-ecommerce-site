import { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Store } from '../Store';
import SearchBox from './SearchBox';

const NavBar = () => {
    const [navbar, setNavbar] = useState(false);
    const { state: { cart, userInfo }, dispatch: ctxDispatch } = useContext(Store);

    const signoutHandler = () => {
        ctxDispatch({ type: 'USER_SIGNOUT' });
        localStorage.removeItem('userInfo');
        localStorage.removeItem('shippingAddress');
        localStorage.removeItem('paymentMethod');
        window.location.href = '/signin'
    };

    const [sidebarIsOpen, setSidebarIsOpen] = useState(false);
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch(`/api/products/categories`);
                const data = await response.json();
                setCategories(data);
            } catch (err) {
                toast.error(err);
            }
        };
        fetchCategories();
    }, []);

    return (
        <>
            <nav className={sidebarIsOpen ? 'w-full bg-white shadow site-container active-cont' : 'w-full bg-white shadow site-container'}>
                <div className="justify-between px-4 mx-auto lg:max-w-7xl md:items-center md:flex md:px-8">
                    <div>
                        <div className="flex items-center justify-between py-3 md:py-5 md:block">
                            <div className="flex">
                                <button className="p-2 text-gray-700 rounded-md outline-none focus:border-gray-400 focus:border mr-2" onClick={() => setSidebarIsOpen(!sidebarIsOpen)}>
                                    <i className="fas fa-bars text-black"></i>
                                </button>
                                <Link to="/" className="my-auto">
                                    <h2 className="text-2xl font-bold">Patti's Paintings</h2>
                                </Link>
                                <SearchBox></SearchBox>
                            </div>
                            <div className="md:hidden">
                                <button
                                    className="p-2 text-gray-700 rounded-md outline-none focus:border-gray-400 focus:border"
                                    onClick={() => setNavbar(!navbar)}
                                >
                                    {navbar ? (
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="w-6 h-6"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    ) : (
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="w-6 h-6"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                            strokeWidth={2}
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M4 6h16M4 12h16M4 18h16"
                                            />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                    <div>
                        <div
                            className={`flex-1 justify-self-center pb-3 mt-8 md:block md:pb-0 md:mt-0 ${
                                navbar ? "block" : "hidden"
                            }`}
                        >
                            <ul className="items-center justify-center space-y-8 md:flex md:space-x-6 md:space-y-0">
                                <li className="text-gray-600 hover:text-blue-600">
                                    <Link to="/cart" className="nav-link mr-8 my-auto">
                                        Cart
                                        {
                                            cart.cartItems.length > 0 && (
                                                <span className="bg-red-600 text-white font-medium text-sm rounded-lg ml-2 px-2.5 py-0.5">{cart.cartItems.reduce((a,b) => a + b.quantity, 0)}</span>
                                            )
                                        }
                                    </Link>
                                </li>
                                <li className="text-gray-600 hover:text-blue-600">
                                    {userInfo ? (
                                        <div className="dropdown inline-block relative">
                                            <button className="bg-white text-black py-2 px-4 rounded inline-flex items-center">
                                                <span className="mr-1">{userInfo.name}</span>
                                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/> </svg>
                                            </button>
                                            <div className="dropdown-menu absolute hidden text-black border border-black">
                                                <div className="py-1 bg-white" role="none">
                                                    <Link to="/profile" className="text-black block px-4 py-2">User Profile</Link>
                                                </div>
                                                <div className="py-1 bg-white divide-y divide-gray-400" role="none">
                                                    <Link to="/orderhistory" className="text-black block px-4 py-2">Order History</Link>
                                                    <Link to="#signout" className="text-black block px-4 py-2" onClick={signoutHandler}>Sign Out</Link>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <Link to="/signin" className="nav-link">
                                            Sign In
                                        </Link>
                                    )}
                                    {userInfo && userInfo.isAdmin && (
                                        <div className="dropdown inline-block relative">
                                            <button className="bg-white text-black py-2 px-4 rounded inline-flex items-center">
                                                <span className="mr-1">Admin</span>
                                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/> </svg>
                                            </button>
                                            <div className="dropdown-menu absolute hidden text-black border border-black">
                                                <div className="py-1 bg-white" role="none">
                                                    <Link to="/admin/dashboard" className="text-black block px-4 py-2">Dashboard</Link>
                                                </div>
                                                <div className="py-1 bg-white" role="none">
                                                    <Link to="/admin/productlist" className="text-black block px-4 py-2">Product List</Link>
                                                </div>
                                                <div className="py-1 bg-white" role="none">
                                                    <Link to="/admin/orderlist" className="text-black block px-4 py-2">Orders</Link>
                                                </div>
                                                <div className="py-1 bg-white" role="none">
                                                    <Link to="/admin/userlist" className="text-black block px-4 py-2">Users</Link>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </nav>
            <div className={sidebarIsOpen ? 'active-nav side-navbar flex justify-between flex-wrap flex-column' : 'side-navbar flex justify-between flex-wrap flex-column'}>
                <ul className="flex-column text-white w-full p-2 ml-8">
                    <li><strong>Categories</strong></li>
                    {categories.map((category) => (
                        <li key={category}>
                            <Link to={`/search?category=${category}`} onClick={() => setSidebarIsOpen(false)}>{category}</Link>
                        </li>
                    ))}
                </ul>
            </div>
        </>
    );
};

export default NavBar;