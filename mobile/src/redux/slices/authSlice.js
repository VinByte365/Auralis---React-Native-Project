import { createSlice, configureStore } from "@reduxjs/toolkit";
import { login } from "../thunks/authThunk";

function handleStatus(state){
  state = {...state, isLogin:false, loading:true}
  return
}

const intialStat = {
    user: {},
    isLogin: false,
    loading: false,
    error: "",
  }


const authSlice = createSlice({
  name: "auth",
  
  reducers: {},
  extraReducers: (builder)=>{
    builder.addCase(login.pending,handleStatus(state))
  },
});

export const {} = authSlice.actions;
export default  auth = authSlice.reducer;
