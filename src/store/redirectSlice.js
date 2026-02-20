import { createSlice } from '@reduxjs/toolkit'
import {Cookies} from 'react-cookie'
const cookies = new Cookies()

const initialState={
    redirecturl:'',
}

const getRedirectUrl=()=>{
    const redirectinfo = cookies.get('redirect')
    if( !redirectinfo ){
        return{
            redirecturl:''
        }
    }
    try{
        if (typeof redirectinfo === 'object') {
            return {
                redirecturl: decodeURIComponent(redirectinfo.redirecturl)
            };
        }

        // 2) 문자열이면 JSON.parse
        const parsed = JSON.parse(redirectinfo);
        return {
            redirecturl: parsed.redirecturl || ''
        };
    }catch(e){
        console.error("Redirect cookie parse error:", e)
        return { redirecturl: '' }
    }
}

export const redirectSlice = createSlice(
    {
        name : 'redirect',
        initialState : getRedirectUrl(),
        reducers : {
            setRedirect:(state, action)=>{
                state.redirecturl = action.payload.redirecturl;
            },
            clearRedirect:(state)=>{
                state.redirecturl = '';
            }
        }
    }
)
export const { setRedirect, clearRedirect, } = redirectSlice.actions
export default redirectSlice.reducer
