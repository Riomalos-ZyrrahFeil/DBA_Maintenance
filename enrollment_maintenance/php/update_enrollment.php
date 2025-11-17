<?php
include '../../db.php';
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);

$enrollment_id = $data['enrollment_id'] ?? '';
$student_id    = $data['student_id'] ?? '';
$enrollment_type = $data['enrollment_type'] ?? 'Regular';
$section_id    = $data['section_id'] ?? '';
$date_enrolled = $data['date_enrolled'] ?? '';
$status        = $data['status'] ?? '';
$letter_grade  = $data['letter_grade'] ?? '';

if ($enrollment_id && $student_id && $section_id && $date_enrolled && $status) {

    $stmt = $conn->prepare("UPDATE tbl_enrollment SET student_id=?, enrollment_type=?, section_id=?, date_enrolled=?, status=?, letter_grade=? WHERE enrollment_id=?");
    $stmt->bind_param("isssssi", $student_id, $enrollment_type, $section_id, $date_enrolled, $status, $letter_grade, $enrollment_id); // 🆕 Updated binding

    if ($stmt->execute()) {
        echo json_encode(["status" => "success", "message" => "Enrollment updated successfully."]);
    } else {
        echo json_encode(["status" => "error", "message" => "Failed to update enrollment: " . $stmt->error]);
    }

    $stmt->close();
} else {
    echo json_encode(["status" => "error", "message" => "Missing required fields."]);
}
$conn->close();
?>