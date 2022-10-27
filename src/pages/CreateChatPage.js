import { useEffect, useRef, useState } from "react"
import axios from "axios"
import Container from "../components/Layout/Container"

import { faComments } from "@fortawesome/free-regular-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import FormSearchModal from "../components/Search/FormSearchModal"

function CreateChatPage() {
  // 스타일 클래스
  const forLabel = "w-40 font-bold mb-2 inline-block"
  const forInput = "bg-slate-100 mb-2 py-1 px-2"

  const [inputValues, setInputValues] = useState({})
  const [searchModalOpen, setSearchModalOpen] = useState(false)
  // 지역 선택
  const [depth01, setDepth01] = useState("")
  const [depth02, setDepth02] = useState("")
  // 지역 인풋
  const regionInputRef = useRef()

  // 지역 인풋 직접 넣기
  useEffect(() => {
    setInputValues({ ...inputValues, areas: regionInputRef.current.value })
  }, [depth01, depth02])

  // 폼 제출
  function handleSubmit(event) {
    event.preventDefault()

    if (validate()) {
      console.log(inputValues)
      axios
        .post("/", inputValues, {
          headers: {
            Authorization: "Bearertoken", // 유저 정보 저장 후 수정 예정
            "Content-Type": "application/json",
          },
        })
        .then(function (response) {
          console.log(response)
          // 채팅방 아이디 받으면 해당 채팅방으로 이동하기
        })
        .catch(function (error) {
          console.log(error)
        })
    }
  }

  function onChange(event) {
    const { name, value } = event.target
    setInputValues({ ...inputValues, [name]: value })
  }

  // 인풋 값 확인
  function validate() {
    // 시작 날짜, 끝 날짜
    const startDate = new Date(inputValues.startDate)
    const endDate = new Date(inputValues.endDate)
    if (endDate - startDate < 0) {
      alert("끝 날짜는 시작 날짜 이후에 설정해주세요.")
      return false
    }

    if (depth01 === "" || depth02 === "") {
      alert("지역을 선택해주세요.")
      return false
    }

    return true
  }

  return (
    <Container>
      <h3 className="my-4 px-2 font-bold text-3xl inline-block relative before:block before:absolute before:left-0 before:bottom-0 before:bg-rose-400 before:h-3 before:w-full before:opacity-30">
        채팅 생성
        <FontAwesomeIcon icon={faComments} className="ml-1" />
      </h3>
      <form onSubmit={handleSubmit}>
        <div className="max-w-xl">
          <label htmlFor="chatTitle" className={forLabel}>
            채팅방 제목
          </label>
          <input
            type="text"
            id="chatTitle"
            name="title"
            className={forInput}
            onChange={onChange}
            required
          />
          <br />
          <label htmlFor="chatMax" className={forLabel}>
            최대 인원수
          </label>
          <input
            type="number"
            id="chatMax"
            name="maxParticipant"
            className={forInput}
            min="0"
            max="10"
            onChange={onChange}
            required
          />
          <br />
          <span className={forLabel}>비밀 채팅방</span>
          <input
            type="radio"
            id="isPrivateT"
            name="isPrivate"
            value="true"
            className={forInput}
            onChange={onChange}
          />
          <label htmlFor="isPrivateT" className="px-2">
            비밀 채팅방
          </label>
          <input
            type="radio"
            id="isPrivateF"
            name="isPrivate"
            value="false"
            className={forInput}
            onChange={onChange}
            defaultChecked
          />
          <label htmlFor="isPrivateF" className="px-2">
            공개 채팅방
          </label>

          <br />
          <label htmlFor="startDate" className={forLabel}>
            여행 시작 날짜
          </label>
          <input
            type="date"
            id="startDate"
            name="startDate"
            className={forInput}
            onChange={onChange}
            required
          />
          <br />
          <label htmlFor="endDate" className={forLabel}>
            여행 끝 날짜
          </label>
          <input
            type="date"
            id="endDate"
            name="endDate"
            className={forInput}
            onChange={onChange}
            required
          />
          <br />
          <label htmlFor="chatRegion" className={forLabel}>
            지역 선택
          </label>
          <span
            className="cursor-pointer inline-flex"
            onClick={() => setSearchModalOpen(!searchModalOpen)}
          >
            <input
              type="text"
              id="chatRegion"
              name="areas"
              className={`pointer-events-none ${forInput}`}
              value={`${depth01} ${depth02}`}
              onChange={onChange}
              required
              ref={regionInputRef}
            />
          </span>
          {/* 지역 선택 */}
          <div className="relative left-40">
            <FormSearchModal
              searchModalOpen={searchModalOpen}
              setSearchModalOpen={setSearchModalOpen}
              depth01={depth01}
              depth02={depth02}
              setDepth01={setDepth01}
              setDepth02={setDepth02}
            />
          </div>
        </div>

        {/* 제출 버튼 */}
        <button
          type="submit"
          className="bg-rose-500 px-3 py-1 rounded-lg text-rose-50"
        >
          만들기!
        </button>
      </form>
    </Container>
  )
}

export default CreateChatPage