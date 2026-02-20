import React, { useEffect, useState } from 'react'
import AdminHeader from '../AdminHeader'
import jaxios from '../../../util/JWTutil';
import { useNavigate } from 'react-router-dom';

function AdminNotice() {
    const navigate = useNavigate();

    const [noticeList, setNoticeList] = useState([]);
    const [paging, setPaging] = useState({});
    const [pages, setPages] = useState([]);

    useEffect(
        ()=>{
        onPageMove(1);
        }, []
    )
    
    function onPageMove(p) {
            jaxios.get(`/api/admin/getNoticeList/${p}`)
                .then(result => {
                    setNoticeList(result.data.noticeList || []);
                    setPaging(result.data.paging || {});
                    let pArr = [];
                    const begin = result.data.paging?.beginPage ?? 1;
                    const end = result.data.paging?.endPage ?? 1;
                    for (let i = begin; i <= end; i++) pArr.push(i);
                    setPages([...pArr]);
                })
                .catch(err => console.error(err));
        }

    return (
        <div className='admin_noticeList'>
            <AdminHeader />
            
            <div className='admin_noticeList_container'>
                <div className='admin_noticeList_wrap'>
                
                    <div style={{display:'flex', justifyContent:'space-between'}}>
                        <h2>공지사항</h2>
                        <button style={{height: '50px'}} onClick={()=>{navigate('/admin/noticeWrite')}}>작성하기</button>
                    </div>
                    
                    
                    {
                        noticeList.map((notice, idx)=>{
                            return (
                                <div className='item' key={idx}>
                                    <div>{notice.nid}</div>
                                    <div onClick={()=>{navigate(`/admin/noticeDetail/${notice.nid}`)}}>{notice.title}</div>
                                    <div>{notice.indate?.substring(0, 10)}</div>
                                </div>
                            )
                        })
                    }

                    <div id='paging' style={{textAlign:"center", padding:"10px"}}>
                        {
                            (paging.prev)?(
                                <span style={{cursor:"pointer"}} onClick={()=>{onPageMove(paging.beginPage-1)}}> ◀ </span>
                            ):(<span></span>)
                        }
                        {
                            pages.map((page, idx)=>{
                                return(
                                    <span style={{cursor:"pointer"}} key={idx}
                                    onClick={()=>{onPageMove(page)}}>&nbsp;{page}&nbsp;</span>
                                )
                            })
                        }
                        {
                            (paging.next)?(
                                <span style={{cursor:"pointer"}} onClick={()=>{onPageMove(paging.endPage+1)}}> ▶ </span>
                            ):(<span></span>)
                        }

                    </div>

                </div>
            </div>
        </div>
    )
}

export default AdminNotice