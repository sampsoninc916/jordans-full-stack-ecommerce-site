import { useContext, useEffect, useReducer } from 'react';
import { Helmet } from 'react-helmet-async';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import Rating from '../subcomponents/Rating';
import LoadingBox from '../subcomponents/LoadingBox';
import ErrorBox from '../subcomponents/ErrorBox';
import { Store } from '../Store';

const reducer = (state, action) => {
    switch(action.type) {
        case 'FETCH_REQUEST':
            return { ...state, loading: true }
        case 'FETCH_SUCCESS':
            return { ...state, product: action.payload, loading: false }
        case 'FETCH_FAIL':
            return { ...state, loading: false, error: action.payload }
        default:
            return state
    }
};

const ProductScreen = () => {
    const navigate = useNavigate();
    const params = useParams();
    const { slug } = params;
    const [{ loading, error, product }, dispatch] = useReducer(reducer, {
        product: [],
        loading: true,
        error: ''
    });

    useEffect(() => {
        const fetchProducts = async () => {
            dispatch({ type: 'FETCH_REQUEST' });
            const response = await fetch(`/api/products/slug/${slug}`);
            const data = await response.json();
            const { message } = data;
            if (message) dispatch({ type: 'FETCH_FAIL', payload: message });
            dispatch({ type: 'FETCH_SUCCESS', payload: data });
        };
        fetchProducts();
    }, [slug]);

    const { state, dispatch: cxtDispatch } = useContext(Store);
    const { cart } = state;
    const addToCartHandler = async () => {
        const existItem = cart.cartItems.find((x) => x._id === product._id);
        const quantity = existItem ? existItem.quantity + 1 : 1;
        const response = await fetch(`/api/products/${product._id}`);
        const data = await response.json();
        if (data.countInStock < quantity) {
            window.alert('Sorry. Product is out of stock');
            return;
        }
        cxtDispatch({
            type:'CART_ADD_ITEM',
            payload: {...product, quantity }
        });
        navigate('/cart');
    };

    return (
        loading ? (<div className="loading w-10/12 mx-auto"><LoadingBox /></div>) : error ? (<ErrorBox message={error} />) : (<div className="w-10/12 mx-auto">
            <div className="flex flex-wrap justify-center p-4">
                <img className="max-w-full m-4" src={product.image} alt={product.name}></img>
                <ul className="m-4">
                    <li className="pt-4 pb-4">
                        <Helmet>
                            <title>{product.name}</title>
                        </Helmet>
                        <h1 className="text-3xl">{product.name}</h1>
                    </li>
                    <hr></hr>
                    <li className="pt-4 pb-4"><Rating rating={product.rating} numReviews={product.numReviews}></Rating></li>
                    <hr></hr>
                    <li className="pt-4 pb-4"><div>Price : ${product.price}</div></li>
                    <hr></hr>
                    <li className="pt-4 pb-4"><div>Description:
                        <p>{product.description}</p>
                    </div></li>
                </ul>
                <div className="border border-slate-400 border-solid p-4 rounded-lg m-4 h-full">
                    <ul>
                        <li className="pt-2 pb-2">Price: ${product.price}</li>
                        <hr></hr>
                        <li className="pt-2 pb-2">Status: {product.countInStock > 0 ? (<span className="bg-green-600 text-white font-medium text-sm rounded mr-2 px-2.5 py-0.5">In Stock</span>) : (<span className="bg-red-600 text-white font-medium text-sm rounded mr-2 px-2.5 py-0.5">Unavailable</span>)}</li>
                        {product.countInStock > 0 && (
                            <li className="pt-2 pb-2">
                                <div className="grid">
                                    <button onClick={addToCartHandler} className="bg-yellow-400 p-2 rounded-md hover:bg-yellow-500 text-black">Add to Cart</button>
                                </div>
                            </li>
                        )}
                    </ul>
                </div>
            </div>
        </div>)
    );
};

export default ProductScreen;