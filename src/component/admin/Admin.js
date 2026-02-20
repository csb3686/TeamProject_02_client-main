import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminHeader from './AdminHeader';

function Admin() {
    const navigate = useNavigate();

    const [beforSerch, setBeforSerch] = useState({});

    return (
        <div className='admin_main'>
            <AdminHeader />
            <div className='admin_main_first' style={{beforSerch}}>
                <div></div>
            </div>
        </div>

    )
}

export default Admin