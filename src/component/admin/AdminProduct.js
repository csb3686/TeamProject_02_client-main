import React, {useState, useEffect} from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux';
import '../../css/qnaList.css';

import AdminHeader from './AdminHeader'
import jaxios from '../../util/JWTutil';

function AdminEProduct() {

    const loginUser = useSelector(state=>state.user);
    const [eProduct, setEProduct] = useState([])
    const [paging, setPaging] = useState({})
    const [pages, setPages] = useState([])
    const navigate = useNavigate()
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(
        ()=>{

            if(!loginUser.userid){
                navigate('/login')
                return;
            }

            

            jaxios.get('/api/admin/getEProduct/1')
            .then((result)=>{
                setEProduct(result.data.eProduct);
                setPaging(result.data.paging);

                let p = []
                for(let i=result.data.paging.beginPage; i<=result.data.paging.endPage; i++){
                    p.push(i)
                }
                setPages([...p])
                onPageMove(1);
            })
            .catch((err)=>{console.error(err)})
            
        },[loginUser, searchTerm]
    )

    const filteredeProduct = eProduct
        .filter(ep => {
            const term = searchTerm.toLowerCase();
            return (
               ep.name?.toLowerCase().includes(term)
            );
        })

        function onPageMove(p){
        jaxios.get(`/api/admin/getEProduct/${p}?search=${searchTerm}`)
        .then((result)=>{
            setEProduct([...result.data.eProduct])
            setPaging(result.data.paging)

            let pArr = []
            for(let i=result.data.paging.beginPage; i<=result.data.paging.endPage; i++){
                pArr.push(i)
            }
            setPages([...pArr])
        })
        .catch((err)=>{console.error(err)})
    }

    let checkList = []; 

    function onChecked(eid, checked) {
        if(checked) { 
            checkList.push(eid);
        }else { 
            checkList = checkList.filter((value, idx, arr)=>{return value !== eid})
        }      
    }
    
    async function deleteEProduct() {
        if(checkList.length === 0) {return alert('삭제할 항목을 선택하세요.');}
        if(window.confirm('해당 투어/체험을 삭제하시겠습니까?')) {
            try {
                await jaxios.post('/api/admin/deleteEProduct', checkList);
                alert('삭제되었습니다.');
                const result = await jaxios.get('/api/admin/getEProduct/1');
                setEProduct([...result.data.eProduct])
                setPaging(result.data.paging)

                let p = []
                for(let i=result.data.paging.beginPage; i<=result.data.paging.endPage; i++){
                    p.push(i)
                }
                setPages([...p])
                onPageMove(1);

                checkList = [];
                if(result.data.eProduct) {
                    for(let i=0; i<result.data.eProduct.length; i++) {
                        document.getElementById('ch'+i).checked = false;
                    }
                }
            }catch(err) {
                alert('삭제에 실패했습니다.');
                console.error(err);
            }
        }
    }

    return (
        <div>
            <div>
                <AdminHeader />
            </div>
                <div className='total' style={{paddingTop:'250px'}}>
                    <div className='submenu' onClick={()=>{navigate('/admin/AdminEProduct')}}>투어/체험</div>
                    <div className='submenu' onClick={()=>{navigate('/admin/AdminHProduct')}}>숙소</div>
                    <div className='submenu' onClick={()=>{navigate('/admin/AdminTProduct')}}>교통</div>
                    <div className='qnaList'>
                        <div style={{height:'30px', display:'flex', justifyContent:'center',  alignItems:'center', margin: '20px 0', fontSize:'20px'}}><h2>관리자 투어/체험 페이지</h2></div>
        
                        <div className="searchBox" style={{position: 'relative', width: '320px', margin: '20px auto'}}>
                            <i className="fas fa-search" style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', color: '#666' }}></i>
                            <input
                                type="text"
                                placeholder="검색어를 입력하세요"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{
                                width: '100%',
                                padding: '8px 12px 8px 32px', 
                                fontSize: '16px',
                                border: '3px solid black',
                                borderRadius: '4px'
                                }}
                            />
                        </div>

                        
                        <button onClick={()=>{navigate('/admin/adminEProductInsert')}}>상품 추가</button>
                        <button onClick={()=>{deleteEProduct()}}>삭제</button>

                        <div style={{textAlign:'right', padding:'0 20px', marginBottom:'10px', color:'#555', fontSize:'20px'}}>
                            <span className="qnaCount">총 {paging.totalCount}개</span>
                        </div>
                        <div className='titlerow'>
                            <div className='titlecol'>번호</div>
                            <div className='titlecol'>이름</div>
                            <div className='titlecol'>할인가</div>
                        </div>
                        {
                            filteredeProduct.map((ep, idx) => {
                                return (
                                    <div className='row-qna' key={idx}>
                                        <div style={{marginRight:'10px'}}>
                                            <input type='checkbox' id={'ch'+idx} value={ep.eid}
                                                onChange={(e)=>{onChecked(e.currentTarget.value, e.currentTarget.checked);}} />
                                        </div>
                                        <div className='col-qna'>{ep.eid}</div>
                                        <div className='col-qna'
                                            onClick={() => navigate(`/admin/adminEProductDetail/${ep.eid}`)}>
                                            {ep.name}
                                        </div>
                                        <div className='col-qna'>
                                            {ep.price2}
                                        </div>
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

export default AdminEProduct