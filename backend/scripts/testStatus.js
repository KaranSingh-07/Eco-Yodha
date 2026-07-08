import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Module from '../models/Module.js';
import UserProgress from '../models/UserProgress.js';

dotenv.config({ path: '.env' });

const test = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const modules = await Module.find().sort({ position: 1 });
  const progress = await UserProgress.findOne({});
  
  console.log("Modules:", modules.map(m => ({ id: m._id, title: m.title, pos: m.position })));
  console.log("Progress:", progress);
  
  const modulesWithStatus = modules.map((mod, index) => {
    let status = 'locked';
    if (progress) {
      if (progress.completedModules.includes(mod._id)) {
        status = 'completed';
      } else if (
        progress.currentModule?.toString() === mod._id.toString() ||
        index === 0
      ) {
        status = 'active';
      }
    } else if (index === 0) {
      status = 'active';
    }
    return { title: mod.title, status };
  });

  console.log("Computed Statuses:", modulesWithStatus);
  process.exit(0);
};

test();
