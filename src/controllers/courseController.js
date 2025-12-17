const Course = require("../models/Course");
const Category = require("../models/Category");

// List all published courses (with pagination, search)
exports.list = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const query = search
      ? { title: { $regex: search, $options: "i" }, published: true }
      : { published: true };

    const courses = await Course.find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate("instructor", "name email role") // full instructor info
      .populate("category", "name slug description"); // full category info

    // Map to return category as an array (even if one)
    const mappedCourses = courses.map((course) => ({
      ...course.toObject(),
      category: course.category ? [course.category] : [],
      instructor: course.instructor ? course.instructor : null,
    }));

    res.json({ success: true, courses: mappedCourses });
  } catch (err) {
    next(err);
  }
};

// Get single course by ID
exports.get = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate("instructor", "name email role")
      .populate("category", "name slug description");

    if (!course) return res.status(404).json({ msg: "Course not found" });

    res.json({
      success: true,
      course: {
        ...course.toObject(),
        category: course.category ? [course.category] : [],
        instructor: course.instructor ? course.instructor : null,
      },
    });
  } catch (err) {
    next(err);
  }
};

// Create course (instructor or admin)
exports.create = async (req, res, next) => {
  try {
    const payload = req.body;

    if (req.user.role === "instructor") payload.instructor = req.user.id;

    if (req.user.role === "admin" && !payload.instructor)
      return res
        .status(400)
        .json({ msg: "Admin must provide an instructor ID" });

    if (!payload.category)
      return res.status(400).json({ msg: "Category is required" });

    const cat = await Category.findById(payload.category);
    if (!cat) return res.status(400).json({ msg: "Category not found" });

    payload.totalModules = payload.modules ? payload.modules.length : 0;
    payload.totalDuration = payload.modules
      ? payload.modules.reduce((sum, m) => sum + (m.duration || 0), 0)
      : 0;

    // ✅ Add bannerUrl and thumbnails if present
    if (payload.bannerUrl) payload.bannerUrl = payload.bannerUrl;
    if (payload.thumbnails) payload.thumbnails = payload.thumbnails;

    const createdCourse = await Course.create(payload);

    const courseWithPopulate = await Course.findById(createdCourse._id)
      .populate("instructor", "name email role")
      .populate("category", "name slug description");

    res.status(201).json({
      success: true,
      course: {
        ...courseWithPopulate.toObject(),
        category: courseWithPopulate.category
          ? [courseWithPopulate.category]
          : [],
        instructor: courseWithPopulate.instructor || null,
      },
    });
  } catch (err) {
    next(err);
  }
};
// Update course
exports.update = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ msg: "Not found" });

    if (req.user.role !== "admin" && course.instructor.toString() !== req.user.id)
      return res.status(403).json({ msg: "Forbidden" });

    Object.assign(course, req.body);

    if (req.body.modules) {
      course.totalModules = req.body.modules.length;
      course.totalDuration = req.body.modules.reduce(
        (sum, m) => sum + (m.duration || 0),
        0
      );
    }

    // ✅ Update bannerUrl and thumbnails
if (req.body.bannerUrl !== undefined) course.bannerUrl = req.body.bannerUrl;
if (req.body.thumbnails !== undefined) course.thumbnails = req.body.thumbnails;

    course.updatedAt = new Date();
    await course.save();
    res.json({ success: true, course });
  } catch (err) {
    next(err);
  }
};

// Delete course (instructor owns course or admin)
exports.remove = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ msg: "Not found" });

    if (
      req.user.role !== "admin" &&
      course.instructor.toString() !== req.user.id
    ) {
      return res.status(403).json({ msg: "Forbidden" });
    }

    await course.deleteOne();
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};
