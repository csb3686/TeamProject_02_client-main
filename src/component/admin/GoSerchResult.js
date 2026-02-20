import React, { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom';
import AdminHeader from './AdminHeader'

import '../../css/admin.css'
import jaxios from '../../util/JWTutil';

function GoSerchResult() {

    const [searchParams] = useSearchParams();
    const key = searchParams.get('key');
    const navigate = useNavigate();

    const [memberList, setMemberList] = useState([]);
    const [noticeList, setNoticeList] = useState([]);
    const [productList, setProductList] = useState([]);

    useEffect(
        ()=>{
            jaxios.post('/api/admin/goSerch', null, {params:{key}})
            .then((result)=>{
                setMemberList(result.data.memberList)
                setNoticeList(result.data.noticeList)
                setProductList(result.data.productList)
                console.log(result.data.memberList)
                console.log(result.data.noticeList)
                console.log(result.data.productList)
                console.log(result.data)
            }).catch((err)=>{console.error(err)})
        },[key]
    )

    return (
        <div className='admin_serch'>
            <AdminHeader/>
            <div className='admin_serch_wrap'>
                <div className='admin_serch_member'>
                    <h2>회원 정보</h2>
                    <div className='admin_serch_row'>
                        <div className='admin_serch_col'>번호</div>
                        <div className='admin_serch_col'>아이디</div>
                        <div className='admin_serch_col'>이름</div>
                        <div className='admin_serch_col'>권한</div>
                    </div>

                    {
                        (memberList.length!=0 || memberList == null)?
                        (
                            memberList.map((member, idx)=>{
                            return(
                                <div className='admin_serch_row' key={idx}>
                                    <div className='admin_serch_col'>{member.mid}</div>
                                    <div className='admin_serch_col'>{member.userid}</div>
                                    <div className='admin_serch_col'>{member.name}</div>
                                    <div className='admin_serch_col'>{member.role}</div>
                                </div>
                            )
                            })
                        ):(<div className='admin_serch_row'><div className='admin_serch_col'>검색결과가 없습니다.</div></div>)
                    }

                </div>

                <div className='admin_serch_product'>
                    <h2>상품정보</h2>
                    <div className='admin_serch_row'>
                        <div className='admin_serch_col' style={{display:'flex', flex:'1'}}>번호</div>
                        <div className='admin_serch_col' style={{display:'flex', flex:'1'}}>카테고리</div>
                        <div className='admin_serch_col' style={{display:'flex', flex:'2'}}>상품명</div>
                    </div>

                    {
                        (productList.length!=0)?
                        (
                            productList.slice(0, 6).map((product, idx)=>{
                            return(
                                <div className='admin_serch_row' key={idx}>
                                    <div className='admin_serch_col' style={{display:'flex', flex:'1'}}>{product.id}</div>
                                    <div className='admin_serch_col' style={{display:'flex', flex:'1'}}>{product.category}</div>
                                    <div className='admin_serch_col' style={{display:'flex', flex:'2'}}>{product.name}</div>
                                </div>
                            )
                            })
                        ):(<div className='admin_serch_row' style={{padding:'20px 15px'}}>검색결과가 없습니다.</div>)
                    }

                </div>

                <div className='admin_serch_notice'>
                    <h2>공지사항</h2>
                    <div className='admin_serch_row'>
                        <div className='admin_serch_col'>번호</div>
                        <div className='admin_serch_col'>제목</div>
                        <div className='admin_serch_col'>내용</div>
                        <div className='admin_serch_col'>작성일</div>
                    </div>

                    {
                        (noticeList.length!=0)?
                        (
                            noticeList.map((notice, idx)=>{
                            return(
                                <div className='admin_serch_row' key={idx}>
                                    <div className='admin_serch_col'>{notice.nid}</div>
                                    <div className='admin_serch_col'>{notice.title}</div>
                                    <div className='admin_serch_col'>{notice.content}</div>
                                    <div className='admin_serch_col'>
                                        {
                                            (notice.indate)?(notice.indate.substring(0, 10)):(null)
                                        }
                                    </div>
                                </div>
                            )
                            })
                        ):(<div className='admin_serch_row' style={{padding:'20px 15px'}}>검색결과가 없습니다.</div>)
                    }

                </div>
            </div>
        </div>
    )
}

export default GoSerchResult