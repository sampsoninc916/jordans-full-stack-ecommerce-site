import { useContext, useEffect, useReducer } from "react";
import Chart from 'react-google-charts';
import { Store } from "../Store";
import LoadingBox from '../subcomponents/LoadingBox';
import ErrorBox from '../subcomponents/ErrorBox';

const reducer = (state, action) => {
    switch (action.type) {
        case 'FETCH_REQUEST':
            return { ...state, loading: true };
        case 'FETCH_SUCCESS':
            return {
                ...state,
                summary: action.payload,
                loading: false
            };
        case 'FETCH_FAIL':
            return { ...state, loading: false, error: action.payload };
        default:
            return state;
    }
};

const DashboardScreen = () => {
    const [{ loading, summary, error }, dispatch] = useReducer(reducer, {
        loading: true,
        error: ''
    });
    const { state } = useContext(Store);
    const { userInfo } = state;
    useEffect(() => {
        const fetchData = async () => {
            const response = await fetch('/api/orders/summary', {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userInfo.token}`
                }
            });
            const data = await response.json();
            const { message } = data;
            if (!message) dispatch({ type: 'FETCH_SUCCESS', payload: data });
            else dispatch({ type: 'FETCH_FAIL', payload: message });
        };
        fetchData();
    }, [userInfo]);
    return (
        <div className="mx-auto w-10/12">
            <h1 className="text-3xl">Dashboard</h1>
            {loading ? (<LoadingBox noMarginOrPadding></LoadingBox>) : error ? (<ErrorBox message={error}></ErrorBox>) : (
                <>
                    <div className="grid md:grid-cols-3">
                        <div className="border border-slate-400 border-solid m-4 rounded-lg">
                            <div className="p-4">
                                <p className="text-lg"><strong>{summary.users ? summary.users.numUsers : 0}</strong></p>
                                <p className="text-lg">Users</p>
                            </div>
                        </div>
                        <div className="border border-slate-400 border-solid m-4 rounded-lg">
                            <div className="p-4">
                                <p className="text-lg"><strong>{summary.orders ? summary.orders.numOrders : 0}</strong></p>
                                <p className="text-lg">Orders</p>
                            </div>
                        </div>
                        <div className="border border-slate-400 border-solid m-4 rounded-lg">
                            <div className="p-4">
                                <p className="text-lg"><strong>${summary.orders && summary.users ? summary.orders.totalSales.toFixed(2) : 0}</strong></p>
                                <p className="text-lg">Orders</p>
                            </div>
                        </div>
                    </div>
                    <div className="my-3">
                        <h2 className="text-3xl">Sales</h2>
                        {summary.dailyOrders.length === 0 ? (<ErrorBox message="No Sale"></ErrorBox>) : (
                            <Chart width="100%" height="400px" chartType="AreaChart" loader={<div>Loading Chart...</div>} data={[['Date','Sales'], ...summary.dailyOrders.map((x, i) => [new Date(x.dateToString).toISOString().slice(0, new Date(x.dateToString).toISOString().indexOf('T')), x.sales])]}></Chart>
                        )}
                    </div>
                    <div className="my-3">
                        <h2 className="text-3xl">Categories</h2>
                        {summary.productCategories.length === 0 ? (<ErrorBox message="No Category"></ErrorBox>) : (
                            <Chart width="100%" height="400px" chartType="PieChart" loader={<div>Loading Chart...</div>} data={[['Category','Products'], ...summary.productCategories.map((x, i) => [x.category, x.count])]}></Chart>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default DashboardScreen;