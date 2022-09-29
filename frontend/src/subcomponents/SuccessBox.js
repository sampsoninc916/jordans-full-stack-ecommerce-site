const SuccessBox = (props) => {
    const { message } = props;
    return (
        <div className="p-4 mb-4 mt-4 text-sm text-green-700 bg-green-100 rounded-lg dark:bg-green-200 dark:text-green-800 mx-auto w-10/12" role="alert">
            <span className="font-medium">{message}</span>
        </div>
    );
};

export default SuccessBox;