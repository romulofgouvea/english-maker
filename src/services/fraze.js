import axios from "axios";

const getAPIFraze = async (type, word, url) => {
  try {
    const response = await axios.get(
      `${process.env.FRAZE_BASE_URL}/${type}/${word}${url}/${
        process.env.FRAZE_APP_KEY
      }`
    );

    return {
      status: response.status,
      data: response.data.results
    };
  } catch (error) {
    console.log("Ops..");
    console.log(error);
  }
};

module.exports = {
  getAPIFraze
};
