import { useEffect, useReducer, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import ErrorBox from "../subcomponents/ErrorBox";
import LoadingBox from "../subcomponents/LoadingBox";
import Product from "../subcomponents/Product";
import Rating from "../subcomponents/Rating";

const reducer = (state, action) => {
    console.log(action.payload);
    switch (action.type) {
        case 'FETCH_REQUEST':
            return { ...state, loading: true };
        case 'FETCH_SUCCESS':
            return { ...state, products: action.payload, loading: false };
        case 'FETCH_FAIL':
            return { ...state, loading: false, error: action.payload };
        default:
            return state;
    }
};

const prices = [
    {
        name: '$1 to $50',
        value: '1-50'
    },
    {
        name: '$51 to $200',
        value: '51-200'
    },
    {
        name: '$201 to $1000',
        value: '201-1000'
    }
];
export const ratings = [
    {
      name: '4stars & up',
      rating: 4,
    },
  
    {
      name: '3stars & up',
      rating: 3,
    },
  
    {
      name: '2stars & up',
      rating: 2,
    },
  
    {
      name: '1stars & up',
      rating: 1,
    },
];

const SearchScreen = () => {
    const navigate = useNavigate();
    const { search } = useLocation();
    const sp = new URLSearchParams(search); // /search?category=Shirts
    const category = sp.get('category') || 'all';
    const query = sp.get('query') || 'all';
    const price = sp.get('price') || 'all';
    const rating = sp.get('rating') || 'all';
    const order = sp.get('order') || 'newest';
    const page = sp.get('page') || 1;

    const [{ loading, error, products, pages, countProducts }, dispatch] = useReducer(reducer, {
        loading: true,
        error: ''
    });

    useEffect(() => {
        const fetchData = async () => {
            const response = await fetch(`/api/products/search?page=${page}&query=${query}&category=${category}&price=${price}&rating=${rating}&order=${order}`);
            const data = await response.json();
            console.log(data);
            const { message } = data;
            if (!message) dispatch({ type: 'FETCH_SUCCESS', payload: data });
            else dispatch({ type: 'FETCH_FAIL', payload: error });
        };
        fetchData();
        console.log(products);
    }, [category, error, order, page, price, query, rating]);

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
    }, [dispatch]);

    const getFilterUrl = (filter) => {
        const filterPage = filter.page || page;
        const filterCategory = filter.category || category;
        const filterQuery = filter.query || query;
        const filterRating = filter.rating || rating;
        const filterPrice = filter.price || price;
        const sortOrder = filter.order || order;
        return `/search?category=${filterCategory}&query=${filterQuery}&price=${filterPrice}&rating=${filterRating}&order=${sortOrder}&page=${filterPage}`;
    };

    return (
        <div className="mx-auto justify-center w-10/12">
            <Helmet>
                <title>Search Products</title>
            </Helmet>
            <h1 className="text-5xl">Results</h1>
            <div className={`${loading ? 'loading' : ''} flex flex-wrap justify-center`}>
                {
                    loading ? (<div className="my-auto"><LoadingBox /></div>) : error ? (<ErrorBox message={error} />) : products.map(product => (<Product key={product.slug} product={product}></Product>))
                }
            </div>
        </div>
    )
};

export default SearchScreen;