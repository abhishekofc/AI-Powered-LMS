import React, { useState, useRef, useEffect } from "react";
import ai from "../assets/ai.png";
import ai1 from "../assets/SearchAi.png";
import { RiMicAiFill } from "react-icons/ri";
import axios from "axios";
import { serverUrl } from "../App";
import { useNavigate } from "react-router-dom";
import start from "../assets/start.mp3";
import { FaArrowLeftLong } from "react-icons/fa6";

function SearchWithAi() {
  const [input, setInput] = useState("");
  const [recommendations, setRecommendations] = useState([]);
  const [listening, setListening] = useState(false);
  const [searched, setSearched] = useState(false);
  const navigate = useNavigate();

  const startSound = new Audio(start);
  const recognitionRef = useRef(null);

  function speak(message) {
    try {
      let utterance = new SpeechSynthesisUtterance(message);
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.log("Speech synthesis error:", err);
    }
  }

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.log("Speech recognition not supported in this browser");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = async (e) => {
      const transcript = e.results[0][0].transcript.trim();
      setInput(transcript);
      await handleRecommendation(transcript);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognitionRef.current = recognition;
  }, []);

  const handleSearch = () => {
    if (!recognitionRef.current) return;
    try {
      startSound.play().catch(() => {
        console.log("Autoplay blocked for audio");
      });
      setListening(true);
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.log("Recognition already running:", err);
      }
    } catch (err) {
      console.log("Error starting recognition:", err);
    }
  };

  const handleRecommendation = async (query) => {
    try {
      const result = await axios.post(
        `${serverUrl}/api/ai/search`,
        { input: query },
        { withCredentials: true }
      );

      if (Array.isArray(result.data)) {
        setRecommendations(result.data);
      } else {
        setRecommendations([]);
      }

      setSearched(true);

      if (result.data && result.data.length > 0) {
        speak("These are the top courses I found for you");
      } else {
        speak("No courses found");
      }
    } catch (error) {
      console.log("Error fetching recommendations:", error);
    } finally {
      setListening(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black to-gray-900 text-white flex flex-col items-center px-4 py-16">
      <div className="bg-white shadow-xl rounded-3xl p-6 sm:p-8 w-full max-w-2xl text-center relative">
        <FaArrowLeftLong
          className="text-[black] w-[22px] h-[22px] cursor-pointer absolute"
          onClick={() => navigate("/")}
        />
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-600 mb-6 flex items-center justify-center gap-2">
          <img src={ai} className="w-8 h-8 sm:w-[30px] sm:h-[30px]" alt="AI" />
          Search with <span className="text-[#CB99C7]">AI</span>
        </h1>

        <div className="flex items-center bg-gray-700 rounded-full overflow-hidden shadow-lg relative w-full ">
          <input
            type="text"
            className="flex-grow px-4 py-3 bg-transparent text-white placeholder-gray-400 focus:outline-none text-sm sm:text-base"
            placeholder="What do you want to learn? (e.g. AI, MERN, Cloud...)"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />

          {input && (
            <button
              onClick={() => handleRecommendation(input)}
              className="absolute right-14 sm:right-16 bg-white rounded-full"
            >
              <img
                src={ai}
                className="w-10 h-10 p-2 rounded-full"
                alt="Search"
              />
            </button>
          )}

          <button
            className="absolute right-2 bg-white rounded-full w-10 h-10 flex items-center justify-center"
            onClick={handleSearch}
          >
            <RiMicAiFill className="w-5 h-5 text-[#cb87c5]" />
          </button>
        </div>
      </div>

      {listening ? (
        <h1 className="text-center text-xl sm:text-2xl mt-10 text-gray-400">
          Listening...
        </h1>
      ) : recommendations.length > 0 ? (
        <div className="w-full max-w-6xl mt-12 px-2 sm:px-4">
          <h2 className="text-xl sm:text-2xl font-semibold mb-6 text-white text-center flex items-center justify-center gap-3">
            <img
              src={ai1}
              className="w-10 h-10 sm:w-[60px] sm:h-[60px] p-2 rounded-full"
              alt="AI Results"
            />
            AI Search Results
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
            {Array.isArray(recommendations) &&
              recommendations.map((course, index) => (
                <div
                  key={index}
                  className="bg-white text-black p-5 rounded-2xl shadow-md hover:shadow-indigo-500/30 transition-all duration-200 border border-gray-200 cursor-pointer hover:bg-gray-200"
                  onClick={() => navigate(`/viewcourse/${course._id}`)}
                >
                  <h3 className="text-lg font-bold sm:text-xl">
                    {course.title}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {course.category}
                  </p>
                </div>
              ))}
          </div>
        </div>
      ) : searched ? (
        <h1 className="text-center text-xl sm:text-2xl mt-10 text-gray-400">
          No Courses Found
        </h1>
      ) : null}
    </div>
  );
}

export default SearchWithAi;
