export default {
  // Weather information
  temperature: "기온",
  feels_like: "체감온도",
  humidity: "습도",
  wind: "풍속",
  uv_index: "자외선 지수",
  rain_chance: "강수 확률",
  
  // Weather descriptions
  partly_cloudy: "구름 조금",
  windy: "바람",
  
  // Recommendations
  recommendation: "추천",
  temperature_change_alert: "기온 변화 알림",
  temperature_change: "기온이 변화할 예정",
  in_hours: "후",
  hours: "시간",
  later: "이후",
  
  // Comfort categories
  comfort_cold: "추위를 잘 타시는 편이에요",
  comfort_warm: "더위를 잘 타시는 편이에요",
  comfort_normal: "일반적인 체감 수준이에요",
  
  // Feedback
  feedback_title: "지금 어떠신가요?",
  too_cold: "추워요",
  just_right: "딱 좋아요",
  too_hot: "더워요",
  feedback_cold_message: "춥다고 하셨네요! 앞으로는 더 따뜻한 옷차림을 추천해드릴게요.",
  feedback_warm_message: "덥다고 하셨네요! 앞으로는 더 시원한 옷차림을 추천해드릴게요.",
  feedback_perfect_message: "딱 좋다고 하셨네요! 앞으로도 이런 옷차림을 추천해드릴게요.",
  feedback_thank_you: "감사합니다!",
  feedback_help_message: "피드백을 통해 더 나은 추천을 제공할 수 있어요.",
  feedback_error: "피드백 저장에 실패했습니다. 다시 시도해주세요.",
  
  // Settings
  settings: "설정",
  language: "언어",
  temperature_unit: "온도 단위",
  gender: "성별",
  male: "남성",
  female: "여성",
  celsius: "섭씨",
  fahrenheit: "화씨",
  feedback_history: "피드백 기록",
  clear_history: "기록 삭제",
  comfort_level: "체감 수준",
  current_comfort_bias: "현재 체감 편향: {{value}}°C",
  prefer_warmer: "따뜻한 온도를 선호하시는군요",
  prefer_cooler: "시원한 온도를 선호하시는군요",
  comfortable_current: "현재 온도가 적당하시군요",
  no_feedback_yet: "아직 피드백 기록이 없습니다",
  clear_success: "성공",
  clear_success_message: "피드백 기록이 삭제되었습니다",
  clear_error: "오류",
  clear_error_message: "피드백 기록 삭제에 실패했습니다",
  
  // General
  loading: "날씨 정보를 가져오는 중...",
  error: "날씨 정보를 불러올 수 없습니다",
  retry: "다시 시도",
  pull_to_refresh: "아래로 당겨서 새로고침",
  ok: "확인",
  no_recommendation: "추천할 수 있는 옷차림이 없습니다",
  
  // Error messages
  location_error: "위치 정보에 접근할 수 없습니다. 위치 서비스를 활성화하고 다시 시도해주세요.",
  weather_error: "날씨 정보를 불러올 수 없습니다. 인터넷 연결을 확인하고 다시 시도해주세요.",
  
  // Outfit Recommendations
  outfits: {
    level1: {
      male: [
        "다운 파카, 내복, 장갑, 스노우 부츠",
        "울 코트, 스카프, 보온 바지, 비니",
        "패딩 점퍼, 플리스 후드, 보온 청바지, 윈터 부츠"
      ],
      female: [
        "롱 다운 코트, 플리스 레깅스, 보온 부츠, 장갑",
        "울 오버코트, 터틀넥, 니트 모자와 스카프",
        "퀼팅 자켓, 보온 원피스, 레깅스, 니하이 부츠"
      ]
    },
    level2: {
      male: [
        "파카, 후드, 울 양말, 비니",
        "패딩 베스트와 스웨트셔츠, 코듀로이 팬츠, 장갑",
        "피코트, 니트 스카프, 부츠, 두꺼운 청바지"
      ],
      female: [
        "패딩 코트, 플리스 라인 레깅스, 보온 부츠",
        "셔파 자켓, 보온 속옷, 스카프, 보온 바지",
        "울 터틀넥, 보온 트라우저, 장갑, 레더 부츠"
      ]
    },
    level3: {
      male: [
        "자켓, 스웨터, 청바지, 부츠",
        "레더 자켓, 후드, 보온 치노",
        "라이트 다운 자켓, 비니, 보온 양말"
      ],
      female: [
        "트렌치 코트, 스웨터, 청바지, 앵클 부츠",
        "봄버 자켓, 보온 원피스, 레깅스",
        "크롭 자켓, 울 스카프, 부츠"
      ]
    },
    level4: {
      male: [
        "후드와 데님 자켓, 조거 팬츠",
        "플리스 풀오버, 치노",
        "스웨트셔츠, 베스트, 청바지"
      ],
      female: [
        "가디건, 레깅스, 스카프",
        "긴팔 상의, 청바지, 앵클 부츠",
        "스웨터와 스커트, 타이츠"
      ]
    },
    level5: {
      male: [
        "라이트 자켓, 스웨터, 청바지",
        "플리스 자켓, 긴팔 셔츠, 치노",
        "라이트 코트, 후드, 트라우저"
      ],
      female: [
        "라이트 자켓, 스웨터, 청바지",
        "가디건, 긴팔 상의, 팬츠",
        "라이트 코트, 블라우스, 트라우저"
      ]
    },
    level6: {
      male: [
        "티셔츠와 청바지",
        "폴로 셔츠와 치노",
        "헨리와 조거 팬츠"
      ],
      female: [
        "블라우스와 청바지",
        "맥시 드레스와 샌들",
        "티셔츠와 반바지"
      ]
    },
    level7: {
      male: [
        "반팔 셔츠와 반바지",
        "탱크탑과 조거 반바지",
        "린넨 셔츠와 치노"
      ],
      female: [
        "탱크탑과 반바지",
        "라이트 드레스와 샌들",
        "크롭탑과 와이드 팬츠"
      ]
    },
    level8: {
      male: [
        "민소매 티, 면 반바지",
        "드라이핏 폴로, 모자, 선글라스",
        "라이트 버튼업 셔츠, 치노 반바지"
      ],
      female: [
        "민소매 드레스와 샌들",
        "크롭탑과 반바지",
        "롬퍼와 썬햇"
      ]
    },
    level9: {
      male: [
        "머슬 티, 운동 반바지, 야구 모자",
        "면 셔츠, UV 선글라스, 메쉬 신발",
        "린넨 버튼다운, 플립플롭, 손수건"
      ],
      female: [
        "탱크 드레스와 선글라스",
        "브라탑과 스커트",
        "루즈 티와 린넨 반바지"
      ]
    },
    level10: {
      male: [
        "민소매 탱크, 반바지, 아이스 타월",
        "오픈 버튼 셔츠, 샌들, 모자",
        "얇은 메쉬 드라이핏 티, 캡, 선글라스"
      ],
      female: [
        "스포츠 브라와 반바지",
        "얇은 슬립 드레스와 썬 비저",
        "루즈핏 셔츠, 린넨 반바지, 아이스 팩"
      ]
    }
  },
  
  // Language options
  english: "English",
  korean: "한국어",
  
  // Gender options
  male: "남성",
  female: "여성",
  
  // Temperature units
  celsius: "섭씨",
  fahrenheit: "화씨",
  
  // Comfort bias
  no_preference: "온도 선호도가 중립적이에요",
  
  // Feedback history
  feedback_label: "피드백: {{type}}",
  feedback_date_format: "YYYY.M.D A h:mm:ss",
  temperature_at_time: "온도: {{temp}}°{{unit}}",
}; 