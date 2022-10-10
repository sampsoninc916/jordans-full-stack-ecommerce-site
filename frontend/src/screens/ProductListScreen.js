import { useContext, useEffect, useReducer } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import { Store } from "../Store";
import ErrorBox from "../subcomponents/ErrorBox";
import LoadingBox from "../subcomponents/LoadingBox";

const reducer = (state, action) => {
    switch (action.type) {
        case 'FETCH_REQUEST':
            return { ...state, loading: true };
        case 'FETCH_SUCCESS':
            return {
                ...state,
                products: action.payload.products,
                page: action.payload.page,
                pages: action.payload.pages,
                loading: false
            };
        case 'FETCH_FAIL':
            return { ...state, loading: false, error: action.payload };
        case 'CREATE_REQUEST':
            return { ...state, loadingCreate: true };
        case 'CREATE_SUCCESS':
            return { ...state, loadingCreate: false };
        case 'CREATE_FAIL':
            return { ...state, loadingCreate: false };
        case 'DELETE_REQUEST':
            return { ...state, loadingDelete: true, successDelete: false };
        case 'DELETE_SUCCESS':
            return { ...state, loadingDelete: false, successDelete: true };
        case 'DELETE_FAIL':
            return { ...state, loadingDelete: false, successDelete: false };
        case 'DELETE_RESET':
            return { ...state, loadingDelete: false, successDelete: false };
        default:
            return state;
    }
};

const ProductListScreen = () => {
    const navigate = useNavigate();
    const [{ loading, loadingCreate, loadingDelete, successDelete, error, products, pages }, dispatch] = useReducer(reducer, {
        loading: true,
        error: ''
    });

    const { search } = useLocation();
    const sp = new URLSearchParams(search);
    const page = sp.get('page') || 1;

    const { state } = useContext(Store);
    const { userInfo } = state;
    useEffect(() => {
        const fetchData = async () => {
            const response = await fetch(`api/products/admin?page=${page}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userInfo.token}`
                }
            });
            const data = await response.json();
            console.log(data);
            const { message } = data;
            if (!message) dispatch({ type: 'FETCH_SUCCESS', payload: data });
            else dispatch({ type: 'FETCH_FAIL', payload: message });
        };
        if (successDelete) dispatch({ type: 'DELETE_RESET' });
        else fetchData();
    }, [page, userInfo, successDelete]);

    const createHandler = async () => {
        if (window.confirm('Are you sure you want to create?')) {
            try {
                dispatch({ type: 'CREATE_REQUEST' });
                const response = await fetch(`api/products`, {
                    method: 'POST',
                    mode: 'cors',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${userInfo.token}`
                    },
                    body: JSON.stringify({})
                });
                const data = await response.json();
                toast.success('product created successfully');
                dispatch({ type: 'CREATE_SUCCESS' });
                navigate(`/admin/product/${data.product._id}`);
            } catch (err) {
                toast.error(err);
                dispatch({ type: 'CREATE_FAIL' });
            }
        }
    };

    const deleteHandler = async (product) => {
        if (window.confirm('Are you sure you want to delete?')) {
            try {
                const response = await fetch(`/api/products/${product._id}`, {
                    method: 'DELETE',
                    mode: 'cors',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${userInfo.token}`
                    }
                });
                toast.success('Product deleted successfully');
                dispatch({ type: 'DELETE_SUCCESS' });
            } catch(err) {
                toast.error(err);
                dispatch({ type: 'DELETE_FAIL' });
            }
        }
    };
    return (
        <div className="mx-auto w-10/12">
            <div className="flex justify-between my-4">
                <h1 className="text-4xl">Products</h1>
                <button type="button" onClick={createHandler} className="text-black bg-yellow-400 hover:bg-yellow-500 focus:ring-4 focus:outline-none focus:ring-yellow-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-yellow-600 dark:hover:bg-yellow-700 dark:focus:ring-yellow-800">Create Product</button>
            </div>
            {loadingCreate && <LoadingBox noMarginOrPadding={false}></LoadingBox>}
            {loadingDelete && <LoadingBox noMarginOrPadding={false}></LoadingBox>}
            {loading ? (<LoadingBox noMarginOrPadding={false}></LoadingBox>) : error ? (<ErrorBox message={error}></ErrorBox>) : (
                <>
                    <table className="my-3 w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <td scope="col" className="py-3 px-6">ID</td>
                                <td scope="col" className="py-3 px-6">NAME</td>
                                <td scope="col" className="py-3 px-6">PRICE</td>
                                <td scope="col" className="py-3 px-6">CATEGORY</td>
                                <td scope="col" className="py-3 px-6">BRAND</td>
                                <td scope="col" className="py-3 px-6">ACTIONS</td>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map((product) => (
                                <tr key={product._id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                    <td scope="row" className="py-4 px-6">{product._id}</td>
                                    <td scope="row" className="py-4 px-6">{product.name}</td>
                                    <td scope="row" className="py-4 px-6">${product.price.toFixed(2)}</td>
                                    <td scope="row" className="py-4 px-6">{product.category}</td>
                                    <td scope="row" className="py-4 px-6">{product.brand}</td>
                                    <td className="py-4 px-6">
                                        <button type="button" onClick={() => navigate(`/admin/product/${product._id}`)} className="text-black bg-yellow-400 hover:bg-yellow-500 focus:ring-4 focus:outline-none focus:ring-yellow-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-yellow-600 dark:hover:bg-yellow-700 dark:focus:ring-yellow-800">Edit</button>
                                        <button type="button" onClick={() => deleteHandler(product)} className="ml-4 text-black bg-yellow-400 hover:bg-yellow-500 focus:ring-4 focus:outline-none focus:ring-yellow-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-yellow-600 dark:hover:bg-yellow-700 dark:focus:ring-yellow-800">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="my-5">
                        {[...Array(pages).keys()].map((x) => (
                            <Link
                                className={x+1 === Number(page) ? 'text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800 text-bold' : 'text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800'}
                                key={x+1}
                                to={`/admin/products?page=${x+1}`}
                            >
                                {x+1}
                            </Link>
                        ))}
                    </div>
                </>
            )}
        </div>
    )
};

export default ProductListScreen;