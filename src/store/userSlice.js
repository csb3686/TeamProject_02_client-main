// userSlice.js
import { createSlice } from '@reduxjs/toolkit'
import {Cookies} from 'react-cookie'
const cookies = new Cookies()

const initialState={
    userid:'',
    role:'',
    name:'',
    zipCode:'',
    address:'',
    addressDetail:'',
    phone:'',
    birth:'',
    email:'',
    indate:'',
    snsType:'',
    accessToken:'',
    refreshToken:'',
    snsType: '',
}

const getLoginUser=()=>{
    const memberinfo = cookies.get('user')
    if( memberinfo?.userid ){
        memberinfo.userid = decodeURIComponent( memberinfo.userid )
        memberinfo.role = decodeURIComponent( memberinfo.role )
        memberinfo.name = decodeURIComponent( memberinfo.name )
        memberinfo.zipCode = decodeURIComponent( memberinfo.zipCode )
        memberinfo.address = decodeURIComponent( memberinfo.address )
        memberinfo.addressDetail = decodeURIComponent( memberinfo.addressDetail )
        memberinfo.phone = decodeURIComponent( memberinfo.phone )
        memberinfo.birth = decodeURIComponent( memberinfo.birth )
        memberinfo.email = decodeURIComponent( memberinfo.email )
        memberinfo.snsType = decodeURIComponent( memberinfo.snsType )
        memberinfo.accessToken = decodeURIComponent( memberinfo.accessToken )
        memberinfo.refreshToken = decodeURIComponent( memberinfo.refreshToken )
        memberinfo.snsType = decodeURIComponent( memberinfo.snsType )
    }
    return memberinfo
}

export const userSlice = createSlice(
    {
        name : 'user',
        initialState : getLoginUser() || initialState,
        reducers : {
            loginAction:(state, action)=>{
                state.userid = action.payload.userid;
                state.role = action.payload.role;
                state.name = action.payload.name;
                state.zipCode = action.payload.zipCode;
                state.address = action.payload.address;
                state.addressDetail = action.payload.addressDetail;
                state.phone = action.payload.phone;
                state.birth = action.payload.birth;
                state.email = action.payload.email;
                state.snsType = action.payload.snsType;
                state.accessToken = action.payload.accessToken;
                state.refreshToken = action.payload.refreshToken;
                state.snsType = action.payload.snsType;
            },
            logoutAction:(state)=>{
                state.userid = '';
                state.role = '';
                state.name = '';
                state.zipCode = '';
                state.address = '';
                state.addressDetail = '';
                state.phone = '';
                state.birth = '';
                state.email = '';
                state.snsType = '';
                state.accessToken = '';
                state.refreshToken = '';
                state.snsType = '';
            }
        }
    }
)
export const { loginAction, logoutAction, } = userSlice.actions
export default userSlice.reducer
