<?php
include '../../db.php';

$search = isset($_GET['search']) ? $_GET['search'] : '';
$sort_by = isset($_GET['sort_by']) ? $_GET['sort_by'] : 'course_id';
$order = isset($_GET['order']) && strtolower($_GET['order']) === 'asc' ? 'ASC' : 'DESC';

// ✅ Fetch a single course by ID (only if not deleted)
if (isset($_GET['id'])) {
    $id = intval($_GET['id']);
    $stmt = $conn->prepare("SELECT * FROM tbl_course WHERE course_id = ? AND is_deleted = 0");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();
    $course = $result->fetch_assoc();
    echo json_encode($course);
    exit;
}

// ✅ Fetch all courses (not deleted) with optional search & sorting
$sql = "SELECT * FROM tbl_course 
        WHERE is_deleted = 0 
        AND (course_code LIKE ? OR title LIKE ?)
        ORDER BY $sort_by $order";

$stmt = $conn->prepare($sql);
$searchParam = "%$search%";
$stmt->bind_param("ss", $searchParam, $searchParam);
$stmt->execute();
$result = $stmt->get_result();

$courses = [];
while ($row = $result->fetch_assoc()) {
    $courses[] = $row;
}

echo json_encode($courses);
?>
