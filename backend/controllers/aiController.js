// import { GoogleGenAI } from "@google/genai";
// import dotenv from "dotenv";
// import Course from "../models/courseModel.js";
// dotenv.config();


// export const searchWithAi = async (req,res) => {

//     try {
//          const { input } = req.body;
     
//     if (!input) {
//       return res.status(400).json({ message: "Search query is required" });
//     }
//  // case-insensitive
//     const ai = new GoogleGenAI({});
// const prompt=`You are an intelligent assistant for an LMS platform. A user will type any query about what they want to learn. Your task is to understand the intent and return one **most relevant keyword** from the following list of course categories and levels:

// - App Development  
// - AI/ML  
// - AI Tools  
// - Data Science  
// - Data Analytics  
// - Ethical Hacking  
// - UI UX Designing  
// - Web Development  
// - Others  
// - Beginner  
// - Intermediate  
// - Advanced  

// Only reply with one single keyword from the list above that best matches the query. Do not explain anything. No extra text.

// Query: ${input}
// `

//   const response = await ai.models.generateContent({
//     model: "gemini-2.5-flash",
//     contents:prompt,
//   });
//   const keyword=response.text



//     const courses = await Course.find({
//       isPublished: true,
//      $or: [  
// //comparing title with keyword using regex
//     { title: { $regex: input, $options: 'i' } },
//     { subTitle: { $regex: input, $options: 'i' } },
//     { description: { $regex: input, $options: 'i' } },
//     { category: { $regex: input, $options: 'i' } },
//     { level: { $regex: input, $options: 'i' } }
//   ]
//     });

//     if(courses.length>0){
//     return res.status(200).json(courses);
//     }else{
//        const courses = await Course.find({
//       isPublished: true,
//      $or: [
//     { title: { $regex: keyword, $options: 'i' } },
//     { subTitle: { $regex: keyword, $options: 'i' } },
//     { description: { $regex: keyword, $options: 'i' } },
//     { category: { $regex: keyword, $options: 'i' } },
//     { level: { $regex: keyword, $options: 'i' } }
//   ]
//     });
//        return res.status(200).json(courses);
//     }


//     } catch (error) {
//         console.log(error)
//     }
// }
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import Course from "../models/courseModel.js";
dotenv.config();

export const searchWithAi = async (req, res) => {
  try {
    const { input } = req.body;

    if (!input) {
      return res.status(400).json({ message: "Search query is required" });
    }

    // ✅ Initialize AI
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const prompt = `You are an intelligent assistant for an LMS platform. A user will type any query about what they want to learn. Your task is to understand the intent and return one **most relevant keyword** from the following list of course categories and levels:

- App Development  
- AI/ML  
- AI Tools  
- Data Science  
- Data Analytics  
- Ethical Hacking  
- UI UX Designing  
- Web Development  
- Others  
- Beginner  
- Intermediate  
- Advanced  

Only reply with one single keyword from the list above that best matches the query. Do not explain anything. No extra text.

Query: ${input}
`;

    // ✅ Gemini Response
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    let keyword =
      response.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

    keyword = keyword.replace(/["'\n\r]/g, ""); // clean keyword
    console.log("👉 AI Keyword:", keyword);

    // ✅ Combine input + keyword search
    const searchTerms = [input, keyword].filter(Boolean);

    const regexArray = searchTerms.map((term) => ({
      $or: [
        { title: { $regex: term, $options: "i" } },
        { subTitle: { $regex: term, $options: "i" } },
        { description: { $regex: term, $options: "i" } },
        { category: { $regex: term, $options: "i" } },
        { level: { $regex: term, $options: "i" } },
      ],
    }));

    const courses = await Course.find({
      isPublished: true,
      $or: regexArray.flatMap((r) => r.$or),
    });

    return res.status(200).json(courses);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};
