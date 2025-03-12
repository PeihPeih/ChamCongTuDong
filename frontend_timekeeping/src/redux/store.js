import { configureStore } from '@reduxjs/toolkit';
import systemReducer from './systemSlice';

const store = configureStore({
    reducer: {
        system: systemReducer,
    },
});

export default store;