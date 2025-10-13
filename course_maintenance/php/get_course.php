<?php
include '../../db.php';

// Get parameters safely
$search = isset($_GET['search']) ? trim($_GET['search']) : '';
$sort_by = isset($_GET['sort_by']) ? $_GET['sort_by'] : 'course_id';
$order = isset($_GET['order']) && strtolower($_GET['order']) === 'asc' ? 'ASC' : 'DESC';
$id = isset($_GET['id']) ? intval($_GET['id']) : 0;

// ✅ Whitelist valid sortable columns (prevents SQL injection)
$valid_columns = ['course_id', 'course_code', 'title', 'lecture_hours', 'lab_hours', 'units'];
if (!in_array($sort_by, $valid_columns)) {
    $sort_by = 'course_id';
}

// ✅ Fetch single course by ID
if ($id > 0) {
    $stmt = $conn->prepare("
        SELECT * 
        FROM tbl_course 
        WHERE course_id = ? 
          AND is_deleted = 0
        LIMIT 1
    ");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();
    $course = $result->fetch_assoc();

    echo json_encode($course ?: []);
    exit;
}

// ✅ Fetch all courses (not deleted), with search + sorting
$sql = "
    SELECT * 
    FROM tbl_course 
    WHERE is_deleted = 0 
      AND (course_code LIKE ? OR title LIKE ?)
    ORDER BY $sort_by $order
";

$stmt = $conn->prepare($sql);
$searchParam = "%{$search}%";
$stmt->bind_param("ss", $searchParam, $searchParam);
$stmt->execute();
$result = $stmt->get_result();

$courses = [];
while ($row = $result->fetch_assoc()) {
    $courses[] = $row;
}

// ✅ Return JSON response
header('Content-Type: application/json');
echo json_encode($courses);
?>
