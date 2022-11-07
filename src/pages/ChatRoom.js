import { useEffect, useRef, useState } from "react"
import { useParams } from "react-router-dom"
import SockJS from "sockjs-client"
import * as StompJs from "@stomp/stompjs"
import { useRecoilState } from "recoil"
import dayjs from "dayjs"

import { currentUserName, currentUserProf } from "../recoil/userAuth"

import ChatSendForm from "../components/Chat/ChatSendForm"
import Container from "../components/Layout/Container"

import { getUserToken } from "../utils/getUserToken"
import { createChatBubble } from "../utils/createChatBubble"
import axios from "axios"
import { CHAT_API } from "../apis"

let stompClient
let subscription

function ChatRoom() {
  // stomp & user
  const { roomId } = useParams()
  const [userName, setUserName] = useRecoilState(currentUserName)
  const [userProf, setUserProf] = useRecoilState(currentUserProf)
  const textInputRef = useRef()
  const messageListRef = useRef()
  const [token, setToken] = useState("")

  // 채팅방 구독
  const subscribe = () => {
    if (stompClient != null) {
      subscription = stompClient.subscribe(
        `/exchange/chat.exchange/room.${roomId}`,
        (content) => {
          const payload = JSON.parse(content.body)
          console.log(payload)
          const bubble = createChatBubble(payload, userName)
          messageListRef.current.appendChild(bubble)

          messageListRef.current.scrollTop = messageListRef.current.scrollHeight
        },
      )
    }
  }

  useEffect(() => {
    async function getToken() {
      const newToken = await getUserToken()
      setToken(newToken)
    }
    getToken()
  }, [])

  useEffect(() => {
    // stompClient 생성
    if (token !== "") {
      stompClient = new StompJs.Client({
        brokerURL: "ws://52.78.188.101:61613/stomp/chat",
        connectHeaders: {
          login: "user",
          passcode: "password",
          Authorization: token,
        },
        debug: function (str) {
          console.log(str)
        },
        onConnect: () => {
          // 연결 됐을 때 구독 시작
          subscribe()
        },
        onStompError: function (frame) {
          console.log("Broker reported error: " + frame.headers["message"])
          console.log("Additional details: " + frame.body)
        },
        onDisconnect: () => {
          disConnect()
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
      })
      stompClient.webSocketFactory = function () {
        return new SockJS("http://52.78.188.101:8080/stomp/chat")
      }

      stompClient.activate()
      textInputRef.current.focus()
    }

    // 컴포넌트 언마운트 될 때 웹소켓 연결을 끊기
    return () => {
      disConnect()
    }
  }, [token])

  function disConnect() {
    if (stompClient) {
      stompClient.deactivate()
      subscription.unsubscribe()
      console.log("연결 끊어짐")
    }
  }

  // 메세지 전송
  async function handleSubmit(event) {
    event.preventDefault()
    const input = event.target.querySelector("input")
    if (input.value === "") return

    const message = {
      senderName: userName,
      message: input.value,
      senderImgSrc: userProf,
    }

    const token = await getUserToken()

    stompClient.publish({
      destination: `/pub/chat.message.${roomId}`,
      body: JSON.stringify(message),
      headers: {
        Authorization: token,
      },
    })

    input.value = ""
    textInputRef.current.focus()
  }

  return (
    <>
      <Container>
        {/* 채팅 내용 나타나는 부분 */}
        <div
          className="w-full overflow-hidden relative"
          style={{
            height: "calc(100vh - 111px)",
          }}
        >
          <ul
            className="flex flex-col pt-4 overflow-y-scroll absolute top-0 left-0 bottom-0"
            style={{
              right: "-15px",
            }}
            ref={messageListRef}
          ></ul>
        </div>

        {/* 채팅 보내는 부분 */}
        <ChatSendForm handleSubmit={handleSubmit} textInputRef={textInputRef} />
      </Container>
    </>
  )
}

export default ChatRoom
