import { useContext, useReducer, useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { Store } from "../Store";
import ErrorBox from "../subcomponents/ErrorBox";
import LoadingBox from "../subcomponents/LoadingBox";

const reducer = (state, action) => {
    switch (action.type) {
        case 'FETCH_REQUEST':
            return { ...state, loading: true };
        case 'FETCH_SUCCESS':
            return { ...state, loading: false };
        case 'FETCH_FAIL':
            return { ...state, loading: false, error: action.payload };
        case 'UPDATE_REQUEST':
            return { ...state, loadingUpdate: true };
        case 'UPDATE_SUCCESS':
            return { ...state, loadingUpdate: false };
        case 'UPDATE_FAIL':
            return { ...state, loadingUpdate: false };
        case 'UPLOAD_REQUEST':
            return { ...state, loadingUpload: true, errorUpload: '' };
        case 'UPLOAD_SUCCESS':
            return { ...state, loadingUpload: false, errorUpload: '' };
        case 'UPLOAD_FAIL':
            return { ...state, loadingUpdate: false, errorUpload: action.payload };
        default:
            return state;
    }
};

const ProductEditScreen = () => {
    const params = useParams();
    const navigate = useNavigate();
    const { id: productId } = params;
    const { state } = useContext(Store);
    const { userInfo } = state;
    const [{ loading, error, loadingUpload, loadingUpdate }, dispatch] = useReducer(reducer, {
        loading: true,
        error: ''
    });

    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');
    const [price, setPrice] = useState('');
    const [image, setImage] = useState('');
    const [category, setCategory] = useState('');
    const [countInStock, setCountInStock] = useState('');
    const [brand, setBrand] = useState('');
    const [description, setDescription] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            dispatch({ type: 'FETCH_REQUEST' });
            const response = await fetch(`/api/products/${productId}`);
            const data = await response.json();
            console.log(data);
            const { message } = data;
            if (!message) {
                setName(data.name);
                setSlug(data.slug);
                setPrice(data.price);
                setImage(data.image);
                setCategory(data.category);
                setCountInStock(data.countInStock);
                setBrand(data.brand);
                setDescription(data.description);
                dispatch({ type: 'FETCH_SUCCESS' });
            } else {
                dispatch({ type: 'FETCH_FAIL', payload: message });
            }
        };
        fetchData();
    }, [productId]);

    const submitHandler = async (e) => {
        e.preventDefault();
        try {
            dispatch({ type: 'UPDATE_REQUEST' });
            const response = await fetch(`/api/products/${productId}`, {
                method: 'PUT',
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userInfo.token}`
                },
                body: JSON.stringify({
                    _id: productId,
                    name,
                    slug,
                    price,
                    image,
                    category,
                    brand,
                    countInStock,
                    description
                })
            });
            const data = await response.json();
            const { message } = data;
            dispatch({ type: 'UPDATE_SUCCESS' });
            toast.success('Product updated successfully!');
            navigate('/admin/products');
        } catch (err) {
            toast.error(err);
            dispatch({ type: 'UPDATE_FAIL' });
        }
    };

    const uploadFileHandler = async (e) => {
        const file = e.target.files[0];
        const bodyFormData = new FormData();
        bodyFormData.append('file', file);
        dispatch({ type: 'UPLOAD_REQUEST' });
        const response = await fetch('/api/upload', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${userInfo.token}`
            },
            body: bodyFormData
        });
        const data = await response.json();
        dispatch({ type: 'UPLOAD_SUCCESS' });
        toast.success('Image uploaded successfully');
        setImage(data.secure_url);
    };

    return (
        <div className="mx-auto w-4/12">
            <Helmet>
                <title>Edit Product {productId}</title>
            </Helmet>
            <h1 className="text-4xl mt-4">Edit Product {productId}</h1>
            {loading ? (<LoadingBox noMarginOrPadding></LoadingBox>) : error ? (<ErrorBox message={error}></ErrorBox>) : (
                <form className="mt-4" onSubmit={submitHandler}>
                    <div className="mb-3">
                        <label for="name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Name</label>
                        <input type="text" id="name" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-yellow-500 focus:border-yellow-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-yellow-500 dark:focus:border-yellow-500" value={name} required onChange={(e) => setName(e.target.value)}/>
                    </div>
                    <div className="mb-3">
                        <label for="slug" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Slug</label>
                        <input type="text" id="slug" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-yellow-500 focus:border-yellow-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-yellow-500 dark:focus:border-yellow-500" value={slug} required onChange={(e) => setSlug(e.target.value)}/>
                    </div>
                    <div className="mb-3">
                        <label for="price" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Price</label>
                        <input type="text" id="price" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-yellow-500 focus:border-yellow-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-yellow-500 dark:focus:border-yellow-500" value={price} required onChange={(e) => setPrice(e.target.value)}/>
                    </div>
                    <div className="mb-3">
                        <label for="image" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Image File</label>
                        <input type="text" id="image" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-yellow-500 focus:border-yellow-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-yellow-500 dark:focus:border-yellow-500" value={image} required onChange={(e) => setImage(e.target.value)}/>
                    </div>
                    <div className="mb-3">
                        <label for="upload" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Upload Image File</label>
                        <input type="file" id="upload" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-yellow-500 focus:border-yellow-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-yellow-500 dark:focus:border-yellow-500" onChange={uploadFileHandler}/>
                        {loadingUpload && (<LoadingBox noMarginOrPadding></LoadingBox>)}
                    </div>
                    <div className="mb-3">
                        <label for="category" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Category</label>
                        <input type="text" id="category" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-yellow-500 focus:border-yellow-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-yellow-500 dark:focus:border-yellow-500" value={category} required onChange={(e) => setCategory(e.target.value)}/>
                    </div>
                    <div className="mb-3">
                        <label for="brand" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Brand</label>
                        <input type="text" id="brand" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-yellow-500 focus:border-yellow-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-yellow-500 dark:focus:border-yellow-500" value={brand} required onChange={(e) => setBrand(e.target.value)}/>
                    </div>
                    <div className="mb-3">
                        <label for="countInStock" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Count In Stock</label>
                        <input type="text" id="countInStock" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-yellow-500 focus:border-yellow-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-yellow-500 dark:focus:border-yellow-500" value={countInStock} required onChange={(e) => setCountInStock(e.target.value)}/>
                    </div>
                    <div className="mb-3">
                        <label for="description" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Description</label>
                        <input type="text" id="description" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-yellow-500 focus:border-yellow-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-yellow-500 dark:focus:border-yellow-500" value={description} required onChange={(e) => setDescription(e.target.value)}/>
                    </div>
                    <button type="submit" disabled={loadingUpdate} className="mb-3 text-black bg-yellow-400 hover:bg-yellow-500 focus:ring-4 focus:outline-none focus:ring-yellow-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-yellow-600 dark:hover:bg-yellow-700 dark:focus:ring-yellow-800">Update</button>
                    {loadingUpdate && (<LoadingBox noMarginOrPadding></LoadingBox>)}
                </form>
            )}
        </div>
    );
};

export default ProductEditScreen;