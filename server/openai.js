const OpenAI = require('openai');
const uploadFile = require('./r2');

const openai = new OpenAI({ apiKey: process.env.CC_OPENAI_API_KEY });

const styles = [
  "in the style of Studio Ghibli",
  "in the style of Disney Movies",
  "in the style of the show Adventure Time",
];

const partGenerator = (idea) => {
  let recipe = `I'm gonna give you a general premise for a story and you need to come up with a cool story with it, that should be split into 5 parts of around 200 characters each, each part should be told in a way that is easy to read and easy to depict in a single image without the context of the other parts. I expect the output to be a js array of the elements in cronological order like so: ["Once upon a time...", "And then blah blah", "Finally, whatever, yadda, yadda yadda..."] Give me just the array and nothing else (no pretext like "Part 1" or whatever, just the array itelsf, i.e. the first character of your response should be [ and the last should be ]). The language of the story you give me should be the same one present in the premise. The premise is the following: "${idea}".`;

  return recipe;
};

async function createImagePrompts(story, style) {
  const recipe = `I'm gonna give you a js array of a story split in parts, what I want is the same structure as a response (i.e. your first character should be [ and your last character should be ]) but each element is replaced by a prompt describing that part of the story that I'm going to feed into DALL-E to get an image for it, ${style}, describe the images with detail and use descriptions that will NOT generate text in the images, mantain the order and remember to just give me the array as the response, this is the array: ${JSON.stringify(story, null, ' ')}`;
  const promptCompletion = await openai.chat.completions.create({
    messages: [{ role: 'user', content: recipe }],
    model: 'gpt-4-turbo-preview',
  });
  const imagePrompts = JSON.parse(promptCompletion.choices[0].message.content);
  return imagePrompts;
}

async function createImage(prompt) {
  const image = await openai.images.generate({ model: "dall-e-3", prompt, size: '1024x1024', response_format: "b64_json" }); //switch to b64
  return image.data[0].b64_json;
}

async function createTitle(story) {
  const titleCompletion = await openai.chat.completions.create({
    messages: [{ role: 'user', content: `generate a short title (25 characters at most) for the following short story (give me just the title and nothing else): ${story.join('. ')}` }],
    model: 'gpt-4-turbo-preview',
  });
  return titleCompletion.choices[0].message.content;
}

async function createStory(id, premise) {
  const style = styles[Math.floor(Math.random() * styles.length)];
  const storyCompletion = await openai.chat.completions.create({
    messages: [{ role: 'user', content: `${partGenerator(premise)}` }],
    model: 'gpt-4-turbo-preview',
  });
  const storyText = JSON.parse(storyCompletion.choices[0].message.content);

  const imagePrompts = await createImagePrompts(storyText, style);
  //hack, generate title with this bunch of things below
  const openAiResults = await Promise.all([...imagePrompts.map(element => createImage(element)), createTitle(storyText)]);
  const toBeUploaded = [];
  for (let i = 0; i < openAiResults.length - 1; i++) {
    toBeUploaded.push(uploadFile(id, i, openAiResults[i]));
  }
  const uploadedImages = await Promise.all(toBeUploaded);

  const panels = [];
  for (let i = 0; i < storyText.length; i++) {
    panels.push({ part: i, text: storyText[i], image: uploadedImages[i] });
  }

  return { title: openAiResults[openAiResults.length - 1], panels };
}

module.exports = createStory;
