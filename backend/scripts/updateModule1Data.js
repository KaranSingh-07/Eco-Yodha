import dns from 'node:dns';
dns.setServers(['8.8.8.8', '1.1.1.1']);

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import Module from '../models/Module.js';
import Subtopic from '../models/Subtopic.js';
import Quiz from '../models/Quiz.js';
import Video from '../models/video.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const dbUri = process.env.MONGODB_URI;
if (!dbUri) {
  console.error('Error: MONGODB_URI is not set in backend/.env');
  process.exit(1);
}

const quiz1Questions = [
  {
    question: "Which of the following is considered a primary direct indicator of global climate change rather than a localized weather event?",
    options: [
      "A severe weekend thunderstorm in a single city",
      "A multi-decade trend of rising global average sea levels",
      "A single unseasonably warm day in January",
      "A temporary drop in seasonal winter snowfall for one year"
    ],
    correctAnswer: 1,
    explanation: "Climate change refers to long-term, global trends (like sea level rise over decades), whereas thunderstorms, single warm days, or seasonal snowfall anomalies in a single year are weather events."
  },
  {
    question: "How does the melting of Arctic sea ice accelerate global warming?",
    options: [
      "It releases trapped oxygen bubbles that heat the atmosphere.",
      "It lowers ocean levels, exposing more reflective dark rock.",
      "It reduces Earth's albedo, causing open dark water to absorb more solar radiation.",
      "It stops the rotation of global ocean conveyor belts completely."
    ],
    correctAnswer: 2,
    explanation: "Ice has a high albedo (reflectivity). When it melts, it exposes dark ocean water, which absorbs more solar energy, leading to further warming (a positive feedback loop)."
  },
  {
    question: "Ocean acidification is a direct consequence of climate change driven by which process?",
    options: [
      "Excess heat being transferred from the air to the water",
      "Marine organisms absorbing more nitrogen from agricultural runoff",
      "The absorption of excess atmospheric carbon dioxide (CO2) by ocean waters",
      "Acid rain caused by sulfur dioxide emissions from factories"
    ],
    correctAnswer: 2,
    explanation: "About 30% of the carbon dioxide released into the atmosphere is absorbed by oceans, chemically reacting to form carbonic acid and lowering ocean pH."
  },
  {
    question: "What is the primary reason scientists use deep ice cores to study historic climate change?",
    options: [
      "They contain preserved fossilized plants from millions of years ago.",
      "They trap ancient air bubbles that reveal past atmospheric gas concentrations.",
      "They measure how fast the earth's crust shifted over time.",
      "They prove that the sun emitted more radiation in the past."
    ],
    correctAnswer: 1,
    explanation: "Ice cores contain trapped air bubbles from past eras, allowing scientists to directly measure historical atmospheric compositions and greenhouse gas levels."
  }
];

const quiz2Questions = [
  {
    question: "What is the fundamental mechanism of the natural greenhouse effect?",
    options: [
      "Greenhouse gases block incoming shortwave ultraviolet radiation from reaching Earth.",
      "Greenhouse gases trap outgoing longwave infrared radiation emitted by Earth's surface.",
      "The atmosphere reflects all solar radiation directly back into deep space.",
      "Ozone layers chemically react with oxygen to generate internal atmospheric heat."
    ],
    correctAnswer: 1,
    explanation: "Solar energy reaches Earth as shortwave radiation, heating the surface. Earth re-radiates this heat as longwave infrared energy, which greenhouse gases trap in the atmosphere."
  },
  {
    question: "Which greenhouse gas has the highest Global Warming Potential (GWP) per molecule, despite its lower concentration in the atmosphere compared to CO2?",
    options: [
      "Water vapor (H2O)",
      "Nitrogen (N2)",
      "Chlorofluorocarbons (CFCs)",
      "Carbon monoxide (CO)"
    ],
    correctAnswer: 2,
    explanation: "CFCs are extremely potent greenhouse gases, with a global warming potential thousands of times greater than CO2 per molecule."
  },
  {
    question: "What would happen to Earth's average surface temperature if the natural greenhouse effect did not exist?",
    options: [
      "It would stay exactly the same as it is right now.",
      "It would rise significantly, making the planet a desert.",
      "It would drop well below freezing, making Earth uninhabitable for most life.",
      "It would fluctuate wildly between 100°C and -100°C every hour."
    ],
    correctAnswer: 2,
    explanation: "Without the natural greenhouse effect, Earth's average temperature would be about -18°C (0°F) instead of the current comfortable 15°C (59°F), turning Earth into an icy wasteland."
  },
  {
    question: "Which human activity contributes most significantly to the increase of atmospheric methane (CH4)?",
    options: [
      "Coal-fired power plant electricity generation",
      "Running gasoline-powered passenger vehicles",
      "Livestock farming and anaerobic decomposition in landfills",
      "Commercial cutting of timber in tropical rainforests"
    ],
    correctAnswer: 2,
    explanation: "Agriculture (especially enteric fermentation in livestock) and decay of organic waste in landfills are the largest human-caused sources of methane emissions."
  }
];

const quiz3Questions = [
  {
    question: "Which of these correctly pairs a greenhouse gas with its most significant anthropogenic (human-caused) source?",
    options: [
      "Methane (CH4) → Commuter trains",
      "Nitrous oxide (N2O) → Synthetic agricultural fertilizers",
      "Carbon dioxide (CO2) → Rice paddies",
      "Water vapor (H2O) → Coal mining operations"
    ],
    correctAnswer: 1,
    explanation: "Nitrous oxide (N2O) is primarily released through agricultural soil management practices, especially the use of synthetic nitrogen fertilizers."
  },
  {
    question: "If a planet's atmosphere experiences an increase in greenhouse gas concentrations, what change occurs to the planetary energy budget?",
    options: [
      "Outgoing infrared energy temporarily decreases until a new, warmer equilibrium is reached.",
      "Incoming solar radiation increases proportionally to match the gases.",
      "The total amount of energy leaving the planet permanently drops to zero.",
      "Earth reflects more shortwave radiation back to space."
    ],
    correctAnswer: 0,
    explanation: "More greenhouse gases trap more outgoing heat, temporarily reducing outgoing radiation. The planet warms up until it radiates enough energy to balance the incoming solar radiation again."
  },
  {
    question: "How does deforestation doubly worsen the human-enhanced greenhouse effect?",
    options: [
      "It releases stored carbon when trees are burned/cleared and eliminates a future carbon sink.",
      "It stops the water cycle and prevents clouds from trapping solar heat.",
      "It releases stored carbon when trees are burned/cleared and eliminates a future carbon sink.",
      "It lowers the physical elevation of the land, increasing ground temperatures."
    ],
    correctAnswer: 2,
    explanation: "Trees absorb CO2. Deforestation releases this stored carbon back into the atmosphere and removes the trees that would have absorbed future CO2 emissions."
  },
  {
    question: "Why is water vapor (H2O) considered a feedback agent rather than a primary forcing mechanism for anthropogenic climate change?",
    options: [
      "Humans do not release any water vapor into the atmosphere.",
      "Its concentration depends on atmospheric temperature, amplifying the warming caused by other gases.",
      "It has a lifespan of over a century once it enters the upper atmosphere.",
      "It acts to cool the planet down whenever carbon dioxide levels spike."
    ],
    correctAnswer: 1,
    explanation: "Warm air holds more moisture. As CO2 warms the atmosphere, more water evaporates, trapping more heat and amplifying the original warming effect. Thus, it acts as a feedback loop."
  },
  {
    question: "Which of the following is a predicted ecological consequence of shifting climate zones due to global warming?",
    options: [
      "Species shifting their geographic ranges toward the equator.",
      "Marine organisms growing thicker calcium carbonate shells due to acidity.",
      "Phenological mismatches, where animal migration times no longer align with food availability.",
      "A uniform increase in biodiversity across all global biomes."
    ],
    correctAnswer: 2,
    explanation: "As temperatures warm, timing of seasonal events shifts. For example, birds may hatch after their primary insect food supply has already peaked and declined."
  },
  {
    question: "What type of radiation is absorbed by greenhouse gases?",
    options: [
      "Shortwave ultraviolet radiation",
      "Incoming visible light radiation",
      "Longwave infrared radiation",
      "Cosmic X-ray radiation"
    ],
    correctAnswer: 2,
    explanation: "Greenhouse gases absorb longwave thermal infrared radiation emitted from the Earth's surface after it is heated by solar light."
  },
  {
    question: "The Keeling Curve tracks a historical steady rise in atmospheric CO2 since 1958. What causes the annual \"zigzag\" fluctuation visible in this data?",
    options: [
      "Variations in solar flare output every winter",
      "Seasonal cycles of photosynthesis and respiration in the Northern Hemisphere",
      "Changes in global factory production during holiday seasons",
      "Periodic volcanic eruptions occurring along the Pacific Ring of Fire"
    ],
    correctAnswer: 1,
    explanation: "During Northern Hemisphere spring/summer, plant photosynthesis draws down atmospheric CO2. In fall/winter, respiration and decay release it back, causing a regular seasonal cycle."
  },
  {
    question: "Which sector is globally responsible for the largest share of anthropogenic greenhouse gas emissions?",
    options: [
      "Residential heating and domestic cooking",
      "Commercial aviation and shipping",
      "Electricity and heat production via fossil fuels",
      "Waste management and recycling facilities"
    ],
    correctAnswer: 2,
    explanation: "The combustion of coal, natural gas, and oil for electricity and heat is the largest source of global greenhouse gas emissions (approx. 25%)."
  },
  {
    question: "How does global climate change threaten coastal human populations?",
    options: [
      "By reducing the salinity of drinking water wells through increased evaporation",
      "Via thermal expansion of ocean water combined with melting land-based glaciers",
      "By increasing the total land area of continents through tectonic uplifting",
      "Through the steady reduction of high-tide marks along shorelines"
    ],
    correctAnswer: 1,
    explanation: "Warming causes seawater to expand (thermal expansion) and glaciers/ice sheets on land to melt, raising global sea levels and flooding low-lying coastal areas."
  },
  {
    question: "What is the fundamental difference between \"climate\" and \"weather\"?",
    options: [
      "Weather refers to the atmosphere at a specific time and place, while climate is the long-term average pattern.",
      "Climate can be altered by human activity, but weather is completely randomized.",
      "Weather deals strictly with rain, while climate deals exclusively with global temperatures.",
      "Climate is measured over days, whereas weather takes decades to observe accurately."
    ],
    correctAnswer: 0,
    explanation: "Weather is the day-to-day fluctuation of temperature, wind, and rain, while climate is the statistical average of weather conditions over a long period (typically 30 years)."
  }
];

const updateModule1 = async () => {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(dbUri);
    console.log('MongoDB Connected successfully.');

    const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
      bucketName: 'videos',
    });

    // 1. Upload Video Helper Function
    const uploadLocalVideo = async (filePath, title, description) => {
      let existingVideo = await Video.findOne({ title: title });
      if (existingVideo) {
        console.log(`Video "${title}" already exists in database with Metadata ID: ${existingVideo._id}`);
        return existingVideo;
      }

      if (!fs.existsSync(filePath)) {
        throw new Error(`Local video file not found at: ${filePath}`);
      }

      console.log(`Uploading ${filePath} to GridFS...`);
      return new Promise((resolve, reject) => {
        const filename = path.basename(filePath);
        const uploadStream = bucket.openUploadStream(filename, {
          contentType: 'video/mp4',
        });

        fs.createReadStream(filePath)
          .pipe(uploadStream)
          .on('error', (err) => {
            console.error(`Error uploading file ${filename}:`, err);
            reject(err);
          })
          .on('finish', async () => {
            try {
              const video = await Video.create({
                title,
                description,
                filename: uploadStream.id.toString(),
                contentType: 'video/mp4',
              });
              console.log(`Video "${title}" uploaded successfully. Metadata ID: ${video._id}`);
              resolve(video);
            } catch (dbErr) {
              try {
                await bucket.delete(uploadStream.id);
              } catch (cleanupErr) {
                console.error('Cleanup orphan GridFS file failed:', cleanupErr);
              }
              reject(dbErr);
            }
          });
      });
    };

    // 2. Resolve video paths (in the main project folder)
    const climateChangePath = path.resolve(__dirname, '../../climate_change.mp4');
    const greenHousePath = path.resolve(__dirname, '../../green_house.mp4');

    console.log('Checking video uploads...');
    const climateChangeVideo = await uploadLocalVideo(
      climateChangePath,
      'What is Climate Change?',
      'An introduction to global climate change, global warming, and its key indicators.'
    );

    const greenHouseVideo = await uploadLocalVideo(
      greenHousePath,
      'The Greenhouse Effect',
      'Understanding how Earth\'s natural greenhouse effect works and how humans enhance it.'
    );

    // 3. Find Module 1
    const moduleTitle = 'Module 1: Introduction to Climate Change';
    const targetModule = await Module.findOne({ title: { $regex: new RegExp(moduleTitle, 'i') } });
    if (!targetModule) {
      throw new Error(`Target module not found in database: "${moduleTitle}". Please run the main seed script first.`);
    }
    console.log(`Found Module 1: ${targetModule.title} (ID: ${targetModule._id})`);

    // 4. Find all subtopics in this module
    const subtopics = await Subtopic.find({ module: targetModule._id }).sort({ position: 1 });
    if (subtopics.length === 0) {
      throw new Error(`No subtopics found for Module 1. Please seed the modules first.`);
    }

    // 5. Update subtopics & quizzes
    for (const sub of subtopics) {
      console.log(`Processing subtopic: "${sub.title}" (Type: ${sub.type})`);

      if (sub.type === 'video') {
        if (sub.title.toLowerCase().includes('what is climate change')) {
          sub.videoUrl = climateChangeVideo._id.toString();
          await sub.save();
          console.log(`Updated video URL for "${sub.title}" to Video ID: ${climateChangeVideo._id}`);
        } else if (sub.title.toLowerCase().includes('greenhouse effect')) {
          sub.videoUrl = greenHouseVideo._id.toString();
          await sub.save();
          console.log(`Updated video URL for "${sub.title}" to Video ID: ${greenHouseVideo._id}`);
        }
      } else if (sub.type.includes('quiz')) {
        let quizQuestionsToSet = [];
        if (sub.title.toLowerCase().includes('basics') || sub.title.toLowerCase().includes('quiz 1')) {
          quizQuestionsToSet = quiz1Questions;
        } else if (sub.title.toLowerCase().includes('greenhouse gases') || sub.title.toLowerCase().includes('quiz 2')) {
          quizQuestionsToSet = quiz2Questions;
        } else if (sub.title.toLowerCase().includes('mastery') || sub.title.toLowerCase().includes('mega-quiz')) {
          quizQuestionsToSet = quiz3Questions;
        }

        if (quizQuestionsToSet.length > 0) {
          let quizDoc;
          if (sub.quizRef) {
            quizDoc = await Quiz.findById(sub.quizRef);
          }
          
          if (!quizDoc) {
            console.log(`Creating new Quiz document for subtopic "${sub.title}"...`);
            quizDoc = await Quiz.create({
              module: targetModule._id,
              questions: quizQuestionsToSet
            });
            sub.quizRef = quizDoc._id;
            await sub.save();
          } else {
            console.log(`Updating existing Quiz document for subtopic "${sub.title}"...`);
            quizDoc.questions = quizQuestionsToSet;
            await quizDoc.save();
          }
          console.log(`Updated ${quizDoc.questions.length} questions for Quiz of subtopic "${sub.title}"`);
        }
      }
    }

    console.log('Successfully completed database update for Module 1! All video lectures and quiz questions have been loaded in-place.');
    mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('Error during database update:', err);
    if (mongoose.connection) {
      mongoose.connection.close();
    }
    process.exit(1);
  }
};

updateModule1();
