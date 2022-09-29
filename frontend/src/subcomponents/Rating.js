const Rating = (props) => {
    const { rating, numReviews, caption } = props;
    return (
        <div className="rating">
            <span>
                <i className={rating >= 1 ? 'fas fa-star text-yellow-400' : rating >= 0.5 ? 'fas fa-star-half-alt text-yellow-400' : 'far fa-star text-yellow-400' }/>
            </span>
            <span>
                <i className={rating >= 2 ? 'fas fa-star text-yellow-400' : rating >= 1.5 ? 'fas fa-star-half-alt text-yellow-400' : 'far fa-star text-yellow-400' }/>
            </span>
            <span>
                <i className={rating >= 3 ? 'fas fa-star text-yellow-400' : rating >= 2.5 ? 'fas fa-star-half-alt text-yellow-400' : 'far fa-star text-yellow-400' }/>
            </span>
            <span>
                <i className={rating >= 4 ? 'fas fa-star text-yellow-400' : rating >= 3.5 ? 'fas fa-star-half-alt text-yellow-400' : 'far fa-star text-yellow-400' }/>
            </span>
            <span>
                <i className={rating >= 5 ? 'fas fa-star text-yellow-400' : rating >= 4.5 ? 'fas fa-star-half-alt text-yellow-400' : 'far fa-star text-yellow-400' }/>
            </span>
            {caption ? (
                <span>{caption}</span>
            ) : (
                <span className="text-yellow-400"> {numReviews} reviews</span>
            )}
        </div>
    )
};

export default Rating;