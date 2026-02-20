import { createSlice } from '@reduxjs/toolkit'
import {Cookies} from 'react-cookie'
const cookies = new Cookies()

const initialState={
    address_name:'',
    category_group_name:'',
    category_name:'',
    place_name:'',
    x:'',
    y:'',
    id:'',
    road_address_name:'',
    start:'',
    keyword:'',
    cid:'',
    tid:'',
    opid:'',
    hid:'',
    eid:'',
    startDate:'',
    endDate:'',
    nights:'',
    redirecturl:'',
}

const getPlaceInfo=()=>{
    const placeinfo = cookies.get('place')
    if( placeinfo ){
        placeinfo.address_name = decodeURIComponent( placeinfo.address_name )
        placeinfo.category_group_name = decodeURIComponent( placeinfo.category_group_name )
        placeinfo.category_name = decodeURIComponent( placeinfo.category_name )
        placeinfo.place_name = decodeURIComponent( placeinfo.place_name )
        placeinfo.x = decodeURIComponent( placeinfo.x )
        placeinfo.y = decodeURIComponent( placeinfo.y )
        placeinfo.id = decodeURIComponent( placeinfo.id )
        placeinfo.road_address_name = decodeURIComponent( placeinfo.road_address_name )
        placeinfo.start = decodeURIComponent( placeinfo.start )
        placeinfo.keyword = decodeURIComponent( placeinfo.keyword )
        placeinfo.cid = decodeURIComponent( placeinfo.cid )
        placeinfo.tid = decodeURIComponent( placeinfo.tid )
        placeinfo.opid = decodeURIComponent( placeinfo.opid )
        placeinfo.hid = decodeURIComponent( placeinfo.hid )
        placeinfo.eid = decodeURIComponent( placeinfo.eid )
        placeinfo.startDate = decodeURIComponent( placeinfo.startDate )
        placeinfo.endDate = decodeURIComponent( placeinfo.endDate )
        placeinfo.nights = decodeURIComponent( placeinfo.nights )
        placeinfo.redirecturl = decodeURIComponent( placeinfo.redirecturl )
    }
    return placeinfo
}

export const placeSlice = createSlice(
    {
        name : 'place',
        initialState : getPlaceInfo() || initialState,
        reducers : {
            setInfo:(state, action)=>{
                state.address_name = action.payload.address_name;
                state.category_group_name = action.payload.category_group_name;
                state.category_name = action.payload.category_name;
                state.place_name = action.payload.place_name;
                state.x = action.payload.x;
                state.y = action.payload.y;
                state.id = action.payload.id;
                state.road_address_name = action.payload.road_address_name;
                state.start = action.payload.start;
                state.keyword = action.payload.keyword;
                state.cid = action.payload.cid;
                state.tid = action.payload.tid;
                state.opid = action.payload.opid;
                state.hid = action.payload.hid;
                state.eid = action.payload.eid;
                state.startDate = action.payload.startDate;
                state.endDate = action.payload.endDate;
                state.nights = action.payload.nights;
                state.redirecturl = action.payload.redirecturl;
            },
            endProgress:(state)=>{
                state.address_name = '';
                state.category_group_name = '';
                state.category_name = '';
                state.place_name = '';
                state.x = '';
                state.y = '';
                state.id = '';
                state.road_address_name = '';
                state.start = '';
                state.keyword = '';
                state.cid = '';
                state.tid = '';
                state.opid = '';
                state.hid = '';
                state.eid = '';
                state.startDate = '';
                state.endDate = '';
                state.nights = '';
                state.redirecturl = '';
            }
        }
    }
)
export const { setInfo, endProgress, } = placeSlice.actions
export default placeSlice.reducer
