import { useContext } from "react";
import { Link } from "react-router-dom";
import { Store } from "../Store";
import Rating from "./Rating";

const Product = (props) => {
    const { product } = props;
    const { state, dispatch: ctxDispatch } = useContext(Store);
    const { cart: { cartItems } } = state;
    const addCartHandler = async (item) => {
        const existItem = cartItems.find((x) => x._id === product._id);
        const quantity = existItem ? existItem.quantity + 1 : 1;
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
    return (
        <div className="product border border-slate-400 border-solid m-4 rounded-lg">
            <Link to={`/product/${product.slug}`}>
                <img src={product.image} alt={product.name}/>
            </Link>
            <div className="product-info p-4">
                <Link to={`/product/${product.slug}`}>
                    <p>{product.name}</p>
                </Link>
                <Rating rating={product.rating} numReviews={product.numReviews} />
                <p><strong>${product.price}</strong></p>
                {product.countInStock === 0 ?
                    <button className="bg-slate-200 p-2 rounded-md text-black" disabled>Out of Stock</button> :
                    <button className="bg-yellow-400 p-2 rounded-md hover:bg-yellow-500 text-black" onClick={() => addCartHandler(product)}>Add to cart</button>
                }
            </div>
        </div>
    );
}

export default Product;