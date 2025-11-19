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
      .populate("instructor", "name email role")       // full instructor info
      .populate("category", "name slug description"); // full category info

    // Map to return category as an array (even if one)
    const mappedCourses = courses.map(course => ({
      ...course.toObject(),
      category: course.category ? [course.category] : [],
      instructor: course.instructor ? course.instructor : null
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
        instructor: course.instructor ? course.instructor : null
      }
    });
  } catch (err) {
    next(err);
  }
};

// Create course (instructor or admin)
exports.create = async (req, res, next) => {
  try {
    const payload = req.body;

    // If instructor, assign themselves
    if (req.user.role === "instructor") {
      payload.instructor = req.user.id;
    }

    // If admin, they must provide an instructor
    if (req.user.role === "admin") {
      if (!payload.instructor) {
        return res.status(400).json({ msg: "Admin must provide an instructor ID" });
      }
    }

    // If category is sent as name, convert to ID
    if (payload.category) {
      const cat = await Category.findOne({ name: payload.category });
      if (!cat) return res.status(400).json({ msg: "Category not found" });
      payload.category = cat._id;
    } else {
      return res.status(400).json({ msg: "Category is required" });
    }

    // Calculate total modules & duration
    payload.totalModules = payload.modules ? payload.modules.length : 0;
    payload.totalDuration = payload.modules
      ? payload.modules.reduce((sum, m) => sum + (m.duration || 0), 0)
      : 0;

    // Create course
    const createdCourse = await Course.create(payload);

    // Re-query to populate instructor & category
    const courseWithPopulate = await Course.findById(createdCourse._id)
      .populate("instructor", "name email role")
      .populate("category", "name slug description");

    // Return response with category as array
    res.status(201).json({
      success: true,
      course: {
        ...courseWithPopulate.toObject(),
        category: courseWithPopulate.category ? [courseWithPopulate.category] : [],
        instructor: courseWithPopulate.instructor || null
      }
    });
  } catch (err) {
    next(err);
  }
};


// Update course (instructor owns course or admin)
exports.update = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ msg: "Not found" });

    if (
      req.user.role !== "admin" &&
      course.instructor.toString() !== req.user.id
    ) {
      return res.status(403).json({ msg: "Forbidden" });
    }

    Object.assign(course, req.body);

    if (req.body.modules) {
      course.totalModules = req.body.modules.length;
      course.totalDuration = req.body.modules.reduce(
        (sum, m) => sum + (m.duration || 0),
        0
      );
    }

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
