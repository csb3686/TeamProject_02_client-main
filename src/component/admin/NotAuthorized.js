import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom';

function NotAuthorized() {
    const navigate = useNavigate();
    useEffect(
        ()=>{
            alert('권한이 없습니다.');
            navigate('/main');
        }, [navigate]
    )

    return 
}

export default NotAuthorized