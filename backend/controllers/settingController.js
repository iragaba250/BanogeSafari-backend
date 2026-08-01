import Setting from '../models/Setting.js';

export const getSettings = async (req, res) => {
  try {
    const settings = await Setting.find();
    const map = {};
    settings.forEach((s) => {
      map[s.key] = s.value;
    });
    res.json({ settings: map });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateSetting = async (req, res) => {
  try {
    const { key, value } = req.body;
    if (!key) {
      return res.status(400).json({ message: 'Key is required' });
    }
    const setting = await Setting.findOneAndUpdate(
      { key },
      { value },
      { upsert: true, new: true }
    );
    res.json({ setting });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateSettings = async (req, res) => {
  try {
    const { settings } = req.body;
    if (!settings || typeof settings !== 'object' || Array.isArray(settings)) {
      return res.status(400).json({ message: 'A settings object is required' });
    }

    const ops = Object.entries(settings).map(([key, value]) => ({
      updateOne: {
        filter: { key },
        update: { key, value },
        upsert: true,
      },
    }));

    if (ops.length) await Setting.bulkWrite(ops);

    const all = await Setting.find();
    const map = {};
    all.forEach((s) => {
      map[s.key] = s.value;
    });
    res.json({ settings: map });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
