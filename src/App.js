import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import { useRef } from 'react';

function Chat() {
  let SockJs = new SockJS('http://localhost:8080/ws/chat');
  let ws = Stomp.over(SockJs);
  let reconnect = 0;
  const messages = [];
  const [message, setMessage] = useState('');
  const [viewMessages, setViewMessages] = useState([]);
  const sender = '익명';
  const roomId = '1';

  const scrollRef = useRef();

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  function sendMessage() {
    ws.send(
      '/app/chat/message',
      {},
      JSON.stringify({
        type: 'TALK',
        roomId: roomId,
        sender: sender,
        message: message,
      })
    );
  }

  function recvMessage(recv) {
    console.log('메세지 수신');
    messages.push({
      type: recv.type,
      sender: recv.type === 'ENTER' ? '' : recv.sender,
      message: recv.type === 'ENTER' ? `[알림] ${recv.message}` : recv.message,
    });
    setViewMessages([...messages]);
  }

  function roomSubscribe() {
    ws.connect(
      {},
      function (frame) {
        // roomId = 1
        ws.subscribe(`/topic/chat/room/${roomId}`, function (response) {
          var recv = JSON.parse(response.body);
          recvMessage(recv);
        });
        ws.send(
          '/app/chat/message',
          {},
          JSON.stringify({
            type: 'ENTER',
            roomId: roomId,
            sender: sender,
          })
        );
      },
      function (error) {
        if (reconnect++ <= 5) {
          setTimeout(function () {
            console.log('connection reconnect');
            SockJs = new SockJS('http://localhost:8080/ws/chat');
            ws = Stomp.over(SockJs);
            roomSubscribe();
          }, 10 * 1000);
        }
      }
    );
  }

  useEffect(() => {
    scrollToBottom();
  }, [viewMessages]);

  useEffect(() => {
    roomSubscribe();
  }, []);

  return (
    <StTopContainer>
      <StTopBorder ref={scrollRef}>
        {viewMessages?.map((item, index) => {
          if (localStorage.getItem('wschat.nick') === item.sender) {
            return (
              <div>
                <RightSenderName>{item.sender}</RightSenderName>
                <BeforeBox key={index}>
                  <div>{item.message}</div>
                </BeforeBox>
              </div>
            );
          } else if (item.sender === '') {
            return (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  backgroundColor: 'rgba(112, 101, 101, 0.5)',
                  borderRadius: '10px',
                  border: 'none)',
                  color: 'rgba(207, 207, 207, 0.8)',
                }}
              >
                {item.message}
              </div>
            );
          } else {
            return (
              <div>
                <LeftSenderName>{item.sender}</LeftSenderName>
                <AfterBox key={index}>
                  <div>{item.message}</div>
                </AfterBox>
              </div>
            );
          }
        })}
      </StTopBorder>
      <StBottomBorder>
        <div>
          <StTextarea>
            <textarea
              type="text"
              value={message}
              onChange={(event) => {
                setMessage(event.target.value);
              }}
            />
          </StTextarea>
        </div>
        <BtnDiv>
          <div>
            <button
              id="back"
              onClick={() => {}}
            >
              뒤로가기
            </button>
          </div>
          <div>
            <button
              type="button"
              onClick={() => {
                sendMessage();
                setMessage('');
              }}
            >
              전송
            </button>
          </div>
        </BtnDiv>
      </StBottomBorder>
    </StTopContainer>
  );
}

export default Chat;

const StTopContainer = styled.div`
  outline: 1px solid rgb(230, 230, 230);
  border-radius: 5px;
  margin: 20px auto;

  max-width: 500px;
  min-width: 300px;
  max-height: 700px;
  min-height: 700px;

  box-sizing: contentBox;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  background-color: rgb(190, 205, 222);
`;

const StTopBorder = styled.div`
  display: flex;
  flex-direction: column;
  text-align: left;
  width: 500px;
  height: 35rem;

  border-bottom-style: solid;
  border-bottom-color: rgb(230, 230, 230);
  border-bottom-width: 1px;

  overflow-y: auto;
  overflow-x: hidden;

  gap: 10px;
`;

const StBottomBorder = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: right;

  width: 500px;
  height: 10rem;

  background-color: white;
`;

const StTextarea = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: left;
  * {
    background-color: white;
    border: none;

    width: 496px;
    height: 6rem;
  }

  textarea:focus {
    outline: none;
  }
`;

const BeforeBox = styled.div`
  color: black;
  padding: 10px;

  display: flex;
  flex-direction: column;
  align-items: flex-end;

  div {
    position: relative;
    background-color: rgb(251, 229, 77);
    border-radius: 0.4em;
    height: auto;
    display: flex;
    flex-direction: row-reverse;
    justify-content: flex-end;
    max-width: calc(100% - 90px);
    padding: 10px;
  }

  div:after {
    position: absolute;
    right: 0;
    top: 50%;
    width: 0;
    height: 0;
    border: 20px solid transparent;
    border-left-color: rgb(251, 229, 77);
    border-right: 0;
    border-bottom: 0;
    margin-top: -10px;
    margin-right: -20px;
  }
`;

const AfterBox = styled.div`
  color: black;
  padding: 10px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;

  div {
    position: relative;
    background: #ffffff;
    border-radius: 0.4em;
    height: auto;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    max-width: calc(100% - 90px);
    padding: 10px;
  }

  div:after {
    position: absolute;
    left: 0;
    top: 50%;
    width: 0;
    height: 0;
    border: 20px solid transparent;
    border-right-color: #ffffff;
    border-left: 0;
    border-bottom: 0;
    margin-top: -10px;
    margin-left: -20px;
  }
`;

const RightSenderName = styled.div`
  float: right;
  display: flex;
  flex-direction: column;
  align-content: flex-end;
  margin-right: 0.5rem;
  width: fit-content;
  padding: 2px;
`;

const LeftSenderName = styled.div`
  float: left;
  display: flex;
  flex-direction: column;
  align-content: flex-end;
  margin-left: 0.5rem;
  width: fit-content;
  padding: 2px;
`;

const BtnDiv = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: 15px;

  button {
    align-items: flex-end;
    width: 5rem;
    height: 2.5rem;

    border: 1px solid rgb(224, 224, 224);
    border-radius: 5px;
    background-color: rgb(242, 242, 242);
  }

  button:hover {
    background-color: rgba(96, 92, 92, 0.5);
    color: white;
  }
`;
