<?php
include '../../db.php';

if (isset($_GET['id'])) {
    // Get single course
    $id = $_GET['id'];
    $stmt = $conn->prepare("SELECT * FROM tbl_course WHERE course_id = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();
    $course = $result->fetch_assoc();
    echo json_encode($course);
} else {
    // Get all courses
    $result = $conn->query("SELECT * FROM tbl_course ORDER BY course_id DESC");
    $courses = [];
    while ($row = $result->fetch_assoc()) {
        $courses[] = $row;
    }
    echo json_encode($courses);
}
?>
