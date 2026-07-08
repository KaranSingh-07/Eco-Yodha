import Video from '../models/video.js';
import mongoose from 'mongoose';
import fs from 'fs';

// GET /api/videos - list all videos (metadata)
export const getVideos = async (req, res) => {
  try {
    const videos = await Video.find().select('-__v').sort({ createdAt: -1 });
    res.json(videos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/videos/:id - stream video file from GridFS
export const streamVideo = async (req, res) => {
  try {
    const id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      // Fallback for static videos like sample-video.mp4
      const path = await import('path');
      const filePath = path.join(process.cwd(), 'uploads', id);
      
      if (fs.existsSync(filePath)) {
        const stat = fs.statSync(filePath);
        const fileSize = stat.size;
        const range = req.headers.range;

        if (range) {
          const parts = range.replace(/bytes=/, '').split('-');
          const start = parseInt(parts[0], 10);
          const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
          const chunkSize = (end - start) + 1;
          const file = fs.createReadStream(filePath, {start, end});
          const head = {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunkSize,
            'Content-Type': 'video/mp4',
          };
          res.writeHead(206, head);
          file.pipe(res);
        } else {
          const head = {
            'Content-Length': fileSize,
            'Content-Type': 'video/mp4',
          };
          res.writeHead(200, head);
          fs.createReadStream(filePath).pipe(res);
        }
        return;
      } else {
        return res.status(404).json({ message: 'Static video not found' });
      }
    }
    const video = await Video.findById(id);
    if (!video) return res.status(404).json({ message: 'Video not found' });

    if (!mongoose.Types.ObjectId.isValid(video.filename)) {
      return res.status(400).json({ message: 'Invalid video file ID' });
    }

    const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
      bucketName: 'videos',
    });

    const fileId = new mongoose.Types.ObjectId(video.filename);
    const files = await bucket.find({ _id: fileId }).toArray();
    
    if (!files || files.length === 0) {
      return res.status(404).json({ message: 'File missing in database' });
    }

    const fileSize = files[0].length;
    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunkSize = end - start + 1;

      const head = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
        'Content-Type': video.contentType || 'video/mp4',
      };

      res.writeHead(206, head);
      
      const downloadStream = bucket.openDownloadStream(fileId, {
        start,
        end: end + 1 // end is exclusive in GridFSBucket
      });
      
      downloadStream.pipe(res);
      
      downloadStream.on('error', (err) => {
        console.error('Stream error:', err);
        res.end();
      });
    } else {
      res.writeHead(200, {
        'Content-Length': fileSize,
        'Content-Type': video.contentType || 'video/mp4',
      });
      
      const downloadStream = bucket.openDownloadStream(fileId);
      downloadStream.pipe(res);
      
      downloadStream.on('error', (err) => {
        console.error('Stream error:', err);
        res.end();
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/videos - admin upload to GridFS
export const uploadVideo = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'teacher') {
      return res.status(403).json({ message: 'Access denied: teachers only' });
    }

    const { title, description } = req.body;
    const file = req.file;
    if (!file) return res.status(400).json({ message: 'No file uploaded' });

    const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
      bucketName: 'videos',
    });

    const uploadStream = bucket.openUploadStream(file.originalname, {
      contentType: file.mimetype,
    });

    const fileStream = fs.createReadStream(file.path);
    fileStream.pipe(uploadStream);

    uploadStream.on('error', (err) => {
      console.error('GridFS upload stream error:', err);
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      return res.status(500).json({ message: 'Upload to GridFS failed' });
    });

    uploadStream.on('finish', async () => {
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);

      try {
        const video = await Video.create({
          title,
          description,
          filename: uploadStream.id.toString(),
          contentType: file.mimetype,
          uploadedBy: req.user?.id,
        });
        res.status(201).json(video);
      } catch (dbErr) {
        console.error('Database write error:', dbErr);
        // Attempt to clean up orphan GridFS file
        try {
          await bucket.delete(uploadStream.id);
        } catch (cleanupErr) {
          console.error('Cleanup orphan GridFS file failed:', cleanupErr);
        }
        res.status(500).json({ message: 'Failed to save video metadata' });
      }
    });
  } catch (err) {
    console.error(err);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE /api/videos/:id - admin delete
export const deleteVideo = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'teacher') {
      return res.status(403).json({ message: 'Access denied: teachers only' });
    }

    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ message: 'Video not found' });

    if (mongoose.Types.ObjectId.isValid(video.filename)) {
      const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
        bucketName: 'videos',
      });
      try {
        await bucket.delete(new mongoose.Types.ObjectId(video.filename));
      } catch (gridfsErr) {
        console.error('GridFS file delete warning:', gridfsErr.message);
      }
    }

    await Video.findByIdAndDelete(req.params.id);
    res.sendStatus(204);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
