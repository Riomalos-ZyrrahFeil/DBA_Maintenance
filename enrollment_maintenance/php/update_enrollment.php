<?php
include '../../db.php';

$data = json_decode(file_get_contents('php://input'), true);

$enrollment_id = $data['enrollment_id'] ?? '';
$date_enrolled = $data['date_enrolled'] ?? '';
$status = $data['status'] ?? '';
$letter_grade = $data['letter_grade'] ?? '';

if ($enrollment_id && $date_enrolled && $status && $letter_grade) {
    $stmt = $conn->prepare("UPDATE tbl_enrollment SET date_enrolled = ?, status = ?, letter_grade = ? WHERE enrollment_id = ?");
    $stmt->bind_param("sssi", $date_enrolled, $status, $letter_grade, $enrollment_id);

    if ($stmt->execute()) {
        echo json_encode(["status" => "success", "message" => "Enrollment updated successfully."]);
    } else {
        echo json_encode(["status" => "error", "message" => "Failed to update enrollment."]);
    }

    $stmt->close();
} else {
    echo json_encode(["status" => "error", "message" => "Missing required fields."]);
}
?>
