import axios from "axios";

const getTranslateGoogleAPI = async text => {
  try {
    const translations = await axios
      .get(
        `${process.env.GOOGLE_T_URL}?q=${text}&target=pt&key=${
          process.env.GOOGLE_T_API_KEY
        }`
      )
      .then(d => d.data.data.translations);
    return await translations[0].translatedText;
  } catch (error) {
    return "";
  }
};

module.exports = {
  getTranslateGoogleAPI
};
