import React, { useEffect, useState } from 'react'
import '../css/chatbot.css'
import axios from 'axios';

function Chatbot() {
    const [chatView, setChatView] = useState('');
    const [chatStyle, setChatStyle] = useState({display: 'none'});

    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');

    useEffect(
        ()=>{
            if(chatView){
                setChatStyle(
                    {
                        position: 'fixed',
                        width:'390px',
                        height:'650px',
                        right:'50px',
                        bottom:'135px',
                        border:'1px solid #333',
                        borderRadius:'10px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        padding: '20px',
                        boxSizing: 'border-box',
                        backgroundColor: 'white',
                    }
                )
            }else{
                setChatStyle({display:'none'})
            }
        },[chatView]
    )

    function onsubmit() {
        if(!question) {return alert('질문을 입력하세요.');}
        appendMessage('User', question);

        axios.post('/api/question', null, {params:{question}})
        .then((res)=>{
            appendMessage('ChatBot', res.data.answer);
        }).catch((err)=>{console.error(err);})
    }

    function appendMessage(sender, content) {
        if(sender === 'User') {
            setAnswer(answer + `<div class="userMessage"><div class="senderUser"></div>
                <div class="userContent">${content}</div></div><br />`);
        }else {
            setAnswer(answer + `<div class="userMessage"><div class="senderUser"></div>
                <div class="userContent">${question}</div></div><br />`
                + `<div class="botMessage"><img src="/images/bot.png"/><div class="senderBot">ChatBot</div>
                <div class="botContent">${content}</div></img><br />`);
        }
        setQuestion('');
    }

    useEffect(
        ()=>{
            document.getElementById('chatBox').scrollTop = document.getElementById('chatBox').scrollHeight;
        }, [answer]
    )

    return (
        <div>
            <div className='chatbot' onClick={()=>{setChatView(!chatView)}}><img src='/images/bot_outline.png' />CHATBOT</div>
            <div className='chatbotbox' style={chatStyle}>
                <h1 className="text-center">RAG기반 AI 챗봇 서비스</h1>
                <div className="chat-box" id="chatBox"  dangerouslySetInnerHTML={{ __html: answer }} ></div>
                <div className="userQuestion">
                    <input type='text' id="messageInput" className="question" placeholder="Type your message..." value={question} onChange={(e)=>{ setQuestion(e.currentTarget.value)}} />
                    <button className="sendBtn" onClick={()=>{onsubmit()}}>Send</button>
                </div>
            </div>

        </div>
    )
}

export default Chatbot