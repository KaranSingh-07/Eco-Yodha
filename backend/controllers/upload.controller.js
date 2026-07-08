export const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    return res.json({
      message: 'File uploaded successfully',
      file: {
        url: `/uploads/${req.file.filename}`,
        filename: req.file.originalname,
        size: req.file.size,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server Error' });
  }
};
