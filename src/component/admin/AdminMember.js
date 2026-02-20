import React, { useEffect, useState } from 'react'
import AdminHeader from './AdminHeader'
import jaxios from '../../util/JWTutil';

import '../../css/admin.css'

function AdminMember() {

    const [modalOpen, setModalOpen] = useState(false);
    const [memberList, setMemberList] = useState([]);
    const [member, setMember] = useState({});
    const [mid, setMid] = useState('');
    const [paging, setPaging] = useState({});
    const [pages, setPages] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    let [checkList, setCheckList] = useState([]);

    useEffect(
        ()=>{
            jaxios.get('/api/admin/getMemberList', {params:{page: currentPage}})
            .then((res)=>{
                setMemberList(res.data.memberList);
                setPaging(res.data.paging)
                setTotalCount(res.data.paging.totalCount)

                let p = [];
                for (let i = res.data.paging.beginPage; i <= res.data.paging.endPage; i++) {
                    p.push(i);
                }
                setPages([...p]);

            }).catch((err)=>{console.error(err)});
        }, [currentPage]
    )

    function goDetail(mid){

        jaxios.get('/api/admin/getOneMember', {params:{mid:mid}})
        .then((result)=>{
            setMid(mid);
            setMember(result.data.member);
            console.log(result.data.member)
            setModalOpen(true);
        }).catch((err)=>{console.error(err)})
        
    }

    useEffect(() => {
            document.body.style.overflow = "hidden";
            return () => {
                document.body.style.overflow = "auto";
            };
    }, [modalOpen]);

    function MemberDetailModal({onClose}){
        if(!member){
            return null
        }
        return(
            <div className='admin_user_modal_background'>
                <div className='admin_user_modal'>
                    <h2>회원 상세정보</h2>
                    <div className='admin_user_modal_table'>
                        <div className='admin_user_modal_tr'>
                            <div className='admin_user_modal_th'>가입 번호</div>
                            <div className='admin_user_modal_td'>{member?.mid}</div>
                        </div>
                        <div className='admin_user_modal_tr'>
                            <div className='admin_user_modal_th'>이름</div>
                            <div className='admin_user_modal_td'>{member?.name}</div>
                        </div>
                        <div className='admin_user_modal_tr'>
                            <div className='admin_user_modal_th'>아이디</div>
                            <div className='admin_user_modal_td'>{member?.userid}</div>
                        </div>
                        <div className='admin_user_modal_tr'>
                            <div className='admin_user_modal_th'>이메일</div>
                            <div className='admin_user_modal_td'>{member?.email || '입력 없음'}</div>
                        </div>
                        <div className='admin_user_modal_tr'>
                            <div className='admin_user_modal_th'>전화번호</div>
                            <div className='admin_user_modal_td'>{member?.phone || '입력 없음'}</div>
                        </div>
                        <div className='admin_user_modal_tr'>
                            <div className='admin_user_modal_th'>우편번호</div>
                            <div className='admin_user_modal_td'>{member?.zipCode || '입력 없음'}</div>
                        </div>
                        <div className='admin_user_modal_tr'>
                            <div className='admin_user_modal_th'>주소</div>
                            <div className='admin_user_modal_td'>{member?.address ? 
                                `${member?.address}${member?.addressDetail ? ` (${member.addressDetail})` : ''}` 
                                : '입력 없음'}</div>
                        </div>
                        <div className='admin_user_modal_tr'>
                            <div className='admin_user_modal_th'>가입일</div>
                            <div className='admin_user_modal_td'>
                                {
                                    (member.indate)?(member.indate.substring(0, 10)):('입력 없음')
                                }
                            </div>
                        </div>
                        <div className='admin_user_modal_tr'>
                            <div className='admin_user_modal_th'>회원 구분</div>
                            <div className='admin_user_modal_td'>{member?.role || '입력 없음'}</div>
                        </div>
                        <div className='admin_user_modal_tr'>
                            <div className='admin_user_modal_th'>가입 구분</div>
                            <div className='admin_user_modal_td'>{member?.snsType || '입력 없음'}</div>
                        </div>
                    </div>
                    <div className='admin_user_button'>
                        <button onClick={onClose}>닫기</button>
                    </div>
                </div>
            </div>
        )
    }


    function onCheck(mid, checked) {
        const id = Number(mid);

        setCheckList(prev => {
            if (checked) {
                return [...prev, id];   // 추가
            } else {
                return prev.filter(value => value !== id); // 제거
            }
        });
        console.log(checkList)
    }


    async function goUpAdmin(){

        if(window.confirm('선택한 유저의 권한을 변경합니다. 진행하시겠습니까?')){
        
            try{
                for (let i=0; i<checkList.length; i++){
                    const result1 = await jaxios.post(`/api/admin/updateAdmin`, null, {params:{mid:checkList[i]}})
                    
                    if(result1.data.msg != "ok"){
                        return alert(result1.data.msg)
                    }
                }

                const result2 = await jaxios.get('/api/admin/getMemberList', {params:{page: currentPage}})
                setMemberList(result2.data.memberList);
                setPages(result2.data.paging)
                setTotalCount(result2.data.paging.totalCount)

                let p = [];
                for (let i = result2.data.paging.beginPage; i <= result2.data.paging.endPage; i++) {
                    p.push(i);
                }
                setPages([...p]);
                setCheckList([]);
            }catch(err){
                console.error(err)
            }
        }else{
            return
        }
    }

    async function goUpUser() {
        
        if(window.confirm('선택한 유저의 권한을 변경합니다. 진행하시겠습니까?')){
        
            try{
                for (let i=0; i<checkList.length; i++){
                    const result1 = await jaxios.post(`/api/admin/updateUser`, null, {params:{mid:checkList[i]}})
                    
                    if(result1.data.msg != "ok"){
                        return alert(result1.data.msg)
                    }
                }

                const result2 = await jaxios.get('/api/admin/getMemberList', {params:{page: currentPage}})
                setMemberList(result2.data.memberList);
                setPages(result2.data.paging)
                setTotalCount(result2.data.paging.totalCount)

                let p = [];
                for (let i = result2.data.paging.beginPage; i <= result2.data.paging.endPage; i++) {
                    p.push(i);
                }
                setPages([...p]);
                setCheckList([]);
                document.getElementById('checkbox').checked = false;
            }catch(err){
                console.error(err)
            }
        }else{
            return
        }
    }

    function onPageMove(p){
        setCheckList([]);
        setCurrentPage(p);
    }

    return (
        <div className='admin_user'>
            <AdminHeader />

            {
                modalOpen && (
                    <MemberDetailModal 
                        onClose={()=>{setModalOpen(false)}}
                    />
                )
            }
            
            <div className='admin_user_memberlist'>
                
                <div className='admin_user_memberlist_title'>
                    <h2>회원정보 확인/수정</h2>
                    <div className='admin_user_memberlsit_menu'>
                        <div onClick={()=>{goUpAdmin()}}>관리자로 승급</div>
                        <div onClick={()=>{goUpUser()}}>일반으로 조정</div>
                    </div>
                </div>
                {
                    memberList.map((member, idx)=>{
                        return (
                            <div className='admin_user_memberlist_items' key={idx} onClick={()=>{goDetail(member.mid)}} id="checkbox">
                                <input type='checkbox' value={member.mid} onChange={(e)=>{onCheck(e.currentTarget.value, e.currentTarget.checked)}} onClick={(e) => e.stopPropagation()} checked={checkList.includes(member.mid)} />
                                <div>{member.mid}</div>
                                <div>{member.userid}</div>
                                <div>{member.name}</div>
                                <div>{member.phone}</div>
                                <div>{member.indate?.substring(0, 10)}</div>
                                <div>{member.snsType}</div>
                                <div>{member.role}</div>
                            </div>
                        )
                    })
                }
            </div>

            <div id="paging" style={{ textAlign: "center", padding: "10px" }}>
                {
                    paging.prev && (
                        <span style={{ cursor: "pointer" }} onClick={() => onPageMove(paging.beginPage - 1)}> ◀ </span>
                    )
                }

                {pages.map((page, idx) => (
                    <span
                        key={idx}
                        style={{
                            cursor: "pointer",
                            fontWeight: page === currentPage ? 'bold' : 'normal'
                        }}
                        onClick={() => onPageMove(page)}
                    >
                        &nbsp;{page}&nbsp;
                    </span>
                ))}

                {paging.next && (
                    <span style={{ cursor: "pointer" }} onClick={() => onPageMove(paging.endPage + 1)}> ▶ </span>
                )}
            </div>

        </div>
    )
}

export default AdminMember