<?php
include '../../db.php';

$course_id = $_POST['course_id'];
$prereq_id = $_POST['prereq_course_id'];

$stmt = $conn->prepare("INSERT INTO tbl_course_prerequisite (course_id, prereq_course_id) VALUES (?, ?)");
$stmt->bind_param("ii", $course_id, $prereq_id);

if ($stmt->execute()) {
    echo json_encode(["status" => "success"]);
} else {
    echo json_encode(["status" => "error", "message" => $stmt->error]);
}
?>
