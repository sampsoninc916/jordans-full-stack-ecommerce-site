import { useState } from "react";
import { useNavigate } from "react-router-dom";

const SearchBox = () => {
    const navigate = useNavigate();
    const [query, setQuery] = useState('');
    const submitHandler = (e) => {
        e.preventDefault();
        navigate(query ? `/search/?query=${query}` : '/search');
    };
    return (
        <form className="flex ml-3" onSubmit={submitHandler}>
            <label for="default-search" className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-gray-300">Search</label>
            <div className="relative">
                <input type="search" id="default-search" className="block p-4 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Search Products" required onChange={(e) => setQuery(e.target.value)}/>
                <button type="submit" className="text-black absolute right-2.5 bottom-2.5 bg-yellow-400 hover:bg-yellow-500 focus:ring-4 focus:outline-none focus:ring-yellow-100 font-medium rounded-lg text-sm px-4 py-2 dark:bg-yellow-500 dark:hover:bg-yellow-600 dark:focus:ring-yellow-700"><i className="fas fa-search"></i></button>
            </div>
        </form>
    );
};

export default SearchBox;