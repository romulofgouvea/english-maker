import UArchive from './uarquives';
import moment from "moment";

function GetFormattedDate(separator = "/") {
  return moment().format(`DD${separator}MM${separator}YYYY`);
}

module.exports = {
  UArchive,
  GetFormattedDate
};
