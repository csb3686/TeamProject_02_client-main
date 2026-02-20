import React from 'react'
import { useNavigate } from 'react-router-dom';

function NotFound() {
    const navigate = useNavigate();
    return (
        <div style={{display:'flex', flexDirection:'column', width:'60%', justifyContent:'center', alignItems:'center', margin:'auto'}}>
            <h1 style={{marginTop:'300px'}}>404</h1>
            <div style={{fontSize:'15pt', marginBottom:'50px'}}>페이지를 찾을 수 없습니다.</div>
            <button onClick={()=>{navigate('/main')}}>홈으로 돌아가기</button>
        </div>
    )
}

export default NotFound