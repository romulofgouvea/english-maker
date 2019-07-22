import moment from "moment";

import UArchive from './uarquives';
import UWatson from './uwatson';

function GetFormattedDate(separator = "/") {
  return moment().format(`DD${separator}MM${separator}YYYY`);
}

module.exports = {
  UArchive,
  UWatson,
  GetFormattedDate
};
