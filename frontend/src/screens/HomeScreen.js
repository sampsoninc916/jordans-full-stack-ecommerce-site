import { useEffect, useReducer } from 'react';
import { Helmet } from 'react-helmet-async';
import Product from '../subcomponents/Product';
import LoadingBox from '../subcomponents/LoadingBox';
import ErrorBox from '../subcomponents/ErrorBox';

const reducer = (state, action) => {
    switch(action.type) {
        case 'FETCH_REQUEST':
            return { ...state, loading: true }
        case 'FETCH_SUCCESS':
            return { ...state, products: action.payload, loading: false }
        case 'FETCH_FAIL':
            return { ...state, loading: false, error: action.payload }
        default:
            return state
    }
}

const HomeScreen = () => {
    // const [products, setProducts] = useState([]);
    const [{ loading, error, products }, dispatch] = useReducer(reducer, {
        products: [],
        loading: true,
        error: '',
      });

    useEffect(() => {
        const fetchProducts = async () => {
            dispatch({ type: 'FETCH_REQUEST' });
            try {
                const response = await fetch('/api/products');
                const data = await response.json();
                dispatch({ type: 'FETCH_SUCCESS', payload: data });   
            } catch(err) {
                dispatch({ type: 'FETCH_FAIL ', payload: err.message });
            }
        };
        fetchProducts();
    }, []);
    return (
        <div className="w-10/12 mx-auto">
            <Helmet>
                <title>Patti's Paintings</title>
            </Helmet>
            <h1 className="text-5xl">Featured Products</h1>
            <div className={`${loading ? 'loading' : ''} flex flex-wrap justify-center`}>
                {
                    loading ? (<div className="my-auto"><LoadingBox /></div>) : error ? (<ErrorBox message={error} />) : products.map(product => (<Product key={product.slug} product={product}></Product>))
                }
            </div>
        </div>
    );
};

export default HomeScreen;