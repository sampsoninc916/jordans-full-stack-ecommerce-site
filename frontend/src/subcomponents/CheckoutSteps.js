const CheckoutSteps = (props) => {
    return (
        <div className="checkout-steps mx-auto flex justify-center">
            <div className={`grid w-80 ${props.step1 ? 'active' : ''}`}>Sign-In</div>
            <div className={`grid w-80 ${props.step2 ? 'active' : ''}`}>Shipping</div>
            <div className={`grid w-80 ${props.step3 ? 'active' : ''}`}>Payment</div>
            <div className={`grid w-80 ${props.step4 ? 'active' : ''}`}>Place Order</div>
        </div>
    );
};

export default CheckoutSteps;