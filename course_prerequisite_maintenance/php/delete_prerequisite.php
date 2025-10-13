<?php
include '../../db.php';

$course_id = $_POST['course_id'];
$prereq_id = $_POST['prereq_course_id'];

$stmt = $conn->prepare("DELETE FROM tbl_course_prerequisite WHERE course_id = ? AND prereq_course_id = ?");
$stmt->bind_param("ii", $course_id, $prereq_id);

if ($stmt->execute()) {
    echo json_encode(["status" => "success"]);
} else {
    echo json_encode(["status" => "error", "message" => $stmt->error]);
}
?>
