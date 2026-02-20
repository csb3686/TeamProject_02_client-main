import React, {useState, useEffect} from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux';
import '../../css/qnaList.css';

import AdminHeader from './AdminHeader'
import jaxios from '../../util/JWTutil';

function AdminTProduct() {

    const loginUser = useSelector(state=>state.user);
    const [tProduct, setTProduct] = useState([])
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

            

            jaxios.get('/api/admin/getTProduct/1')
            .then((result)=>{
                setTProduct(result.data.tProduct);
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

    const filteredtProduct = tProduct
        .filter(tp => {
            const term = searchTerm.toLowerCase();
            return (
               tp.name?.toLowerCase().includes(term)
            );
        })

        function onPageMove(p){
        jaxios.get(`/api/admin/getTProduct/${p}?search=${searchTerm}`)
        .then((result)=>{
            setTProduct([...result.data.tProduct])
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

    function onChecked(tid, checked) {
        if(checked) { 
            checkList.push(tid);
        }else { 
            checkList = checkList.filter((value, idx, arr)=>{return value !== tid})
        }      
    }
    
    async function deleteTProduct() {
        if(checkList.length === 0) {return alert('삭제할 항목을 선택하세요.');}
        if(window.confirm('해당 교통수단을 삭제하시겠습니까?')) {
            try {
                await jaxios.post('/api/admin/deleteTProduct', checkList);
                alert('삭제되었습니다.');
                const result = await jaxios.get('/api/admin/getTProduct/1');
                setTProduct([...result.data.tProduct])
                setPaging(result.data.paging)

                let p = []
                for(let i=result.data.paging.beginPage; i<=result.data.paging.endPage; i++){
                    p.push(i)
                }
                setPages([...p])
                onPageMove(1);

                checkList = [];
                if(result.data.tProduct) {
                    for(let i=0; i<result.data.tProduct.length; i++) {
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
                        <div style={{height:'30px', display:'flex', justifyContent:'center',  alignItems:'center', margin: '20px 0', fontSize:'20px'}}><h2>관리자 교통 페이지</h2></div>
        
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

                        
                        <button onClick={()=>{navigate('/admin/adminTProductInsert')}}>상품 추가</button>
                        <button onClick={()=>{deleteTProduct()}}>삭제</button>

                        <div style={{textAlign:'right', padding:'0 20px', marginBottom:'10px', color:'#555', fontSize:'20px'}}>
                            <span className="qnaCount">총 {paging.totalCount}개</span>
                        </div>
                        <div className='titlerow'>
                            <div className='titlecol'>번호</div>
                            <div className='titlecol'>이름</div>
                            <div className='titlecol'>할인가</div>
                        </div>
                        {
                            filteredtProduct.map((tp, idx) => {
                                return (
                                    <div className='row-qna' key={idx}>
                                        <div style={{marginRight:'10px'}}>
                                            <input type='checkbox' id={'ch'+idx} value={tp.tid}
                                                onChange={(e)=>{onChecked(e.currentTarget.value, e.currentTarget.checked);}} />
                                        </div>
                                        <div className='col-qna'>{tp.tid}</div>
                                        <div className='col-qna'
                                            onClick={() => navigate(`/admin/adminTProductDetail/${tp.tid}`)}>
                                            {tp.name}
                                        </div>
                                        <div className='col-qna'>
                                            {tp.price1}
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

export default AdminTProduct