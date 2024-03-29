import _ from "lodash";

import { UArchive, UImage, UVideo, EStatic } from "~/utils";
import { State } from "~/services";

var progress = {}

const generateCovers = async words => {
  var word = words.word.toLowerCase();

  console.log("> [ROBOT VIDEO] Generate cover word definitions");
  var cover_definition = await UVideo.generateVideoFromTextFixed('/assets/temp', `Definitions of the ${word}`);
  console.log("> [ROBOT VIDEO] Generate cover word examples");
  var cover_examples = await UVideo.generateVideoFromTextFixed('/assets/temp', `Examples of the ${word}`);

  var text = {
    word,
    transcript: `${words.transcript}`,
    translate: words.word_translate,
    derivatives: words.derivatives || [],
    audio: words.word_audio
  };
  console.log("> [ROBOT VIDEO] Generate word image,video");
  var cover = await UVideo.generateVideoFromObjText('/assets/temp', text);

  return {
    image: cover.image,
    video: cover.video,
    definition: cover_definition,
    example: cover_examples
  };
};

const createMiniVideos = async state => {
  console.log("> [ROBOT VIDEO] Generate videos");

  for (var words of state) {
    const word = words.word;
    console.log(`\n> [ROBOT VIDEO] Word: ${word}`);

    console.log("> [ROBOT VIDEO] Generate video definitions");
    for (var [key, definition] of words.definitions.entries()) {

      var text = definition.phrase.concat("\n\n", definition.translate);
      definition.image = await UImage.generateImageTextCenter(
        "/assets/temp",
        `${word}_image_definitions_${key}`,
        text
      );

      definition.video = await UVideo.generateVideo(
        "/assets/temp",
        `${word}_mini_definitions_${key}`,
        definition.image,
        definition.audio
      );

    }

    console.log("> [ROBOT VIDEO] Generate video examples");
    for (var [key, example] of words.examples.entries()) {

      var text = example.phrase.concat("\n\n", example.translate);
      example.image = await UImage.generateImageTextCenter(
        "/assets/temp",
        `${word}_image_examples_${key}`,
        text
      );

      example.video = await UVideo.generateVideo(
        "/assets/temp",
        `${word}_mini_examples_${key}`,
        example.image,
        example.audio
      );

    }
  }

  console.log("> [ROBOT VIDEO] Save state with mini-videos");
  await State.setState("state", state);

  progress.robot_video.create_mini_videos = true;
  await State.setState("progress", progress);

  return state;
};

const generateJoinMiniVideos = async state => {
  console.log("\n> [ROBOT VIDEO] Union definitions and examples in video");

  var arrFiles = [];
  for (var [key, words] of state.entries()) {
    const word = words.word;
    console.log(`\n> [ROBOT VIDEO] Word: ${word}`);

    var definitions = words.definitions.map(d => d.video);
    var examples = words.examples.map(d => d.video);

    words.word_order = EStatic.coverWordStatic[key];

    var covers = await generateCovers(words);

    words.cover_image = covers.image;
    words.cover_video = covers.video;
    words.cover_definition = covers.definition.video;
    words.cover_examples = covers.example.video;

    if (
      !words.cover_video ||
      !words.cover_definition ||
      !definitions ||
      !words.cover_examples ||
      !examples
    )
      throw "Source covers, definitions and examples not exists in state";

    var temp = _.concat(
      words.word_order,
      words.cover_video,
      words.cover_video,
      words.cover_definition,
      definitions,
      words.cover_examples,
      examples
    );

    console.log("> [ROBOT VIDEO] Join videos in temp file");
    var output = await UVideo.joinVideos(
      "/assets/temp",
      `${word}_join_render`,
      temp
    );

    console.log(output);
    if (output) {
      arrFiles.push(output);
    }
  }

  arrFiles = _.compact(arrFiles);

  arrFiles = ["/assets/videos/static/init_render.mp4", ...arrFiles];

  console.log("> [ROBOT VIDEO] Save files render");
  await UArchive.writeFileJson(
    "/assets/videos/final_render",
    "file_render_words",
    arrFiles
  );

  console.log("> [ROBOT VIDEO] Save state");
  await State.setState("state", state);

  progress.robot_video.generate_join_videos = true;
  await State.setState("progress", progress);
};

const finalRenderVideos = async state => {
  console.log("\n> [ROBOT VIDEO] Final render");

  console.log("> [ROBOT VIDEO] Load files temp render");
  var arrFilesUnion = UArchive.loadFileJson(
    "/assets/videos/final_render",
    "file_render_words"
  );

  console.log("> [ROBOT VIDEO] Join final render");
  var output = await UVideo.joinVideos(
    "/assets/videos/final_render",
    `youtube`,
    arrFilesUnion
  );

  if (output) {
    console.log("> [ROBOT VIDEO] Finish robot video: ", output);
  }

  progress.robot_video.final_render = true;
  await State.setState("progress", progress);
};

const RobotVideo = async () => {
  try {
    progress = await State.getState('progress');
    if (progress.robot_audio !== true)
      throw "Not completed robot audio"

    if (progress.robot_video === true)
      return;

    console.log("\n\n> [ROBOT VIDEO]");
    var state = await State.getState();

    if (!progress.robot_video.create_mini_videos)
      state = await createMiniVideos(state);

    if (!progress.robot_video.generate_join_videos && progress.robot_video.create_mini_videos)
      await generateJoinMiniVideos(state);

    if (!progress.robot_video.final_render && progress.robot_video.generate_join_videos)
      await finalRenderVideos(state);

    if (progress.robot_video.create_mini_videos
      && progress.robot_video.generate_join_videos
      && progress.robot_video.final_render) {
      progress.robot_video = true;
      await State.setState("progress", progress);
    }
  } catch (error) {
    await State.setState("progress", progress);
    console.log("Ops...", error);
  }
};

module.exports = { RobotVideo };
