const ErrorBox = (props) => {
    const { message } = props;
    return (
        <div className="p-4 mb-4 mt-4 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-200 dark:text-red-800 mx-auto w-10/12" role="alert">
            <span className="font-medium">{message}</span>
        </div>
    );
};

export default ErrorBox;